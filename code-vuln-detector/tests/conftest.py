"""Shared pytest fixtures and path setup."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import pytest  # noqa: E402

from models.detector import CodeVulnerabilityDetector, set_detector  # noqa: E402


@pytest.fixture(scope="session")
def detector() -> CodeVulnerabilityDetector:
    det = CodeVulnerabilityDetector(backend="heuristic")
    set_detector(det)
    return det
