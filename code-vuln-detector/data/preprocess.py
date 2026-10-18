"""
Language detection and lightweight code preprocessing utilities.

The tokenizer for CodeBERT accepts raw text, so preprocessing focuses on
normalisation and trimming rather than tokenisation. We also provide a small
heuristic language detector used by the API when the client does not supply a
language hint.
"""
from __future__ import annotations

import re
from typing import Optional

# Ordered list of (language, list-of-signal-patterns). First hit wins; more
# specific languages are checked before more generic ones.
_LANGUAGE_SIGNALS = [
    ("cpp", [r"#include\s*<iostream>", r"std::", r"#include\s*<vector>", r"using\s+namespace\s+std"]),
    ("c", [r"#include\s*<stdio\.h>", r"#include\s*<stdlib\.h>", r"\bprintf\s*\(", r"\bmalloc\s*\("]),
    ("java", [r"\bpublic\s+class\b", r"System\.out\.println", r"\bimport\s+java\.", r"\bpublic\s+static\s+void\s+main\b"]),
    ("javascript", [r"\bconst\s+\w+\s*=", r"\blet\s+\w+\s*=", r"=>", r"\brequire\s*\(", r"console\.log", r"document\.", r"module\.exports"]),
    ("python", [r"^\s*def\s+\w+\s*\(", r"^\s*import\s+\w+", r"^\s*from\s+\w+\s+import", r"print\s*\(", r":\s*$"]),
]


def detect_language(code: str) -> str:
    """Best-effort language detection. Defaults to ``python``."""
    if not code or not code.strip():
        return "python"
    for lang, patterns in _LANGUAGE_SIGNALS:
        for pat in patterns:
            if re.search(pat, code, re.MULTILINE):
                return lang
    return "python"


def normalise(code: str, max_chars: int = 200_000) -> str:
    """Trim, strip null bytes and clamp length for safe downstream processing."""
    if not code:
        return ""
    code = code.replace("\x00", "")
    if len(code) > max_chars:
        code = code[:max_chars]
    return code


def strip_comments(code: str, language: Optional[str] = None) -> str:
    """Remove line comments. Best-effort; preserves line numbering."""
    lang = (language or detect_language(code)).lower()
    if lang in {"python"}:
        return _strip_line_comments(code, "#")
    if lang in {"c", "cpp", "java", "javascript"}:
        code = _strip_block_comments(code)
        return _strip_line_comments(code, "//")
    return code


def _strip_line_comments(code: str, marker: str) -> str:
    out_lines = []
    for line in code.splitlines(keepends=True):
        idx = _find_comment(line, marker)
        if idx < 0:
            out_lines.append(line)
            continue
        # Preserve the original line ending after the cut point.
        ending = ""
        if line.endswith("\r\n"):
            ending = "\r\n"
        elif line.endswith("\n") or line.endswith("\r"):
            ending = line[-1]
        out_lines.append(line[:idx] + ending)
    return "".join(out_lines)


def _find_comment(line: str, marker: str) -> int:
    in_single = in_double = False
    i = 0
    while i < len(line):
        ch = line[i]
        if ch == "\\" and (in_single or in_double):
            i += 2
            continue
        if ch == "'" and not in_double:
            in_single = not in_single
        elif ch == '"' and not in_single:
            in_double = not in_double
        elif not in_single and not in_double and line.startswith(marker, i):
            return i
        i += 1
    return -1


def _strip_block_comments(code: str) -> str:
    """Replace /* ... */ with spaces, preserving line count."""
    def repl(match: re.Match[str]) -> str:
        text = match.group(0)
        return "\n" * text.count("\n")

    return re.sub(r"/\*.*?\*/", repl, code, flags=re.DOTALL)
