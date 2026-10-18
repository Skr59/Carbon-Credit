"""
Evaluation metrics for vulnerability classification.

Wraps scikit-learn to produce a consistent metric bundle used during training,
the standalone evaluation script and the tests.
"""
from __future__ import annotations

from typing import Dict, List, Optional, Sequence


def classification_metrics(
    y_true: Sequence[int],
    y_score: Sequence[float],
    threshold: float = 0.5,
) -> Dict[str, float]:
    """Return accuracy, precision, recall, F1, ROC-AUC and confusion counts.

    ``y_score`` is P(vulnerable). Labels are derived with ``threshold``.
    """
    import numpy as np
    from sklearn.metrics import (
        accuracy_score,
        confusion_matrix,
        f1_score,
        precision_score,
        recall_score,
        roc_auc_score,
    )

    y_true_arr = np.asarray(list(y_true), dtype=int)
    y_score_arr = np.asarray(list(y_score), dtype=float)
    y_pred = (y_score_arr >= threshold).astype(int)

    metrics: Dict[str, float] = {
        "accuracy": float(accuracy_score(y_true_arr, y_pred)),
        "precision": float(
            precision_score(y_true_arr, y_pred, zero_division=0)
        ),
        "recall": float(recall_score(y_true_arr, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true_arr, y_pred, zero_division=0)),
        "threshold": float(threshold),
    }

    try:
        metrics["roc_auc"] = float(roc_auc_score(y_true_arr, y_score_arr))
    except ValueError:
        # Only one class present in y_true.
        metrics["roc_auc"] = float("nan")

    cm = confusion_matrix(y_true_arr, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    metrics.update(
        {
            "true_negative": int(tn),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_positive": int(tp),
        }
    )
    return metrics


def best_threshold(
    y_true: Sequence[int],
    y_score: Sequence[float],
    metric: str = "f1",
) -> tuple[float, float]:
    """Sweep thresholds and return the (threshold, best_score) for ``metric``."""
    best_t, best_v = 0.5, -1.0
    for t in [i / 100 for i in range(5, 96)]:
        m = classification_metrics(y_true, y_score, threshold=t)
        v = m.get(metric, 0.0)
        if v > best_v:
            best_t, best_v = t, v
    return best_t, best_v


def format_metrics(metrics: Dict[str, float]) -> str:
    """Human-readable multi-line summary."""
    keys = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    parts = [f"{k}={metrics.get(k, float('nan')):.4f}" for k in keys]
    parts.append(
        "cm[tn,fp,fn,tp]="
        f"[{metrics.get('true_negative')},{metrics.get('false_positive')},"
        f"{metrics.get('false_negative')},{metrics.get('true_positive')}]"
    )
    return "  ".join(parts)
