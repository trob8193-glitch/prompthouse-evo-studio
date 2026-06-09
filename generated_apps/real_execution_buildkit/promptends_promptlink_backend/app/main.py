import os
from uuid import uuid4

from fastapi import FastAPI

from .artifacts import create_artifact, list_artifacts
from .db import init_db
from .models import ConnectorManifest, InvokeRequest, ManifestRunRequest, TruthState
from .promptlink import bootstrap_default_connectors, get_connector, handshake, invoke, list_connectors, register_connector
from .proof import create_proof_card, list_proof_cards

app = FastAPI(title="PromptEnds + PromptLink", version="0.1.0")

EVO_BRAND = {
    "name": "PromptHouse Evo Studio",
    "runtime": "PromptEnds PromptLink Runtime",
    "signature": "Manifest -> Connector -> Proof -> Artifact",
    "tagline": "Proof-native builds across Flutter, Python, PromptBridge, and external connectors.",
    "palette": {
        "void": "#050712",
        "pulse": "#18F27A",
        "forge": "#38BDF8",
        "proof": "#F8D66D",
    },
    "badges": ["Evo Native Runtime", "PromptLink Powered", "Proof-Gated"],
}


def initialize_runtime():
    init_db()
    bootstrap_default_connectors()


@app.on_event("startup")
def startup():
    initialize_runtime()


initialize_runtime()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "PromptEnds",
        "brand": EVO_BRAND,
        "promptLink": "enabled",
        "capabilitiesPath": "/api/evo-capabilities",
    }


@app.get("/link/health")
async def link_health():
    return {
        "status": "ok",
        "service": "PromptLink",
        "brand": EVO_BRAND,
        "connectors": len(list_connectors()),
        "capabilitiesPath": "/api/evo-capabilities",
    }


@app.get("/api/evo-capabilities")
async def evo_capabilities():
    return build_evo_capabilities()


@app.post("/link/connectors/register")
async def register(manifest: ConnectorManifest):
    return register_connector(manifest).model_dump()


@app.get("/link/connectors")
async def connectors():
    return list_connectors()


@app.get("/link/connectors/{connector_id}")
async def connector(connector_id: str):
    return get_connector(connector_id).model_dump()


@app.post("/link/connectors/{connector_id}/handshake")
async def connector_handshake(connector_id: str):
    return handshake(connector_id)


@app.post("/link/connectors/{connector_id}/invoke")
async def connector_invoke(connector_id: str, request: InvokeRequest):
    return await invoke(connector_id, request)


@app.get("/link/audit")
async def audit():
    from .db import connect
    with connect() as conn:
        rows = conn.execute("SELECT * FROM audit_logs ORDER BY created_at DESC").fetchall()
    return [dict(row) for row in rows]


@app.get("/link/proof")
async def proof():
    return list_proof_cards()


@app.get("/api/proof-cards")
async def proof_cards():
    return list_proof_cards()


@app.get("/api/artifacts")
async def artifacts():
    return list_artifacts()


@app.post("/api/manifest/run")
async def manifest_run(request: ManifestRunRequest):
    if not request.seedIntent.strip():
        proof = create_proof_card(
            workspace_id=request.workspaceId,
            project_id=request.projectId,
            claim="Manifest-to-Proof run blocked because seed intent was empty.",
            truth_state=TruthState.blocked,
            evidence=["seed_intent_empty"],
            failure_condition="Missing user intent.",
            rollback_plan="Provide a seedIntent and retry.",
        )
        return {"truthState": "blocked", "proofCardId": proof.id, "artifacts": []}

    brief = create_artifact(
        workspace_id=request.workspaceId,
        project_id=request.projectId,
        artifact_type="product_brief",
        title="Product Brief",
        body=f"Seed Intent:\n{request.seedIntent}\n\nTarget Platform:\n{request.targetPlatform}\n\nConstraints:\n" + "\n".join(request.constraints),
    )
    api_contract = create_artifact(
        workspace_id=request.workspaceId,
        project_id=request.projectId,
        artifact_type="api_contract",
        title="Initial API Contract",
        body="Required endpoints: /health, /api/manifest/run, /api/artifacts, /api/proof-cards, /link/connectors, /link/connectors/{id}/invoke",
    )
    test_plan = create_artifact(
        workspace_id=request.workspaceId,
        project_id=request.projectId,
        artifact_type="test_plan",
        title="Initial Verification Plan",
        body="Run backend health check. Run connector handshakes. Run manifest endpoint test. Verify artifact persistence. Verify proof card persistence.",
    )

    proof = create_proof_card(
        workspace_id=request.workspaceId,
        project_id=request.projectId,
        claim="Manifest-to-Proof run produced persisted artifact chain.",
        truth_state=TruthState.built,
        evidence=[brief.id, api_contract.id, test_plan.id],
        rollback_plan="Delete generated artifacts/proof records or rerun with revised seed intent.",
    )

    return {
        "runId": f"manifest-{uuid4()}",
        "truthState": "built",
        "artifacts": [brief.model_dump(), api_contract.model_dump(), test_plan.model_dump()],
        "proofCards": [proof.model_dump()],
        "launchCertificateId": f"launch-{uuid4()}",
    }


def build_evo_capabilities():
    configured_providers = [
        key
        for key in ["OPENAI_API_KEY", "GITHUB_TOKEN", "STRIPE_SECRET_KEY", "VERCEL_TOKEN"]
        if os.environ.get(key)
    ]
    return {
        "brand": EVO_BRAND,
        "truthState": "PYTHON_EVO_RUNTIME_READY",
        "surfaces": [
            "Python PromptEnds",
            "PromptLink connectors",
            "Manifest runner",
            "Proof ledger",
            "Artifact vault",
            "Flutter PromptShell contract",
        ],
        "runtime": {
            "backend": "FastAPI",
            "database": "sqlite",
            "connectors": len(list_connectors()),
            "configuredProviders": configured_providers,
            "providerMode": "partially_configured" if configured_providers else "local_contracts_only",
        },
        "flutter": {
            "truthState": "FLUTTER_CLIENT_CONTRACT_READY",
            "capabilities": [
                "Evo-branded PromptShell command deck",
                "Manifest-to-proof generation through API contract",
                "Connector health and handshake actions",
                "Proof ledger viewer",
                "Artifact vault viewer",
                "Runtime base URL override with PROMPTENDS_BASE_URL",
            ],
            "proofCommands": ["flutter test"],
            "blocked": ["Device/emulator runtime is not proven until flutter run targets a live backend."],
        },
        "python": {
            "truthState": "PYTHON_PROMPTLINK_BACKEND_READY",
            "capabilities": [
                "FastAPI PromptEnds backend",
                "PromptLink connector registry",
                "Handshake and invoke policy gates",
                "SQLite audit, proof, and artifact persistence",
                "Manifest-to-proof artifact chain",
            ],
            "proofCommands": [
                "python -m pytest tests/test_real_logic.py",
                "python -m pytest generated_apps/real_execution_buildkit/promptends_promptlink_backend/tests/test_real_logic.py",
            ],
            "blocked": ["Production deployment and live provider secrets remain gated by external credentials and proofs."],
        },
        "proofRail": [
            {"step": "manifest", "route": "/api/manifest/run", "truthState": "BUILT"},
            {"step": "connector", "route": "/link/connectors/{connector_id}/handshake", "truthState": "LOCAL_READY"},
            {"step": "proof", "route": "/api/proof-cards", "truthState": "READABLE"},
            {"step": "artifact", "route": "/api/artifacts", "truthState": "PERSISTED"},
        ],
    }
