"""
Unified detection facade.

``CodeVulnerabilityDetector`` is the single entry point used by the API, the CLI
and the UI. It decides at construction time which backend to use:

* ``transformer`` - a fine-tuned CodeBERT checkpoint under ``artifacts/``.
* ``heuristic``   - the offline TF-IDF fallback (default when no checkpoint).

It then fuses the classifier probability with the deterministic rule engine via
:class:`explanation.Explainer` to produce a full :class:`VulnerabilityReport`.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional

from config import CONFIG
from data import detect_language, normalise
from explanation import Explainer, TokenAttribution, VulnerabilityReport
from explanation.rules import RuleEngine


class CodeVulnerabilityDetector:
    """High-level orchestrator: model + rules + explanations."""

    def __init__(
        self,
        backend: str = "auto",
        model_path: Optional[str] = None,
        enable_attribution: bool = True,
    ) -> None:
        self.model_path = Path(model_path or CONFIG.api.model_path)
        self.explainer = Explainer(RuleEngine())
        self.enable_attribution = enable_attribution
        self.backend_name = "heuristic"
        self._model = None
        self._load_backend(backend)

    # ------------------------------------------------------------------ #
    def _load_backend(self, backend: str) -> None:
        want_transformer = backend in ("auto", "transformer")
        if want_transformer and self.model_path.exists():
            try:
                from models.codebert_classifier import VulnerabilityClassifier

                self._model = VulnerabilityClassifier.load(self.model_path)
                self.backend_name = "transformer"
                return
            except Exception:
                # Fall through to heuristic if loading fails for any reason.
                pass

        from models.heuristic import HeuristicClassifier

        self._model = HeuristicClassifier().fit()
        self.backend_name = "heuristic"

    # ------------------------------------------------------------------ #
    @property
    def backend(self) -> str:
        return self.backend_name

    def classify(self, code: str) -> float:
        """Return P(vulnerable) from the active backend."""
        return float(self._model.predict_proba(code))

    def classify_batch(self, codes: List[str]) -> List[float]:
        return [float(p) for p in self._model.predict_proba_batch(codes)]

    # ------------------------------------------------------------------ #
    def analyse(
        self,
        code: str,
        language: Optional[str] = None,
        threshold: float = 0.5,
        with_attribution: Optional[bool] = None,
    ) -> VulnerabilityReport:
        """Full analysis: classification + rules + explanation."""
        code = normalise(code, CONFIG.api.max_code_bytes)
        language = (language or detect_language(code)).lower()
        probability = self.classify(code)

        attribution: Optional[List[TokenAttribution]] = None
        want_attr = (
            self.enable_attribution
            if with_attribution is None
            else with_attribution
        )
        if want_attr and self.backend_name == "transformer":
            try:
                pairs = self._model.token_attributions(code, top_k=15)
                attribution = [TokenAttribution(t, s) for t, s in pairs]
            except Exception:
                attribution = None

        return self.explainer.analyse(
            code=code,
            language=language,
            vulnerability_probability=probability,
            threshold=threshold,
            model_name=self.backend_name,
            token_attributions=attribution,
        )

    def analyse_to_dict(
        self, code: str, language: Optional[str] = None, threshold: float = 0.5
    ) -> Dict:
        return self.analyse(code, language, threshold).to_dict()

    # ------------------------------------------------------------------ #
    @staticmethod
    def available() -> Dict[str, str]:
        """Report which backends are usable in the current environment."""
        info = {"transformer": "unavailable", "heuristic": "available"}
        try:
            import torch  # noqa: F401
            import transformers  # noqa: F401

            info["transformer"] = (
                "ready"
                if Path(CONFIG.api.model_path).exists()
                else "available (no checkpoint)"
            )
        except Exception:
            info["transformer"] = "not installed"
        return info


_DETECTOR: Optional[CodeVulnerabilityDetector] = None


def get_detector() -> CodeVulnerabilityDetector:
    """Process-wide singleton used by the API."""
    global _DETECTOR
    if _DETECTOR is None:
        _DETECTOR = CodeVulnerabilityDetector()
    return _DETECTOR


def set_detector(detector: CodeVulnerabilityDetector) -> None:
    global _DETECTOR
    _DETECTOR = detector


if __name__ == "__main__":  # pragma: no cover - manual smoke test
    det = CodeVulnerabilityDetector()
    sample = 'import os\ndef f(x):\n    os.system("ls " + x)\n'
    report = det.analyse(sample, "python")
    print(json.dumps(report.to_dict(), indent=2))
