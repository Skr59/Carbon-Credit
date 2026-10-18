"""Model package: CodeBERT classifier, offline fallback and detection facade."""
from .detector import CodeVulnerabilityDetector, get_detector, set_detector

__all__ = [
    "CodeVulnerabilityDetector",
    "get_detector",
    "set_detector",
]
