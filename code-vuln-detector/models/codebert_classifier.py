"""
CodeBERT-based vulnerability classifier.

Wraps a HuggingFace encoder (``microsoft/codebert-base`` by default) with a
lightweight classification head. Exposes high-level ``fit`` / ``predict`` /
``predict_proba`` methods so the rest of the system treats it as a black box
that maps source code -> vulnerability probability.

Torch / transformers are imported lazily so that lightweight parts of the
project (API schemas, rule engine, tests) can be imported without the heavy
ML dependencies installed.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Sequence, Tuple

from config import CONFIG, ModelConfig, TrainConfig


@dataclass
class Prediction:
    label: int
    label_name: str
    probability: float
    logits: List[float]


def _require_torch():
    try:
        import torch  # noqa: F401
        from torch import nn  # noqa: F401
        from torch.utils.data import Dataset  # noqa: F401
    except Exception as exc:  # pragma: no cover
        raise ImportError(
            "PyTorch and transformers are required for model operations. "
            "Install with: pip install torch transformers"
        ) from exc


# --------------------------------------------------------------------------- #
# Torch Dataset
# --------------------------------------------------------------------------- #
class CodeDataset:
    """Lazy torch Dataset wrapper. Instantiated only when torch is present."""

    def __init__(
        self,
        texts: Sequence[str],
        labels: Sequence[int],
        tokenizer,
        max_length: int,
    ) -> None:
        _require_torch()
        import torch
        from torch.utils.data import Dataset

        # Dynamically build a proper subclass to keep torch optional at import.
        self._torch = torch

        class _DS(Dataset):
            def __init__(self, texts, labels, tokenizer, max_length):
                self.texts = list(texts)
                self.labels = list(labels)
                self.tokenizer = tokenizer
                self.max_length = max_length

            def __len__(self):
                return len(self.texts)

            def __getitem__(self, idx):
                enc = self.tokenizer(
                    self.texts[idx],
                    truncation=True,
                    padding="max_length",
                    max_length=self.max_length,
                    return_tensors="pt",
                )
                item = {k: v.squeeze(0) for k, v in enc.items()}
                item["labels"] = torch.tensor(int(self.labels[idx]), dtype=torch.long)
                return item

        self._ds = _DS(texts, labels, tokenizer, max_length)

    def __len__(self) -> int:
        return len(self._ds)

    def __getitem__(self, idx):
        return self._ds[idx]


# --------------------------------------------------------------------------- #
# Classifier
# --------------------------------------------------------------------------- #
class VulnerabilityClassifier:
    """High-level wrapper around a fine-tuned CodeBERT sequence classifier."""

    def __init__(self, model_config: Optional[ModelConfig] = None) -> None:
        self.cfg = model_config or CONFIG.model
        self.device = None
        self.model = None
        self.tokenizer = None
        self._trained = False

    # ------------------------------------------------------------------ #
    # Construction
    # ------------------------------------------------------------------ #
    def build(self) -> "VulnerabilityClassifier":
        """Instantiate the encoder + classification head (untrained)."""
        _require_torch()
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(self.cfg.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.cfg.model_name,
            num_labels=self.cfg.num_labels,
            hidden_dropout_prob=self.cfg.dropout,
            id2label=self.cfg.id2label,
            label2id=self.cfg.label2id,
        )
        self.model.to(self.device)
        return self

    @classmethod
    def load(cls, path: str | Path) -> "VulnerabilityClassifier":
        """Load a previously saved model from ``path``."""
        _require_torch()
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"No saved model at {path}")

        obj = cls()
        obj.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        obj.tokenizer = AutoTokenizer.from_pretrained(str(path))
        obj.model = AutoModelForSequenceClassification.from_pretrained(str(path))
        obj.model.to(obj.device)
        obj.model.eval()
        obj._trained = True
        return obj

    def save(self, path: str | Path) -> None:
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Model is not built; call build()/fit() first.")
        path = Path(path)
        path.mkdir(parents=True, exist_ok=True)
        self.model.save_pretrained(str(path))
        self.tokenizer.save_pretrained(str(path))

    @property
    def is_ready(self) -> bool:
        return self.model is not None and self.tokenizer is not None

    # ------------------------------------------------------------------ #
    # Inference
    # ------------------------------------------------------------------ #
    def predict_proba(self, code: str) -> float:
        """Return P(vulnerable) for a single snippet."""
        return self.predict_proba_batch([code])[0]

    def predict_proba_batch(self, codes: Sequence[str]) -> List[float]:
        _require_torch()
        import torch

        if not self.is_ready:
            raise RuntimeError("Model not loaded. Call build()/load() first.")
        self.model.eval()
        probs: List[float] = []
        batch_size = CONFIG.train.eval_batch_size
        with torch.no_grad():
            for i in range(0, len(codes), batch_size):
                chunk = list(codes[i : i + batch_size])
                enc = self.tokenizer(
                    chunk,
                    truncation=True,
                    padding=True,
                    max_length=self.cfg.max_seq_length,
                    return_tensors="pt",
                ).to(self.device)
                logits = self.model(**enc).logits
                softmax = torch.softmax(logits, dim=-1)
                probs.extend(softmax[:, 1].cpu().tolist())
        return probs

    def predict(self, code: str, threshold: float = 0.5) -> Prediction:
        prob = self.predict_proba(code)
        label = int(prob >= threshold)
        return Prediction(
            label=label,
            label_name=self.cfg.id2label[label],
            probability=prob,
            logits=[1 - prob, prob],
        )

    # ------------------------------------------------------------------ #
    # Token attribution (integrated gradients surrogate)
    # ------------------------------------------------------------------ #
    def token_attributions(
        self, code: str, top_k: int = 15
    ) -> List[Tuple[str, float]]:
        """Return the ``top_k`` tokens ranked by gradient-based importance.

        Uses a lightweight occlusion-free heuristic when Captum is unavailable:
        the L2 norm of the token embedding's gradient w.r.t. the vulnerable logit.
        """
        _require_torch()
        import torch

        if not self.is_ready:
            return []
        self.model.eval()
        enc = self.tokenizer(
            code,
            truncation=True,
            max_length=self.cfg.max_seq_length,
            return_tensors="pt",
        ).to(self.device)
        input_ids = enc["input_ids"]
        embeddings = self.model.get_input_embeddings()(input_ids)
        embeddings.requires_grad_(True)
        outputs = self.model(
            inputs_embeds=embeddings,
            attention_mask=enc.get("attention_mask"),
        )
        score = outputs.logits[0, 1]
        self.model.zero_grad()
        score.backward()
        grads = embeddings.grad[0]
        importance = grads.norm(dim=-1)
        tokens = self.tokenizer.convert_ids_to_tokens(input_ids[0])
        pairs = list(zip(tokens, importance.detach().cpu().tolist()))
        # Drop special tokens for readability.
        specials = set(self.tokenizer.all_special_tokens or [])
        pairs = [(t, s) for t, s in pairs if t not in specials]
        pairs.sort(key=lambda x: x[1], reverse=True)
        return pairs[:top_k]

    # ------------------------------------------------------------------ #
    # Training
    # ------------------------------------------------------------------ #
    def fit(
        self,
        train_texts: Sequence[str],
        train_labels: Sequence[int],
        val_texts: Optional[Sequence[str]] = None,
        val_labels: Optional[Sequence[int]] = None,
        train_config: Optional[TrainConfig] = None,
        class_weights: Optional[Sequence[float]] = None,
    ) -> dict:
        """Fine-tune the classifier. Returns a metrics history dict."""
        _require_torch()
        import numpy as np
        import torch
        from torch.utils.data import DataLoader
        from transformers import get_linear_schedule_with_warmup

        cfg = train_config or CONFIG.train
        if not self.is_ready:
            self.build()

        torch.manual_seed(cfg.seed)
        np.random.seed(cfg.seed)

        train_ds = CodeDataset(
            train_texts, train_labels, self.tokenizer, self.cfg.max_seq_length
        )
        train_loader = DataLoader(
            train_ds, batch_size=cfg.batch_size, shuffle=True
        )
        val_loader = None
        if val_texts is not None and val_labels is not None:
            val_ds = CodeDataset(
                val_texts, val_labels, self.tokenizer, self.cfg.max_seq_length
            )
            val_loader = DataLoader(
                val_ds, batch_size=cfg.eval_batch_size, shuffle=False
            )

        weight_tensor = None
        if class_weights is not None:
            weight_tensor = torch.tensor(
                list(class_weights), dtype=torch.float, device=self.device
            )

        optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=cfg.learning_rate,
            weight_decay=cfg.weight_decay,
        )
        total_steps = max(1, len(train_loader) * cfg.epochs)
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=int(total_steps * cfg.warmup_ratio),
            num_training_steps=total_steps,
        )

        history: dict = {"train_loss": [], "val_metrics": []}
        best_f1 = -1.0
        patience = 0

        for epoch in range(cfg.epochs):
            self.model.train()
            epoch_loss = 0.0
            for batch in train_loader:
                batch = {k: v.to(self.device) for k, v in batch.items()}
                outputs = self.model(**batch)
                loss = outputs.loss
                if weight_tensor is not None:
                    logits = outputs.logits
                    loss = torch.nn.functional.cross_entropy(
                        logits, batch["labels"], weight=weight_tensor
                    )
                loss.backward()
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(), cfg.max_grad_norm
                )
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()
                epoch_loss += float(loss.detach().cpu())
            avg_loss = epoch_loss / max(1, len(train_loader))
            history["train_loss"].append(avg_loss)

            metrics = {"epoch": epoch + 1, "loss": avg_loss}
            if val_loader is not None:
                metrics.update(self._evaluate_loader(val_loader))
                history["val_metrics"].append(metrics)
                f1 = metrics.get("f1", 0.0)
                if f1 > best_f1:
                    best_f1 = f1
                    patience = 0
                    self._best_state = {
                        k: v.detach().cpu().clone()
                        for k, v in self.model.state_dict().items()
                    }
                else:
                    patience += 1
                    if patience >= cfg.early_stopping_patience:
                        history["early_stopped"] = True
                        break

        if getattr(self, "_best_state", None) is not None:
            self.model.load_state_dict(self._best_state)

        self._trained = True
        self.model.eval()
        history["best_f1"] = best_f1
        return history

    # ------------------------------------------------------------------ #
    def _evaluate_loader(self, loader) -> dict:
        import torch

        self.model.eval()
        all_probs: List[float] = []
        all_labels: List[int] = []
        with torch.no_grad():
            for batch in loader:
                labels = batch.pop("labels")
                batch = {k: v.to(self.device) for k, v in batch.items()}
                logits = self.model(**batch).logits
                probs = torch.softmax(logits, dim=-1)[:, 1]
                all_probs.extend(probs.cpu().tolist())
                all_labels.extend(labels.tolist())

        from evaluation.metrics import classification_metrics

        return classification_metrics(all_labels, all_probs)
