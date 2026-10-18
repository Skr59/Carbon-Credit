"""Tests for the static rule engine."""
from __future__ import annotations

from explanation.rules import RuleEngine


def test_sql_injection_detected():
    engine = RuleEngine()
    code = 'cur.execute("SELECT * FROM users WHERE name = \'%s\'" % name)'
    findings = engine.scan(code, "python")
    assert any(f.cwe_id == "CWE-89" for f in findings)


def test_command_injection_detected():
    engine = RuleEngine()
    code = 'import os\nos.system("ls " + cmd)'
    findings = engine.scan(code, "python")
    assert any(f.cwe_id == "CWE-78" for f in findings)


def test_buffer_overflow_detected_c():
    engine = RuleEngine()
    code = "#include <string.h>\nvoid f(char *d, char *s){ strcpy(d, s); }"
    findings = engine.scan(code, "c")
    assert any(f.cwe_id == "CWE-120" for f in findings)


def test_weak_crypto_java():
    engine = RuleEngine()
    code = 'MessageDigest.getInstance("MD5");'
    findings = engine.scan(code, "java")
    assert any(f.cwe_id == "CWE-327" for f in findings)


def test_hardcoded_credential_negative_guard():
    engine = RuleEngine()
    unsafe = 'PASSWORD = "secret123"'
    safe = 'PASSWORD = os.getenv("PASSWORD")'
    assert any(f.cwe_id == "CWE-798" for f in engine.scan(unsafe, "python"))
    assert not any(f.cwe_id == "CWE-798" for f in engine.scan(safe, "python"))


def test_safe_code_no_findings():
    engine = RuleEngine()
    code = "def add(a, b):\n    return a + b"
    assert engine.scan(code, "python") == []


def test_language_filtering():
    engine = RuleEngine()
    # A C-only rule must not fire for python.
    code = "strcpy(dst, src);"
    assert engine.scan(code, "python") == []
    assert engine.scan(code, "c") != []


def test_findings_sorted_by_severity():
    engine = RuleEngine()
    code = (
        "import random\n"
        'PASSWORD = "abc12345"\n'
        'os.system("ls " + x)\n'
    )
    findings = engine.scan(code, "python")
    severities = [f.severity for f in findings]
    order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
    values = [order[s] for s in severities]
    assert values == sorted(values, reverse=True)
