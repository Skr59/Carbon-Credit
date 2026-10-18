"""
Explanation generation.

Combines three signals into a human-readable, CWE-aware explanation:

1. The CodeBERT classifier probability (learned, whole-function view).
2. The deterministic rule engine findings (localised, CWE-tagged).
3. Optional token-level attribution from integrated gradients (XAI).

The result is a structured ``VulnerabilityReport`` suitable for JSON responses
and for rendering in the UI.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Dict, List, Optional

from .cwe_db import SEVERITY_ORDER, CWEEntry, lookup
from .rules import Finding, RuleEngine


@dataclass
class TokenAttribution:
    token: str
    score: float


@dataclass
class VulnerabilityReport:
    language: str
    is_vulnerable: bool
    probability: float
    risk_level: str
    summary: str
    findings: List[dict] = field(default_factory=list)
    top_tokens: List[dict] = field(default_factory=list)
    cwe_ids: List[str] = field(default_factory=list)
    model_name: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


# Probability thresholds -> qualitative risk bands.
def _risk_level(probability: float, has_critical: bool) -> str:
    if has_critical or probability >= 0.85:
        return "CRITICAL"
    if probability >= 0.65:
        return "HIGH"
    if probability >= 0.4:
        return "MEDIUM"
    return "LOW"


class Explainer:
    """Builds explanations from model + rule outputs."""

    def __init__(self, rule_engine: Optional[RuleEngine] = None) -> None:
        self.rule_engine = rule_engine or RuleEngine()

    # ------------------------------------------------------------------ #
    def analyse(
        self,
        code: str,
        language: str,
        vulnerability_probability: float,
        threshold: float = 0.5,
        model_name: str = "",
        token_attributions: Optional[List[TokenAttribution]] = None,
    ) -> VulnerabilityReport:
        findings: List[Finding] = self.rule_engine.scan(code, language)
        has_critical = any(f.severity == "CRITICAL" for f in findings)

        # A positive model signal with no rule hit still counts as vulnerable.
        is_vulnerable = vulnerability_probability >= threshold or has_critical

        cwe_ids: List[str] = []
        for f in findings:
            if f.cwe.cwe_id not in cwe_ids:
                cwe_ids.append(f.cwe.cwe_id)

        risk = _risk_level(vulnerability_probability, has_critical)
        summary = self._build_summary(
            is_vulnerable, vulnerability_probability, risk, findings
        )

        return VulnerabilityReport(
            language=language,
            is_vulnerable=is_vulnerable,
            probability=round(float(vulnerability_probability), 4),
            risk_level=risk,
            summary=summary,
            findings=[f.to_dict() for f in findings],
            top_tokens=[
                {"token": t.token, "score": round(t.score, 4)}
                for t in (token_attributions or [])
            ],
            cwe_ids=cwe_ids,
            model_name=model_name,
        )

    # ------------------------------------------------------------------ #
    def _build_summary(
        self,
        is_vulnerable: bool,
        probability: float,
        risk: str,
        findings: List[Finding],
    ) -> str:
        pct = f"{probability * 100:.1f}%"
        if not is_vulnerable and not findings:
            return (
                f"The model classifies this snippet as SAFE ({pct} vulnerability "
                "probability) and no static rule matched. No obvious weakness "
                "detected."
            )

        parts: List[str] = []
        if is_vulnerable:
            parts.append(
                f"The model flags this snippet as potentially VULNERABLE ({pct} "
                f"probability) with an overall risk level of {risk}."
            )
        else:
            parts.append(
                f"The model probability is low ({pct}), but static analysis found "
                f"{len(findings)} suspicious construct(s)."
            )

        if findings:
            names = _unique_preserve([f"{f.cwe.cwe_id} ({f.cwe.name})" for f in findings])
            parts.append("Identified weaknesses: " + ", ".join(names) + ".")

            worst = max(findings, key=lambda f: SEVERITY_ORDER.get(f.severity, 0))
            parts.append(
                f"Most severe issue is {worst.cwe.name} on line {worst.line}: "
                f"{worst.message}"
            )
            parts.append("Recommended fix: " + worst.cwe.remediation)
        else:
            parts.append(
                "No specific CWE pattern was matched by the static rules; rely on "
                "manual review of the flagged region."
            )
        return " ".join(parts)


def _unique_preserve(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for i in items:
        if i not in seen:
            seen.add(i)
            out.append(i)
    return out
