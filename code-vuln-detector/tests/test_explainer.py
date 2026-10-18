"""Tests for the explainer / report builder."""
from __future__ import annotations

from explanation import Explainer, TokenAttribution


def test_report_marks_vulnerable_on_critical_rule():
    ex = Explainer()
    code = 'os.system("ls " + x)'
    report = ex.analyse(code, "python", vulnerability_probability=0.2)
    assert report.is_vulnerable is True
    assert report.risk_level == "CRITICAL"
    assert "CWE-78" in report.cwe_ids
    assert report.findings


def test_report_safe_when_no_signals():
    ex = Explainer()
    report = ex.analyse("def add(a, b):\n    return a + b", "python", 0.05)
    assert report.is_vulnerable is False
    assert report.findings == []
    assert "SAFE" in report.summary or "safe" in report.summary.lower()


def test_report_high_probability_without_rules():
    ex = Explainer()
    report = ex.analyse("some weird code", "python", vulnerability_probability=0.95)
    assert report.is_vulnerable is True
    assert report.risk_level in {"HIGH", "CRITICAL"}


def test_token_attributions_serialised():
    ex = Explainer()
    report = ex.analyse(
        'os.system("ls " + x)',
        "python",
        0.9,
        token_attributions=[TokenAttribution("os", 0.8), TokenAttribution("system", 0.7)],
    )
    assert report.top_tokens[0]["token"] == "os"
    assert report.to_dict()["top_tokens"][1]["token"] == "system"


def test_summary_mentions_remediation():
    ex = Explainer()
    report = ex.analyse('os.system("ls " + x)', "python", 0.9)
    assert "Recommended fix" in report.summary
