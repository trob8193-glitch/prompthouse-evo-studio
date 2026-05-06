import type { StudioModule, ConnectorContract, Mission } from "./types";

export const MODULES: StudioModule[] = [
  "Canon Keeper",
  "Prompt Architect",
  "Workflow Smith",
  "Artifact Builder",
  "Truth Auditor",
  "Shell Designer",
  "Product Framer",
  "Memory Librarian",
  "Tool Router",
  "Launch Marshal",
  "Governance Sentinel"
];

export const SAMPLE_MISSION: Mission = {
  id: "mission_001",
  title: "Build AI studio from rough idea",
  userIntent: "Create an autonomous prompt-to-app studio for vibe coders and AI coders.",
  status: "planning",
  route: ["Prompt Architect", "Product Framer", "Tool Router", "Truth Auditor"],
  autonomyLevel: 3,
  truthStates: ["built", "recommended", "blocked"],
  nextAction: "Generate VibeSpec, AppSpec, AgentTasks, QAReport, and ReviewPacket.",
  createdAt: new Date().toISOString()
};

export const SAMPLE_CONNECTORS: ConnectorContract[] = [
  {
    connectorId: "github",
    displayName: "GitHub",
    connectorType: "oauth",
    capabilities: ["read_repo", "create_branch", "commit_changes", "open_pr"],
    requiredScopes: ["repo:read", "repo:write"],
    riskLevel: "high",
    approvalPolicy: "always_ask",
    inputSchema: { repo: "string", branch: "string", task: "string" },
    outputSchema: { pullRequestUrl: "string", diffSummary: "string" },
    auditArtifacts: ["implementation_plan", "diff", "test_report", "pr_link"],
    rollbackStrategy: "branch_revert"
  },
  {
    connectorId: "openapi_import",
    displayName: "OpenAPI Importer",
    connectorType: "openapi",
    capabilities: ["import_spec", "generate_client_plan", "create_test_calls"],
    requiredScopes: [],
    riskLevel: "low",
    approvalPolicy: "allow_read_only",
    inputSchema: { openapiUrl: "string" },
    outputSchema: { endpoints: "array", clientPlan: "string" },
    auditArtifacts: ["import_summary", "schema_validation"],
    rollbackStrategy: "delete_generated_client"
  },
  {
    connectorId: "mcp_custom_server",
    displayName: "Custom MCP Server",
    connectorType: "mcp",
    capabilities: ["tools", "resources", "prompts"],
    requiredScopes: ["local_or_server_runtime"],
    riskLevel: "medium",
    approvalPolicy: "ask_for_high_risk",
    inputSchema: { toolName: "string", permissions: "array" },
    outputSchema: { serverPlan: "string", toolContracts: "array" },
    auditArtifacts: ["tool_manifest", "permission_log"],
    rollbackStrategy: "disable_server"
  }
];
