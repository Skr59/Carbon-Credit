"""Explanation package: CWE knowledge base, rules and report builder."""
from .cwe_db import CWE_DB, CWEEntry, lookup
from .explainer import Explainer, TokenAttribution, VulnerabilityReport
from .rules import Finding, Rule, RuleEngine

__all__ = [
    "CWE_DB",
    "CWEEntry",
    "lookup",
    "Explainer",
    "TokenAttribution",
    "VulnerabilityReport",
    "Finding",
    "Rule",
    "RuleEngine",
]
