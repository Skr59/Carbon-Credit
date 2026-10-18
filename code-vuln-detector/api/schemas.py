"""Pydantic request/response schemas for the vulnerability detection API."""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class AnalyseRequest(BaseModel):
    code: str = Field(..., description="Source code to analyse.", min_length=1)
    language: Optional[str] = Field(
        None,
        description="Programming language hint (c, cpp, python, java, javascript). "
        "Auto-detected when omitted.",
    )
    threshold: float = Field(
        0.5, ge=0.0, le=1.0, description="Decision threshold on P(vulnerable)."
    )
    explain: bool = Field(
        True, description="Include token attribution (transformer backend only)."
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "code": "import os\ndef run(x):\n    os.system('ls ' + x)\n",
                    "language": "python",
                    "threshold": 0.5,
                }
            ]
        }
    }


class FindingModel(BaseModel):
    rule_id: str
    cwe_id: str
    cwe_name: str
    severity: str
    line: int
    snippet: str
    message: str
    confidence: float
    remediation: str


class TokenModel(BaseModel):
    token: str
    score: float


class AnalyseResponse(BaseModel):
    language: str
    is_vulnerable: bool
    probability: float
    risk_level: str
    summary: str
    cwe_ids: List[str]
    findings: List[FindingModel]
    top_tokens: List[TokenModel]
    model_name: str


class BatchAnalyseRequest(BaseModel):
    snippets: List[AnalyseRequest] = Field(..., min_length=1, max_length=64)


class BatchAnalyseResponse(BaseModel):
    results: List[AnalyseResponse]


class HealthResponse(BaseModel):
    status: str
    backend: str
    backends: Dict[str, str]
    version: str
