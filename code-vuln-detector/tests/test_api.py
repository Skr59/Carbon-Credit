"""API integration tests using FastAPI's TestClient (heuristic backend)."""
from __future__ import annotations

from fastapi.testclient import TestClient

from api.main import app


def test_health():
    with TestClient(app) as client:
        resp = client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert "backend" in body


def test_analyse_vulnerable_snippet():
    with TestClient(app) as client:
        resp = client.post(
            "/api/v1/analyse",
            json={
                "code": 'import os\nos.system("ls " + x)',
                "language": "python",
                "threshold": 0.5,
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["is_vulnerable"] is True
        assert "CWE-78" in body["cwe_ids"]


def test_analyse_safe_snippet():
    with TestClient(app) as client:
        resp = client.post(
            "/api/v1/analyse",
            json={"code": "def add(a, b):\n    return a + b", "language": "python"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["findings"] == []


def test_batch_analyse():
    with TestClient(app) as client:
        resp = client.post(
            "/api/v1/analyse/batch",
            json={
                "snippets": [
                    {"code": "def f(): return 1", "language": "python"},
                    {"code": 'os.system("ls")', "language": "python"},
                ]
            },
        )
        assert resp.status_code == 200
        assert len(resp.json()["results"]) == 2


def test_cwe_lookup():
    with TestClient(app) as client:
        resp = client.get("/api/v1/cwe/CWE-89")
        assert resp.status_code == 200
        assert resp.json()["name"] == "SQL Injection"


def test_cwe_unknown_404():
    with TestClient(app) as client:
        resp = client.get("/api/v1/cwe/CWE-9999")
        assert resp.status_code == 404


def test_rules_endpoint():
    with TestClient(app) as client:
        resp = client.get("/api/v1/rules")
        assert resp.status_code == 200
        assert resp.json()["count"] > 0
