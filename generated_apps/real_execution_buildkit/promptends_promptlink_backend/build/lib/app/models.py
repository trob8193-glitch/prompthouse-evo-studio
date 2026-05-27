from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class TruthState(StrEnum):
    known = "known"
    inferred = "inferred"
    built = "built"
    verified = "verified"
    blocked = "blocked"
    broken = "broken"
    recommended = "recommended"


class AuthConfig(BaseModel):
    type: str
    secretRef: str | None = None
    headerName: str | None = None


class ConnectorManifest(BaseModel):
    connectorId: str
    name: str
    baseUrl: str
    auth: AuthConfig
    capabilities: list[str]
    allowedActions: list[str]
    riskLevel: str
    proofPolicy: str = "log_metadata_no_secret"
    rateLimits: dict[str, Any] = Field(default_factory=dict)


class InvokeRequest(BaseModel):
    workspaceId: str
    projectId: str
    action: str
    input: dict[str, Any]
    proofRequired: bool = True
    dryRun: bool = False


class ProofCard(BaseModel):
    id: str
    workspaceId: str
    projectId: str
    claim: str
    truthState: TruthState
    evidence: list[str] = Field(default_factory=list)
    owner: str = "PromptLink"
    failureCondition: str = ""
    rollbackPlan: str = ""


class Artifact(BaseModel):
    id: str
    workspaceId: str
    projectId: str
    type: str
    title: str
    body: str


class ManifestRunRequest(BaseModel):
    workspaceId: str
    projectId: str
    seedIntent: str
    constraints: list[str] = Field(default_factory=list)
    targetPlatform: str = "flutter_web"
