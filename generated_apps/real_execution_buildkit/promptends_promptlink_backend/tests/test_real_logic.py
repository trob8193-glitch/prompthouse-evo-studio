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
    assert response.json()["brand"]["name"] == "PromptHouse Evo Studio"


def test_evo_capabilities_contract():
    response = client.get("/api/evo-capabilities")
    assert response.status_code == 200
    body = response.json()
    assert body["brand"]["name"] == "PromptHouse Evo Studio"
    assert body["truthState"] == "PYTHON_EVO_RUNTIME_READY"
    assert body["flutter"]["truthState"] == "FLUTTER_CLIENT_CONTRACT_READY"
    assert body["python"]["truthState"] == "PYTHON_PROMPTLINK_BACKEND_READY"
    assert "Manifest-to-proof artifact chain" in body["python"]["capabilities"]
    assert body["liveReadiness"]["truthState"] in ["LIVE_BLOCKED", "LIVE_READY"]


def test_live_readiness_blocks_without_credentials(monkeypatch):
    for key in [
        "JWT_SECRET",
        "PH_EVO_MASTER_KEY",
        "OPENAI_API_KEY",
        "STRIPE_SECRET_KEY",
        "VERCEL_TOKEN",
        "PROMPTSHELL_DEVICE_PROOF",
        "FLUTTER_DEVICE_PROOF",
    ]:
        monkeypatch.delenv(key, raising=False)

    response = client.get("/api/live-readiness")
    assert response.status_code == 200
    body = response.json()
    assert body["truthState"] == "LIVE_BLOCKED"
    assert "Missing live provider credential: OPENAI_API_KEY" in body["blockers"]
    assert body["device"]["truthState"] == "DEVICE_RUNTIME_PROOF_REQUIRED"


def test_live_readiness_redacts_configured_secrets(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "jwt-secret-that-must-not-leak")
    monkeypatch.setenv("PH_EVO_MASTER_KEY", "master-key-that-must-not-leak")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-openai-that-must-not-leak")
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk-test-stripe-that-must-not-leak")
    monkeypatch.setenv("VERCEL_TOKEN", "vercel-token-that-must-not-leak")
    monkeypatch.setenv("PROMPTSHELL_DEVICE_ID", "chrome")
    monkeypatch.setenv("PROMPTSHELL_DEVICE_PROOF", "verified")

    response = client.get("/api/live-readiness")
    assert response.status_code == 200
    body = response.json()
    assert body["truthState"] == "LIVE_READY"
    assert all(provider["configured"] for provider in body["providers"])
    serialized = str(body)
    assert "jwt-secret-that-must-not-leak" not in serialized
    assert "sk-openai-that-must-not-leak" not in serialized
    assert "sk-test-stripe-that-must-not-leak" not in serialized
    assert "vercel-token-that-must-not-leak" not in serialized


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
