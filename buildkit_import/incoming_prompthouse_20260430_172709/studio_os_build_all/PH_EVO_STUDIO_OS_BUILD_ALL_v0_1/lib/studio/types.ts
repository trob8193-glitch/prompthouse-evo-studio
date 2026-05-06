export type TruthState =
  | "known"
  | "inferred"
  | "blocked"
  | "broken"
  | "built"
  | "verified"
  | "recommended";

export type StudioModule =
  | "Canon Keeper"
  | "Prompt Architect"
  | "Workflow Smith"
  | "Artifact Builder"
  | "Truth Auditor"
  | "Shell Designer"
  | "Product Framer"
  | "Memory Librarian"
  | "Tool Router"
  | "Launch Marshal"
  | "Governance Sentinel";

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type MissionStatus =
  | "intake"
  | "planning"
  | "building"
  | "testing"
  | "repairing"
  | "blocked"
  | "ready_for_review"
  | "shipped";

export type RiskLevel = "low" | "medium" | "high" | "destructive";

export type ConnectorType =
  | "oauth"
  | "api_key"
  | "openapi"
  | "mcp"
  | "webhook"
  | "cli"
  | "file"
  | "browser"
  | "database"
  | "human_handoff";

export type ApprovalPolicy =
  | "always_ask"
  | "ask_for_high_risk"
  | "allow_read_only"
  | "manual_only";

export interface Mission {
  id: string;
  title: string;
  userIntent: string;
  status: MissionStatus;
  route: StudioModule[];
  autonomyLevel: AutonomyLevel;
  truthStates: TruthState[];
  nextAction: string;
  createdAt: string;
}

export interface VibeSpec {
  id: string;
  missionId: string;
  rawIdea: string;
  targetUser: string;
  desiredFeel: string[];
  mustHaveFeatures: string[];
  assumptions: string[];
  styleDNA: {
    tone: string;
    visualDirection: string;
    interactionFeel: string;
    componentVocabulary: string[];
  };
  screenStoryboard: string[];
}

export interface PromptSpec {
  id: string;
  missionId: string;
  inputPrompt: string;
  compiledPrompt: string;
  constraints: string[];
  variables: string[];
  outputContract: string;
  tests: string[];
  version: string;
}

export interface AppSpec {
  id: string;
  missionId: string;
  platform: "web" | "mobile" | "pwa" | "api";
  productBrief: string;
  userStories: string[];
  screens: string[];
  components: string[];
  dataModel: string[];
  apiContracts: string[];
  codeTasks: AgentTask[];
  testPlan: string[];
}

export interface AgentTask {
  id: string;
  title: string;
  lane: "frontend" | "backend" | "database" | "qa" | "docs" | "devops" | "security";
  ownerModule: StudioModule;
  likelyFiles: string[];
  acceptanceCriteria: string[];
  riskLevel: RiskLevel;
  rollbackPlan: string;
  status: "draft" | "approved" | "in_progress" | "done" | "blocked";
}

export interface RepoMap {
  id: string;
  repoName: string;
  routes: string[];
  components: string[];
  apiEndpoints: string[];
  dataModels: string[];
  tests: string[];
  buildScripts: string[];
  riskAreas: string[];
}

export interface ContextPack {
  id: string;
  missionId: string;
  summary: string;
  includedFiles: string[];
  constraints: string[];
  forbiddenChanges: string[];
  acceptanceTests: string[];
  tokenBudgetNote: string;
}

export interface ConnectorContract {
  connectorId: string;
  displayName: string;
  connectorType: ConnectorType;
  capabilities: string[];
  requiredScopes: string[];
  riskLevel: RiskLevel;
  approvalPolicy: ApprovalPolicy;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  auditArtifacts: string[];
  rollbackStrategy: string;
}

export interface ApprovalRequest {
  id: string;
  connectorId: string;
  actionName: string;
  requestedBy: StudioModule;
  riskLevel: RiskLevel;
  payloadPreview: string;
  proofNeeded: string[];
  rollbackPlan: string;
  status: "pending" | "approved" | "rejected" | "needs_more_proof";
}

export interface QAReport {
  id: string;
  missionId: string;
  browserFindings: string[];
  consoleErrors: string[];
  accessibilityFindings: string[];
  testGaps: string[];
  recommendedRepairs: string[];
}

export interface PromptEval {
  id: string;
  promptSpecId: string;
  cases: string[];
  winners: string[];
  regressions: string[];
  notes: string;
}

export interface ProofArtifact {
  id: string;
  missionId: string;
  type: "plan" | "diff" | "screenshot" | "recording" | "test_report" | "receipt" | "handoff";
  status: "draft" | "reviewed" | "verified" | "rejected";
  uri: string;
  verificationNote: string;
  createdAt: string;
}

export interface ReviewPacket {
  id: string;
  missionId: string;
  summary: string;
  filesChanged: string[];
  screenshotsRequested: string[];
  testEvidence: string[];
  risks: string[];
  rollback: string;
  openQuestions: string[];
}

export interface DeploymentGate {
  id: string;
  missionId: string;
  envVarsPresent: boolean;
  testsPassing: boolean;
  migrationsReviewed: boolean;
  secretsChecked: boolean;
  rollbackReady: boolean;
  proofArtifacts: string[];
  canShip: boolean;
}
