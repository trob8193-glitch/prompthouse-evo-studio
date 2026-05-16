/**
 * PH EVO STUDIO — PORTABLE AGENT SCHEMA (V1)
 * ═══════════════════════════════════════════════════════════════
 * Standardized configuration for PH Evo Agents.
 * Allows for external usage and GPT-style portability.
 */

export const AgentSchema = {
  version: "1.0.0",
  metadata: {
    id: "uuid-v4",
    name: "Agent Name",
    niche: "Generalist",
    author: "User_Sovereign"
  },
  intelligence: {
    iq_weight: 1.5,
    model_pref: "gemini-1.5-pro",
    denoiser_shard: "default.shard.json"
  },
  capabilities: {
    can_read_files: true,
    can_write_files: true,
    can_access_bridge: true,
    external_api_access: []
  },
  persona: {
    tone: "Professional/Direct",
    forbidden_drift: true,
    signature_truth_chain: "PH_EVO_CORE"
  }
};
