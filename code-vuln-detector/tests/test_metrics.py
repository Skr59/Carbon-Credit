"""Tests for evaluation metrics."""
from __future__ import annotations

from evaluation.metrics import best_threshold, classification_metrics


def test_perfect_classification():
    m = classification_metrics([0, 0, 1, 1], [0.1, 0.2, 0.8, 0.9])
    assert m["accuracy"] == 1.0
    assert m["f1"] == 1.0
    assert m["true_positive"] == 2
    assert m["true_negative"] == 2


def test_threshold_effect():
    scores = [0.4, 0.6]
    labels = [0, 1]
    # At threshold 0.5 the 0.4 score is classified safe -> correct.
    assert classification_metrics(labels, scores, threshold=0.5)["accuracy"] == 1.0
    # At threshold 0.3 both scores exceed it -> one false positive.
    assert classification_metrics(labels, scores, threshold=0.3)["accuracy"] == 0.5


def test_confusion_counts():
    m = classification_metrics([0, 1, 1, 0], [0.9, 0.2, 0.55, 0.6])
    assert m["true_negative"] + m["false_positive"] + m["false_negative"] + m["true_positive"] == 4


def test_best_threshold_returns_value():
    labels = [0, 0, 1, 1]
    scores = [0.1, 0.3, 0.6, 0.9]
    t, v = best_threshold(labels, scores, metric="f1")
    assert 0.0 <= t <= 1.0
    assert v >= 0.9
