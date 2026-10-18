"""Tests for the unified detector facade."""
from __future__ import annotations

from models.detector import CodeVulnerabilityDetector


def test_backend_is_available():
    det = CodeVulnerabilityDetector(backend="heuristic")
    assert det.backend == "heuristic"


def test_detector_flags_command_injection(detector):
    report = detector.analyse('import os\nos.system("ls " + x)', "python")
    assert report.is_vulnerable
    assert "CWE-78" in report.cwe_ids


def test_detector_language_autodetect(detector):
    report = detector.analyse("#include <stdio.h>\nint main(){return 0;}")
    assert report.language == "c"


def test_detector_to_dict(detector):
    d = detector.analyse_to_dict("def f():\n    return 1", "python")
    assert set(
        ["is_vulnerable", "probability", "risk_level", "summary", "findings"]
    ).issubset(d.keys())


def test_detector_batch_classify(detector):
    probs = detector.classify_batch(["def f(): pass", 'os.system("x")'])
    assert len(probs) == 2
    assert all(0.0 <= p <= 1.0 for p in probs)
