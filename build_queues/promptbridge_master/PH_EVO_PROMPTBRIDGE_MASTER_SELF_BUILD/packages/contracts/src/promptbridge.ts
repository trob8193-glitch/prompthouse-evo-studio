import { z } from "zod";

export const TrainingPolicySchema = z.object({
  captureEnabled: z.boolean().default(false),
  allowedForMemory: z.boolean().default(false),
  allowedForFinetune: z.boolean().default(false),
  allowedForPreferenceTraining: z.boolean().default(false),
  requiresReview: z.boolean().default(true),
  consentId: z.string().optional(),
  sourceRights: z.enum([
    "user_owned",
    "workspace_owned",
    "public_domain",
    "permissive_license",
    "unknown",
    "blocked"
  ]).default("unknown"),
  dataClass: z.enum([
    "prompt",
    "response",
    "user_edit",
    "accepted_output",
    "rejected_output",
    "tool_trace",
    "browser_workflow",
    "code_diff",
    "proof_result",
    "project_memory"
  ])
});

export const PromptBridgeEventSchema = z.object({
  eventId: z.string(),
  source: z.enum([
    "bridge_extension",
    "memory_box",
    "vscode_promptbridge",
    "flutter_sdk",
    "studio_dashboard",
    "external_client"
  ]),
  eventType: z.enum([
    "capture",
    "infer_request",
    "infer_response",
    "memory_write",
    "memory_query",
    "training_candidate",
    "user_feedback",
    "safe_action_request",
    "safe_action_result",
    "proof_evidence",
    "reality_claim"
  ]),
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  userId: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  payload: z.record(z.any()),
  training: TrainingPolicySchema.optional(),
  createdAt: z.string()
});

export type TrainingPolicy = z.infer<typeof TrainingPolicySchema>;
export type PromptBridgeEvent = z.infer<typeof PromptBridgeEventSchema>;
