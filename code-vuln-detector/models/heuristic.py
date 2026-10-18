"""
Lightweight offline classifier.

When a fine-tuned CodeBERT checkpoint is unavailable (e.g. during a quick demo
or in CI), this TF-IDF + Logistic Regression model provides a fast, dependency
light fallback that still learns from the same labelled corpus. It exposes the
same ``predict_proba`` surface as :class:`VulnerabilityClassifier`.
"""
from __future__ import annotations

from pathlib import Path
from typing import List, Optional, Sequence

from data import build_dataset


class HeuristicClassifier:
    """Character + word TF-IDF pipeline trained on the built-in corpus."""

    def __init__(self) -> None:
        self.pipeline = None
        self._trained = False

    def build(self) -> "HeuristicClassifier":
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.pipeline import Pipeline

        self.pipeline = Pipeline(
            steps=[
                (
                    "tfidf",
                    TfidfVectorizer(
                        analyzer="word",
                        ngram_range=(1, 3),
                        sublinear_tf=True,
                        min_df=1,
                    ),
                ),
                (
                    "clf",
                    LogisticRegression(
                        max_iter=1000,
                        class_weight="balanced",
                        C=4.0,
                    ),
                ),
            ]
        )
        return self

    def fit(
        self,
        texts: Optional[Sequence[str]] = None,
        labels: Optional[Sequence[int]] = None,
    ) -> "HeuristicClassifier":
        if self.pipeline is None:
            self.build()
        if texts is None or labels is None:
            records = build_dataset("builtin", augment=True).records
            texts = [str(r["code"]) for r in records]
            labels = [int(r["label"]) for r in records]
        self.pipeline.fit(list(texts), list(labels))
        self._trained = True
        return self

    @property
    def is_ready(self) -> bool:
        return self.pipeline is not None and self._trained

    def predict_proba(self, code: str) -> float:
        return self.predict_proba_batch([code])[0]

    def predict_proba_batch(self, codes: Sequence[str]) -> List[float]:
        if not self.is_ready:
            raise RuntimeError("HeuristicClassifier not trained. Call fit().")
        probs = self.pipeline.predict_proba(list(codes))
        # Column order follows sorted classes [0, 1]; index 1 => vulnerable.
        return [float(p[1]) for p in probs]

    def save(self, path: str | Path) -> None:
        import joblib

        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.pipeline, path)

    @classmethod
    def load(cls, path: str | Path) -> "HeuristicClassifier":
        import joblib

        obj = cls()
        obj.pipeline = joblib.load(path)
        obj._trained = True
        return obj
