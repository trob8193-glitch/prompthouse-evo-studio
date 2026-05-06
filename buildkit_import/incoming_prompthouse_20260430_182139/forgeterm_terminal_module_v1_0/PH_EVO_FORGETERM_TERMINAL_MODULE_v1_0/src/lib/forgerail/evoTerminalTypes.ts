export type EvoTermMode = "virtual" | "pty";

export type CommandRisk = "low" | "medium" | "high" | "destructive";

export type CommandStatus =
  | "ready"
  | "running"
  | "blocked"
  | "approval_required"
  | "verified"
  | "failed";

export interface EvoTermProofReceipt {
  receiptId: string;
  command: string;
  mode: EvoTermMode;
  status: CommandStatus;
  risk: CommandRisk;
  outputPreview: string;
  createdAt: string;
  proofType: "terminal_output" | "pty_session" | "virtual_command";
  boundary: string;
}

export interface EvoTermPolicyResult {
  allowed: boolean;
  risk: CommandRisk;
  status: CommandStatus;
  reason: string;
  approvalRequired: boolean;
}

export interface EvoTermPaneProps {
  mode?: EvoTermMode;
  websocketUrl?: string;
  title?: string;
  projectName?: string;
  className?: string;
  onProofReceipt?: (receipt: EvoTermProofReceipt) => void;
}
