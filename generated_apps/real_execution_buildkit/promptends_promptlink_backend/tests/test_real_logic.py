import os
import tempfile

os.environ["PROMPTHOUSE_DB_PATH"] = tempfile.mktemp(suffix=".db")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_promptlink_health_and_connectors():
    response = client.get("/link/health")
    assert response.status_code == 200
    connectors = client.get("/link/connectors")
    assert connectors.status_code == 200
    ids = [c["connectorId"] for c in connectors.json()]
    assert "openai" in ids
    assert "github" in ids


def test_openai_handshake_blocks_without_secret():
    response = client.post("/link/connectors/openai/handshake")
    assert response.status_code == 200
    assert response.json()["truthState"] in ["blocked", "verified"]


def test_manifest_persists_artifacts_and_proof():
    response = client.post("/api/manifest/run", json={
        "workspaceId": "w_real",
        "projectId": "p_real",
        "seedIntent": "Build a real proof-native studio.",
        "constraints": ["no mock data", "server-side secrets only"],
        "targetPlatform": "flutter_web"
    })
    assert response.status_code == 200
    body = response.json()
    assert body["truthState"] == "built"
    assert len(body["artifacts"]) == 3
    assert len(body["proofCards"]) == 1

    artifacts = client.get("/api/artifacts").json()
    proof = client.get("/api/proof-cards").json()
    assert len(artifacts) >= 3
    assert len(proof) >= 1
