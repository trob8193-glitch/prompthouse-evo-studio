import type { CommandRisk, EvoTermPolicyResult } from "./evoTerminalTypes";

const destructivePatterns = [
  /\brm\s+-rf\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bdel\s+\/f\b/i,
  /\bformat\b/i,
  /\bdrop\s+database\b/i,
];

const highRiskPatterns = [
  /\bgit\s+push\b/i,
  /\bnpm\s+publish\b/i,
  /\bfirebase\s+deploy\b/i,
  /\bsupabase\s+db\s+push\b/i,
  /\bvercel\s+--prod\b/i,
  /\bflutter\s+build\s+(apk|appbundle|ipa).*--release\b/i,
  /\bcurl\b.*\|\s*(bash|sh)/i,
];

const mediumRiskPatterns = [
  /\bnpm\s+install\b/i,
  /\bpnpm\s+install\b/i,
  /\byarn\s+add\b/i,
  /\bflutter\s+pub\s+get\b/i,
  /\bgit\s+commit\b/i,
  /\bgit\s+checkout\b/i,
];

export function classifyCommand(command: string): CommandRisk {
  const trimmed = command.trim();
  if (!trimmed) return "low";
  if (destructivePatterns.some((pattern) => pattern.test(trimmed))) return "destructive";
  if (highRiskPatterns.some((pattern) => pattern.test(trimmed))) return "high";
  if (mediumRiskPatterns.some((pattern) => pattern.test(trimmed))) return "medium";
  return "low";
}

export function evaluateCommand(command: string, mode: "virtual" | "pty"): EvoTermPolicyResult {
  const risk = classifyCommand(command);

  if (risk === "destructive") {
    return {
      allowed: false,
      risk,
      status: "blocked",
      reason: "BoundaryFilter blocked a destructive command. Owner approval is not enough without sandbox and rollback.",
      approvalRequired: true,
    };
  }

  if (risk === "high") {
    return {
      allowed: mode === "virtual",
      risk,
      status: mode === "virtual" ? "approval_required" : "approval_required",
      reason: "SovereignGate requires owner approval and proof before high-risk execution.",
      approvalRequired: true,
    };
  }

  if (risk === "medium") {
    return {
      allowed: mode === "virtual",
      risk,
      status: mode === "virtual" ? "ready" : "approval_required",
      reason: mode === "virtual"
        ? "Medium-risk command allowed only as virtual simulation."
        : "Medium-risk live PTY command requires explicit approval in this scaffold.",
      approvalRequired: mode === "pty",
    };
  }

  return {
    allowed: true,
    risk,
    status: "ready",
    reason: "Low-risk command allowed.",
    approvalRequired: false,
  };
}
