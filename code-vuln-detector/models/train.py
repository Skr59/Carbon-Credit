"""
Fine-tuning pipeline for the CodeBERT vulnerability classifier.

Usage::

    python -m models.train --source builtin --epochs 3
    python -m models.train --source hf --limit 5000 --epochs 4

Produces a checkpoint under ``artifacts/codebert-vuln`` plus a JSON metrics
report alongside it.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from config import CONFIG
from data import build_dataset, save_jsonl
from evaluation import classification_metrics, format_metrics

from .heuristic import HeuristicClassifier


def _compute_class_weights(labels):
    n = len(labels)
    pos = sum(1 for x in labels if int(x) == 1)
    neg = n - pos
    if pos == 0 or neg == 0:
        return None
    # Inverse-frequency weighting.
    w_pos = n / (2.0 * pos)
    w_neg = n / (2.0 * neg)
    return [w_neg, w_pos]


def train(args: argparse.Namespace) -> dict:
    dataset = build_dataset(source=args.source, limit=args.limit, augment=args.augment)
    train_ds, val_ds, test_ds = dataset.split(
        train=CONFIG.data.train_ratio, val=CONFIG.data.val_ratio, seed=CONFIG.train.seed
    )
    print(
        f"dataset={args.source}  total={len(dataset)}  "
        f"train={len(train_ds)} val={len(val_ds)} test={len(test_ds)}"
    )
    print(f"class balance: {dataset.class_balance()}")

    results: dict = {"config": vars(args)}

    if args.backend == "heuristic":
        clf = HeuristicClassifier().fit(train_ds.texts(), train_ds.labels())
        val_probs = clf.predict_proba_batch(val_ds.texts())
        val_metrics = classification_metrics(val_ds.labels(), val_probs)
        test_probs = clf.predict_proba_batch(test_ds.texts())
        test_metrics = classification_metrics(test_ds.labels(), test_probs)
        out = Path(CONFIG.train.output_dir) / "heuristic.joblib"
        clf.save(out)
        results.update(
            {"backend": "heuristic", "val": val_metrics, "test": test_metrics}
        )
        print("VAL :", format_metrics(val_metrics))
        print("TEST:", format_metrics(test_metrics))
        print(f"Saved fallback model -> {out}")
    else:
        from .codebert_classifier import VulnerabilityClassifier

        clf = VulnerabilityClassifier()
        clf.build()
        train_cfg = CONFIG.train
        train_cfg.epochs = args.epochs
        train_cfg.batch_size = args.batch_size
        history = clf.fit(
            train_ds.texts(),
            train_ds.labels(),
            val_ds.texts(),
            val_ds.labels(),
            train_config=train_cfg,
            class_weights=_compute_class_weights(train_ds.labels()),
        )
        test_probs = clf.predict_proba_batch(test_ds.texts())
        test_metrics = classification_metrics(test_ds.labels(), test_probs)
        clf.save(CONFIG.train.output_dir)
        results.update(
            {"backend": "transformer", "history": history, "test": test_metrics}
        )
        print("History:", json.dumps(history, indent=2))
        print("TEST :", format_metrics(test_metrics))
        print(f"Saved CodeBERT checkpoint -> {CONFIG.train.output_dir}")

    report_path = Path(CONFIG.train.output_dir) / "metrics.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Metrics report -> {report_path}")

    # Persist the split used, for reproducibility / the evaluation script.
    save_jsonl(test_ds.records, CONFIG.data.processed_dir / "test_split.jsonl")
    return results


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Train the vulnerability detector.")
    p.add_argument(
        "--backend",
        choices=["transformer", "heuristic"],
        default="heuristic",
        help="transformer = CodeBERT fine-tuning; heuristic = offline TF-IDF.",
    )
    p.add_argument(
        "--source",
        choices=["builtin", "hf"],
        default="builtin",
        help="builtin corpus or HuggingFace CodeXGLUE (Devign).",
    )
    p.add_argument("--limit", type=int, default=None)
    p.add_argument("--epochs", type=int, default=CONFIG.train.epochs)
    p.add_argument("--batch-size", type=int, default=CONFIG.train.batch_size)
    p.add_argument("--augment", action="store_true")
    return p


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    try:
        train(args)
    except ImportError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        print(
            "Hint: install ML deps with `pip install -r requirements.txt` or run "
            "with --backend heuristic.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
