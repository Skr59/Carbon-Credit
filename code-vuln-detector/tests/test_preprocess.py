"""Tests for preprocessing utilities."""
from __future__ import annotations

from data.preprocess import detect_language, normalise, strip_comments


def test_detect_python():
    assert detect_language("def foo():\n    return 1\n") == "python"


def test_detect_c():
    assert detect_language("#include <stdio.h>\nint main(){ printf(\"hi\"); }") == "c"


def test_detect_java():
    assert detect_language("public class A { public static void main(String[] a){} }") == "java"


def test_detect_javascript():
    assert detect_language("const x = 1; console.log(x);") == "javascript"


def test_normalise_strips_nulls_and_truncates():
    out = normalise("a\x00b" + "x" * 100, max_chars=10)
    assert "\x00" not in out
    assert len(out) <= 11  # "ab" + 9 x's


def test_strip_python_comments():
    code = "x = 1  # comment\ny = 2\n"
    out = strip_comments(code, "python")
    assert "comment" not in out
    assert "x = 1" in out
    assert out.count("\n") == code.count("\n")


def test_strip_c_block_comments_preserves_lines():
    code = "int a;\n/* multi\n line */\nint b;\n"
    out = strip_comments(code, "c")
    assert "multi" not in out
    assert out.count("\n") == code.count("\n")
