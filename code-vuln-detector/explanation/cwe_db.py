"""
CWE knowledge base.

Provides metadata (name, description, severity, remediation) for the Common
Weakness Enumeration identifiers that the static rule engine can flag. Keeping
this separate makes the explanation generator reusable and easy to extend.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class CWEEntry:
    cwe_id: str
    name: str
    description: str
    severity: str  # CRITICAL | HIGH | MEDIUM | LOW
    remediation: str
    references: List[str] = field(default_factory=list)


# Severity ordering helps when a snippet triggers several weaknesses.
SEVERITY_ORDER: Dict[str, int] = {
    "CRITICAL": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
}


CWE_DB: Dict[str, CWEEntry] = {
    "CWE-89": CWEEntry(
        cwe_id="CWE-89",
        name="SQL Injection",
        description=(
            "User-controlled input is concatenated into an SQL statement, "
            "allowing an attacker to alter query logic."
        ),
        severity="CRITICAL",
        remediation=(
            "Use parameterised queries / prepared statements instead of string "
            "concatenation, and validate inputs against an allow-list."
        ),
        references=["https://cwe.mitre.org/data/definitions/89.html"],
    ),
    "CWE-78": CWEEntry(
        cwe_id="CWE-78",
        name="OS Command Injection",
        description=(
            "Untrusted input reaches a shell command, permitting arbitrary "
            "command execution on the host."
        ),
        severity="CRITICAL",
        remediation=(
            "Avoid shell invocation; pass argument lists to subprocess APIs "
            "(shell=False) and validate/escape untrusted values."
        ),
        references=["https://cwe.mitre.org/data/definitions/78.html"],
    ),
    "CWE-79": CWEEntry(
        cwe_id="CWE-79",
        name="Cross-site Scripting (XSS)",
        description=(
            "Untrusted data is written into a web page without encoding, letting "
            "attackers execute scripts in a victim's browser."
        ),
        severity="HIGH",
        remediation=(
            "Context-aware output encoding, a strict Content-Security-Policy, and "
            "framework auto-escaping."
        ),
        references=["https://cwe.mitre.org/data/definitions/79.html"],
    ),
    "CWE-22": CWEEntry(
        cwe_id="CWE-22",
        name="Path Traversal",
        description=(
            "Filesystem paths are built from untrusted input, allowing access to "
            "files outside the intended directory."
        ),
        severity="HIGH",
        remediation=(
            "Canonicalise paths and verify they remain within a fixed base "
            "directory; reject '..' sequences."
        ),
        references=["https://cwe.mitre.org/data/definitions/22.html"],
    ),
    "CWE-798": CWEEntry(
        cwe_id="CWE-798",
        name="Use of Hard-coded Credentials",
        description=(
            "Secrets such as passwords or API keys are embedded directly in the "
            "source code."
        ),
        severity="HIGH",
        remediation=(
            "Store secrets in environment variables or a managed secret store and "
            "rotate any leaked credentials."
        ),
        references=["https://cwe.mitre.org/data/definitions/798.html"],
    ),
    "CWE-502": CWEEntry(
        cwe_id="CWE-502",
        name="Deserialization of Untrusted Data",
        description=(
            "Untrusted data is deserialised with an unsafe loader, potentially "
            "leading to remote code execution."
        ),
        severity="HIGH",
        remediation=(
            "Use safe serialisation formats (JSON) and never unpickle untrusted "
            "data."
        ),
        references=["https://cwe.mitre.org/data/definitions/502.html"],
    ),
    "CWE-119": CWEEntry(
        cwe_id="CWE-119",
        name="Improper Restriction of Operations within the Bounds of a Memory Buffer",
        description=(
            "Unchecked buffer operations can overwrite memory, leading to crashes "
            "or code execution."
        ),
        severity="CRITICAL",
        remediation=(
            "Use bounded string/memory functions (strncpy, snprintf) and validate "
            "sizes before copying."
        ),
        references=["https://cwe.mitre.org/data/definitions/119.html"],
    ),
    "CWE-120": CWEEntry(
        cwe_id="CWE-120",
        name="Buffer Copy without Checking Size of Input",
        description=(
            "A classic stack buffer overflow caused by copying input of unbounded "
            "length."
        ),
        severity="CRITICAL",
        remediation=(
            "Use safe alternatives such as strncpy/fgets and validate the source "
            "length first."
        ),
        references=["https://cwe.mitre.org/data/definitions/120.html"],
    ),
    "CWE-125": CWEEntry(
        cwe_id="CWE-125",
        name="Out-of-bounds Read",
        description=(
            "Reading past the end of a buffer can leak sensitive memory contents."
        ),
        severity="MEDIUM",
        remediation="Add explicit bounds checks before every indexed access.",
        references=["https://cwe.mitre.org/data/definitions/125.html"],
    ),
    "CWE-416": CWEEntry(
        cwe_id="CWE-416",
        name="Use After Free",
        description=(
            "Memory is accessed after being freed, leading to undefined behaviour."
        ),
        severity="HIGH",
        remediation=(
            "Set pointers to NULL after free and avoid aliasing freed memory."
        ),
        references=["https://cwe.mitre.org/data/definitions/416.html"],
    ),
    "CWE-190": CWEEntry(
        cwe_id="CWE-190",
        name="Integer Overflow or Wraparound",
        description=(
            "Arithmetic exceeds the range of the integer type, producing "
            "unexpected values."
        ),
        severity="MEDIUM",
        remediation="Validate operand ranges and use wider/checked arithmetic.",
        references=["https://cwe.mitre.org/data/definitions/190.html"],
    ),
    "CWE-327": CWEEntry(
        cwe_id="CWE-327",
        name="Use of a Broken or Risky Cryptographic Algorithm",
        description=(
            "Weak or obsolete cryptographic primitives are used, undermining "
            "confidentiality and integrity."
        ),
        severity="HIGH",
        remediation=(
            "Replace MD5/SHA-1/DES with SHA-256/AES-GCM and follow current "
            "cryptographic guidance."
        ),
        references=["https://cwe.mitre.org/data/definitions/327.html"],
    ),
    "CWE-330": CWEEntry(
        cwe_id="CWE-330",
        name="Use of Insufficiently Random Values",
        description=(
            "Predictable randomness is used where a cryptographically secure "
            "source is required."
        ),
        severity="MEDIUM",
        remediation=(
            "Use a CSPRNG (secrets module, /dev/urandom, java.security.SecureRandom)."
        ),
        references=["https://cwe.mitre.org/data/definitions/330.html"],
    ),
    "CWE-311": CWEEntry(
        cwe_id="CWE-311",
        name="Missing Encryption of Sensitive Data",
        description="Sensitive data is stored or transmitted in cleartext.",
        severity="HIGH",
        remediation="Encrypt sensitive data at rest and in transit (TLS).",
        references=["https://cwe.mitre.org/data/definitions/311.html"],
    ),
    "CWE-1188": CWEEntry(
        cwe_id="CWE-1188",
        name="Insecure Default Initialization of Resource",
        description=(
            "Debug or development defaults (e.g. DEBUG=True) are enabled in "
            "production."
        ),
        severity="MEDIUM",
        remediation="Disable debug/verbose modes and secure all defaults.",
        references=["https://cwe.mitre.org/data/definitions/1188.html"],
    ),
}


def lookup(cwe_id: str) -> CWEEntry | None:
    """Return the metadata for a CWE id, or ``None`` if unknown."""
    return CWE_DB.get(cwe_id)
