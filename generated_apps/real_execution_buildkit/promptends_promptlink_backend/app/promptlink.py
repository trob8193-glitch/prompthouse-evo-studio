import os
import time
from uuid import uuid4

import httpx
from fastapi import HTTPException

from .config import settings
from .db import connect, dumps, loads, now
from .models import ConnectorManifest, InvokeRequest, TruthState
from .proof import create_proof_card


def default_manifests() -> list[ConnectorManifest]:
    return [
        ConnectorManifest(
            connectorId="openai",
            name="OpenAI Responses API",
            baseUrl="https://api.openai.com/v1",
            auth={"type": "bearer_env", "secretRef": "OPENAI_API_KEY"},
            capabilities=["responses.create"],
            allowedActions=["responses.create", "generate_text", "classify", "extract", "summarize"],
            riskLevel="medium",
            proofPolicy="log_metadata_no_secret",
            rateLimits={"requestsPerMinute": 60},
        ),
        ConnectorManifest(
            connectorId="github",
            name="GitHub REST API",
            baseUrl="https://api.github.com",
            auth={"type": "bearer_env", "secretRef": "GITHUB_TOKEN"},
            capabilities=["repos.get", "issues.create"],
            allowedActions=["repos.get", "issues.create"],
            riskLevel="high",
            proofPolicy="log_repo_target_no_secret",
            rateLimits={"requestsPerMinute": 30},
        ),
    ]


def bootstrap_default_connectors() -> None:
    for manifest in default_manifests():
        register_connector(manifest, replace=False)


def register_connector(manifest: ConnectorManifest, replace: bool = True) -> ConnectorManifest:
    with connect() as conn:
        existing = conn.execute(
            "SELECT connector_id FROM connectors WHERE connector_id = ?",
            (manifest.connectorId,),
        ).fetchone()
        if existing and not replace:
            return manifest
        conn.execute(
            '''
            INSERT OR REPLACE INTO connectors (connector_id, manifest_json, created_at)
            VALUES (?, ?, ?)
            ''',
            (manifest.connectorId, dumps(manifest.model_dump()), now()),
        )
    return manifest


def get_connector(connector_id: str) -> ConnectorManifest:
    with connect() as conn:
        row = conn.execute(
            "SELECT manifest_json FROM connectors WHERE connector_id = ?",
            (connector_id,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="connector not registered")
    return ConnectorManifest.model_validate(loads(row["manifest_json"]))


def list_connectors() -> list[dict]:
    with connect() as conn:
        rows = conn.execute("SELECT manifest_json FROM connectors ORDER BY connector_id").fetchall()
    return [loads(row["manifest_json"]) for row in rows]


def secret_value(secret_ref: str | None) -> str:
    if not secret_ref:
        return ""
    if secret_ref == "OPENAI_API_KEY":
        return settings.openai_api_key
    if secret_ref == "GITHUB_TOKEN":
        return settings.github_token
    return os.getenv(secret_ref, "")


def handshake(connector_id: str) -> dict:
    manifest = get_connector(connector_id)
    required_secret = manifest.auth.secretRef
    configured = True
    if manifest.auth.type != "none":
        configured = bool(secret_value(required_secret))

    truth_state = TruthState.verified if configured else TruthState.blocked

    return {
        "connectorId": manifest.connectorId,
        "name": manifest.name,
        "truthState": truth_state.value,
        "configured": configured,
        "capabilities": manifest.capabilities,
        "allowedActions": manifest.allowedActions,
        "riskLevel": manifest.riskLevel,
        "proofPolicy": manifest.proofPolicy,
        "blockedReason": "" if configured else f"Missing server-side secret: {required_secret}",
    }


async def invoke(connector_id: str, request: InvokeRequest) -> dict:
    manifest = get_connector(connector_id)

    if request.action not in manifest.allowedActions and request.action not in manifest.capabilities:
        proof = create_proof_card(
            workspace_id=request.workspaceId,
            project_id=request.projectId,
            claim=f"Connector action blocked: {connector_id}.{request.action}",
            truth_state=TruthState.blocked,
            evidence=["action_not_allowed_by_manifest"],
            failure_condition="Requested action is outside connector manifest.",
            rollback_plan="Register or approve the action before invoking.",
        )
        raise HTTPException(status_code=403, detail={"message": "action not allowed", "proofCardId": proof.id})

    hs = handshake(connector_id)
    if not hs["configured"]:
        proof = create_proof_card(
            workspace_id=request.workspaceId,
            project_id=request.projectId,
            claim=f"Connector blocked: {connector_id} is not configured.",
            truth_state=TruthState.blocked,
            evidence=[hs["blockedReason"]],
            failure_condition="Required server-side secret missing.",
            rollback_plan="Configure secret in backend environment and retry.",
        )
        raise HTTPException(status_code=409, detail={"message": hs["blockedReason"], "proofCardId": proof.id})

    if request.dryRun:
        proof = create_proof_card(
            workspace_id=request.workspaceId,
            project_id=request.projectId,
            claim=f"Dry-run policy check passed for {connector_id}.{request.action}",
            truth_state=TruthState.verified,
            evidence=["manifest_registered", "action_allowed", "secret_configured"],
            rollback_plan="No external side effect occurred.",
        )
        return {
            "truthState": "verified",
            "dryRun": True,
            "output": {"message": "Dry-run policy check passed."},
            "proofCardId": proof.id,
            "auditId": None,
        }

    start = time.perf_counter()
    audit_id = f"audit-{uuid4()}"

    try:
        output = await _invoke_external(manifest, request)
        latency_ms = int((time.perf_counter() - start) * 1000)
        with connect() as conn:
            conn.execute(
                '''
                INSERT INTO audit_logs
                (id, workspace_id, project_id, connector_id, action, truth_state, status_code, latency_ms, error, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    audit_id,
                    request.workspaceId,
                    request.projectId,
                    connector_id,
                    request.action,
                    "verified",
                    200,
                    latency_ms,
                    "",
                    now(),
                ),
            )
        proof = create_proof_card(
            workspace_id=request.workspaceId,
            project_id=request.projectId,
            claim=f"Connector invoke succeeded: {connector_id}.{request.action}",
            truth_state=TruthState.verified,
            evidence=[audit_id],
            rollback_plan="Review audit log and revoke connector secret if needed.",
        )
        return {
            "truthState": "verified",
            "output": output,
            "proofCardId": proof.id,
            "auditId": audit_id,
            "latencyMs": latency_ms,
        }
    except Exception as error:
        latency_ms = int((time.perf_counter() - start) * 1000)
        with connect() as conn:
            conn.execute(
                '''
                INSERT INTO audit_logs
                (id, workspace_id, project_id, connector_id, action, truth_state, status_code, latency_ms, error, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    audit_id,
                    request.workspaceId,
                    request.projectId,
                    connector_id,
                    request.action,
                    "broken",
                    None,
                    latency_ms,
                    str(error),
                    now(),
                ),
            )
        proof = create_proof_card(
            workspace_id=request.workspaceId,
            project_id=request.projectId,
            claim=f"Connector invoke failed: {connector_id}.{request.action}",
            truth_state=TruthState.broken,
            evidence=[audit_id, str(error)],
            failure_condition="External API invocation failed.",
            rollback_plan="Inspect audit log, validate connector manifest and secret, then retry.",
        )
        raise HTTPException(status_code=502, detail={"message": str(error), "proofCardId": proof.id, "auditId": audit_id}) from error


async def _invoke_external(manifest: ConnectorManifest, request: InvokeRequest):
    if manifest.connectorId == "openai":
        return await _invoke_openai(request)
    if manifest.connectorId == "github":
        return await _invoke_github(request)
    return await _invoke_generic_rest(manifest, request)


async def _invoke_openai(request: InvokeRequest):
    prompt = request.input.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("input.prompt is required for OpenAI connector.")

    model = request.input.get("model") or settings.default_model
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            "https://api.openai.com/v1/responses",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={"model": model, "input": prompt},
        )
    if response.status_code < 200 or response.status_code >= 300:
        raise RuntimeError(f"OpenAI error {response.status_code}: {response.text}")
    data = response.json()
    return data.get("output_text") or data


async def _invoke_github(request: InvokeRequest):
    async with httpx.AsyncClient(timeout=30) as client:
        if request.action == "repos.get":
            owner = request.input.get("owner")
            repo = request.input.get("repo")
            if not owner or not repo:
                raise ValueError("owner and repo are required.")
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers={"Authorization": f"Bearer {settings.github_token}", "Accept": "application/vnd.github+json"},
            )
        elif request.action == "issues.create":
            owner = request.input.get("owner")
            repo = request.input.get("repo")
            title = request.input.get("title")
            body = request.input.get("body", "")
            if not owner or not repo or not title:
                raise ValueError("owner, repo, and title are required.")
            response = await client.post(
                f"https://api.github.com/repos/{owner}/{repo}/issues",
                headers={"Authorization": f"Bearer {settings.github_token}", "Accept": "application/vnd.github+json"},
                json={"title": title, "body": body},
            )
        else:
            raise ValueError(f"Unsupported GitHub action: {request.action}")

    if response.status_code < 200 or response.status_code >= 300:
        raise RuntimeError(f"GitHub error {response.status_code}: {response.text}")
    return response.json()


async def _invoke_generic_rest(manifest: ConnectorManifest, request: InvokeRequest):
    method = str(request.input.get("method", "GET")).upper()
    path = str(request.input.get("path", ""))
    body = request.input.get("body")
    headers = dict(request.input.get("headers", {}))

    secret = secret_value(manifest.auth.secretRef)
    if manifest.auth.type == "bearer_env":
        headers["Authorization"] = f"Bearer {secret}"
    elif manifest.auth.type == "api_key_header":
        if not manifest.auth.headerName:
            raise ValueError("api_key_header requires headerName")
        headers[manifest.auth.headerName] = secret

    url = manifest.baseUrl.rstrip("/") + "/" + path.lstrip("/")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.request(method, url, headers=headers, json=body)

    if response.status_code < 200 or response.status_code >= 300:
        raise RuntimeError(f"REST connector error {response.status_code}: {response.text}")

    try:
        return response.json()
    except Exception:
        return {"text": response.text}
