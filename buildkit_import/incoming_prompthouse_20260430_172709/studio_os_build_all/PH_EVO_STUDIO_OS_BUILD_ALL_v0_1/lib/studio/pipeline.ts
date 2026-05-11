import type {
  AppSpec,
  ApprovalRequest,
  ConnectorContract,
  DeploymentGate,
  Mission,
  PromptSpec,
  QAReport,
  ReviewPacket,
  VibeSpec
} from "./types";

export function createVibeSpec(mission: Mission, rawIdea: string): VibeSpec {
  return {
    id: "vibe_001",
    missionId: mission.id,
    rawIdea,
    targetUser: "vibe coders, AI coders, solo founders, and small dev teams",
    desiredFeel: ["fast", "command-center", "premium", "proof-bound", "mobile-ready"],
    mustHaveFeatures: [
      "Vibe Fast Lane",
      "Prompt Forge",
      "App Forge",
      "Bridge Hub",
      "Proof Deck",
      "Review & Ship Deck"
    ],
    assumptions: [
      "MVP starts web-first.",
      "Real connectors are mocked until credentials and scopes are provided.",
      "Default autonomy is Level 3: draft actions with user approval."
    ],
    styleDNA: {
      tone: "serious studio forge with clear proof gates",
      visualDirection: "dark command dashboard, gold accents, clean cards",
      interactionFeel: "guided, fast, approval-based",
      componentVocabulary: ["mission cards", "proof badges", "approval queue", "connector contracts"]
    },
    screenStoryboard: [
      "Mission Control: create mission, choose autonomy, view route.",
      "Vibe Fast Lane: rough idea becomes product brief and style DNA.",
      "App Forge: app spec becomes task list and test plan.",
      "Bridge Hub: connectors show risk, scopes, and approval policy.",
      "Proof Deck: artifacts and verification notes gate shipping."
    ]
  };
}

export function compilePromptSpec(mission: Mission, vibe: VibeSpec): PromptSpec {
  return {
    id: "prompt_001",
    missionId: mission.id,
    inputPrompt: vibe.rawIdea,
    compiledPrompt: `Build ${mission.title}. Preserve truth labels, 11 modules, connector approval gates, and proof artifacts.`,
    constraints: [
      "Do not fake deployment.",
      "Do not store secrets in prompts.",
      "Ask approval before write/deploy/delete/payment/message actions."
    ],
    variables: ["platform", "target_user", "connector_list", "autonomy_level"],
    outputContract: "Return ProductBrief, AppSpec, AgentTasks, QAReport, ReviewPacket, and DeploymentGate.",
    tests: [
      "Reject unpermissioned external writes.",
      "Block shipping without proof artifacts.",
      "Preserve 11 PromptHouse modules."
    ],
    version: "0.1.0"
  };
}

export function compileAppSpec(mission: Mission, vibe: VibeSpec, prompt: PromptSpec): AppSpec {
  return {
    id: "appspec_001",
    missionId: mission.id,
    platform: "web",
    productBrief: `A prompt-to-app AI studio that turns ${vibe.targetUser} intent into specs, tasks, tests, connectors, and proof.`,
    userStories: [
      "As a vibe coder, I can enter a rough idea and receive a buildable plan.",
      "As an AI coder, I can generate context packs and issue-to-PR tasks.",
      "As a founder, I can see proof before declaring a feature shipped.",
      "As an engineer, I can approve connector writes before execution."
    ],
    screens: [
      "Mission Control",
      "Vibe Fast Lane",
      "Prompt Forge",
      "App Forge",
      "AI Coder Console",
      "Prompt Intelligence Lab",
      "QA Autopilot",
      "Bridge Hub",
      "Proof Deck",
      "Review & Ship Deck"
    ],
    components: [
      "MissionCard",
      "RoutePanel",
      "TruthStateBadge",
      "ConnectorRiskCard",
      "ApprovalQueue",
      "ProofArtifactList",
      "ReviewPacketPanel"
    ],
    dataModel: [
      "Mission",
      "VibeSpec",
      "PromptSpec",
      "AppSpec",
      "AgentTask",
      "ConnectorContract",
      "ApprovalRequest",
      "QAReport",
      "ProofArtifact",
      "ReviewPacket",
      "DeploymentGate"
    ],
    apiContracts: [
      "POST /api/missions",
      "POST /api/forge/vibe",
      "POST /api/forge/prompt",
      "POST /api/forge/app",
      "POST /api/connectors/live-run",
      "POST /api/approvals",
      "POST /api/proof-artifacts"
    ],
    codeTasks: [
      {
        id: "task_frontend_001",
        title: "Implement dashboard screens and cards",
        lane: "frontend",
        ownerModule: "Shell Designer",
        likelyFiles: ["app/page.tsx", "components/studio/*.tsx"],
        acceptanceCriteria: ["All ten surfaces render", "Responsive layout works on mobile"],
        riskLevel: "low",
        rollbackPlan: "Revert UI component files",
        status: "draft"
      },
      {
        id: "task_backend_001",
        title: "Implement studio pipeline API stubs",
        lane: "backend",
        ownerModule: "Workflow Smith",
        likelyFiles: ["app/api/**/*.ts", "lib/studio/*.ts"],
        acceptanceCriteria: ["VibeSpec compiles to PromptSpec", "PromptSpec compiles to AppSpec"],
        riskLevel: "medium",
        rollbackPlan: "Disable API routes and use local mock data",
        status: "draft"
      },
      {
        id: "task_security_001",
        title: "Implement approval gate before connector writes",
        lane: "security",
        ownerModule: "Governance Sentinel",
        likelyFiles: ["lib/studio/approval.ts", "components/studio/ApprovalQueue.tsx"],
        acceptanceCriteria: ["High-risk and destructive actions require explicit approval"],
        riskLevel: "high",
        rollbackPlan: "Set all connector actions to manual_only",
        status: "draft"
      }
    ],
    testPlan: prompt.tests
  };
}

export function requiresApproval(connector: ConnectorContract, actionRisk: string): boolean {
  if (connector.approvalPolicy === "manual_only") return true;
  if (connector.approvalPolicy === "always_ask") return true;
  if (connector.approvalPolicy === "allow_read_only") return actionRisk !== "read";
  return connector.riskLevel === "high" || connector.riskLevel === "destructive";
}

export function createApprovalRequest(connector: ConnectorContract, actionName: string): ApprovalRequest {
  return {
    id: `approval_${connector.connectorId}_${actionName}`,
    connectorId: connector.connectorId,
    actionName,
    requestedBy: "Tool Router",
    riskLevel: connector.riskLevel,
    payloadPreview: "Live-run only. No external write executed.",
    proofNeeded: ["scope summary", "rollback plan", "expected change"],
    rollbackPlan: connector.rollbackStrategy,
    status: "pending"
  };
}

export function createQAReport(mission: Mission): QAReport {
  return {
    id: "qa_001",
    missionId: mission.id,
    browserFindings: ["No browser run yet; schedule smoke path after UI implementation."],
    consoleErrors: [],
    accessibilityFindings: ["Add keyboard navigation checks to approval queue."],
    testGaps: ["Need connector live-run tests", "Need ship-gate test", "Need prompt linter tests"],
    recommendedRepairs: ["Add Vitest coverage for requiresApproval and compileAppSpec."]
  };
}

export function createReviewPacket(mission: Mission): ReviewPacket {
  return {
    id: "review_001",
    missionId: mission.id,
    summary: "Initial PromptHouse Evo Studio OS scaffold created with prompt-to-app pipeline and connector approval gates.",
    filesChanged: ["app/page.tsx", "lib/studio/types.ts", "lib/studio/pipeline.ts"],
    screenshotsRequested: ["Mission Control", "Bridge Hub", "Review & Ship Deck"],
    testEvidence: ["Run npm test after installing dependencies."],
    risks: ["Connectors are stubbed", "No auth/database yet", "No production deployment yet"],
    rollback: "Revert to previous scaffold zip.",
    openQuestions: ["Choose Supabase vs Firebase", "Choose web-first vs Expo-first deployment"]
  };
}

export function createDeploymentGate(mission: Mission, proofArtifacts: string[]): DeploymentGate {
  const canShip = proofArtifacts.length > 0;
  return {
    id: "deploy_gate_001",
    missionId: mission.id,
    envVarsPresent: false,
    testsPassing: false,
    migrationsReviewed: false,
    secretsChecked: false,
    rollbackReady: true,
    proofArtifacts,
    canShip
  };
}
