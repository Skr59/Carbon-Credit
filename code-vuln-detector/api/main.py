"""
FastAPI application exposing the vulnerability detector.

Endpoints
---------
GET  /health              - service + backend status
GET  /api/v1/backends     - available backends in this environment
POST /api/v1/analyse      - analyse a single code snippet
POST /api/v1/analyse/batch- analyse several snippets in one call
GET  /api/v1/cwe/{id}     - metadata for a CWE id
GET  /api/v1/rules        - list the static rules the engine knows about
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import CONFIG
from explanation.cwe_db import CWE_DB, lookup
from explanation.rules import RULES
from models import get_detector

from .schemas import (
    AnalyseRequest,
    AnalyseResponse,
    BatchAnalyseRequest,
    BatchAnalyseResponse,
    HealthResponse,
)

app = FastAPI(
    title=CONFIG.api.title,
    version=CONFIG.api.version,
    description=(
        "Autonomous code vulnerability detection using a fine-tuned CodeBERT "
        "classifier fused with a multi-language CWE rule engine."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    detector = get_detector()
    from models.detector import CodeVulnerabilityDetector

    return HealthResponse(
        status="ok",
        backend=detector.backend,
        backends=CodeVulnerabilityDetector.available(),
        version=CONFIG.api.version,
    )


@app.get("/api/v1/backends", tags=["system"])
def backends() -> dict:
    from models.detector import CodeVulnerabilityDetector

    return {"backends": CodeVulnerabilityDetector.available()}


@app.post("/api/v1/analyse", response_model=AnalyseResponse, tags=["detection"])
def analyse(req: AnalyseRequest) -> AnalyseResponse:
    if len(req.code.encode("utf-8")) > CONFIG.api.max_code_bytes:
        raise HTTPException(status_code=413, detail="Code payload too large.")
    detector = get_detector()
    report = detector.analyse(
        code=req.code,
        language=req.language,
        threshold=req.threshold,
        with_attribution=req.explain,
    )
    return AnalyseResponse(**report.to_dict())


@app.post(
    "/api/v1/analyse/batch",
    response_model=BatchAnalyseResponse,
    tags=["detection"],
)
def analyse_batch(req: BatchAnalyseRequest) -> BatchAnalyseResponse:
    detector = get_detector()
    results = []
    for item in req.snippets:
        report = detector.analyse(
            code=item.code,
            language=item.language,
            threshold=item.threshold,
            with_attribution=False,
        )
        results.append(AnalyseResponse(**report.to_dict()))
    return BatchAnalyseResponse(results=results)


@app.get("/api/v1/cwe/{cwe_id}", tags=["knowledge"])
def cwe_info(cwe_id: str) -> dict:
    entry = lookup(cwe_id.upper())
    if entry is None:
        raise HTTPException(status_code=404, detail=f"Unknown CWE: {cwe_id}")
    return {
        "cwe_id": entry.cwe_id,
        "name": entry.name,
        "description": entry.description,
        "severity": entry.severity,
        "remediation": entry.remediation,
        "references": entry.references,
    }


@app.get("/api/v1/cwe", tags=["knowledge"])
def list_cwe() -> dict:
    return {"count": len(CWE_DB), "cwe_ids": sorted(CWE_DB.keys())}


@app.get("/api/v1/rules", tags=["knowledge"])
def list_rules() -> dict:
    return {
        "count": len(RULES),
        "rules": [
            {
                "rule_id": r.rule_id,
                "cwe_id": r.cwe_id,
                "languages": r.languages,
                "confidence": r.confidence,
                "message": r.message,
            }
            for r in RULES
        ],
    }


def run() -> None:  # pragma: no cover - console entry point
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host=CONFIG.api.host,
        port=CONFIG.api.port,
        reload=False,
    )


if __name__ == "__main__":  # pragma: no cover
    run()
