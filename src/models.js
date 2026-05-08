/**
 * PH EVO STUDIO — MODELS (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Factory functions for all core data models. Every model is a
 * plain object with deterministic shape — no classes, no ORM.
 */

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Gate Definitions (used by computeAllGateScores) ──────────
export const GATE_DEFINITIONS = [
  { id: 'forge_friction',    label: 'Forge Friction',      owner: 'forge_rhino' },
  { id: 'swarm_fission',     label: 'Swarm Fission',       owner: 'swarm_falcon' },
  { id: 'vector_pack',       label: 'Vector Pack',         owner: 'vector_wolf' },
  { id: 'temporal_stack',    label: 'Temporal Stackchain', owner: 'temporal_raven' },
  { id: 'deploy_rail',       label: 'Deploy Rail',         owner: 'blueprint_orca' },
  { id: 'commerce_rail',     label: 'Commerce Rail',       owner: 'compiler_bearcat' },
  { id: 'nightforge',        label: 'NightForge',          owner: 'nightforge_daemon' },
  { id: 'browser_bridge',    label: 'Browser Bridge',      owner: 'evo' },
  { id: 'self_build',        label: 'Self Build',          owner: 'evo' },
  { id: 'security_audit',    label: 'Security Audit',      owner: 'cipher_lynx' },
  { id: 'promptlink',        label: 'PromptLink',          owner: 'conductor' },
  { id: 'worktwin',          label: 'WorkTwin',            owner: 'ledger' },
  { id: 'proof_ledger',      label: 'Proof Ledger',        owner: 'verifier' },
];

// ─── Fission Candidate ────────────────────────────────────────
export function createFissionCandidate(missionId, lane) {
  return {
    id: `candidate_${uid()}_${lane}`,
    missionId,
    lane,
    status: 'pending',
    testScore: 0,
    securityScore: 0,
    uxScore: 0,
    costScore: 0,
    maintainabilityScore: 0,
    response: '',
    filesChanged: [],
    errorMessage: null,
    createdAt: new Date().toISOString(),
  };
}

// ─── Proof Receipt ────────────────────────────────────────────
export function createProofReceipt(missionId, action, status, meta = {}) {
  return {
    id: `receipt_${uid()}`,
    missionId,
    action,
    status,
    meta,
    timestamp: new Date().toISOString(),
  };
}

// ─── Temporal Stack ───────────────────────────────────────────
export function createTemporalStack(missionId, title) {
  return {
    id: `temporal_${uid()}`,
    missionId,
    title,
    nowPlan: '',
    sixMonthRefactor: '',
    twelveMonthDeprecationPath: '',
    techStack: [],
    createdAt: new Date().toISOString(),
  };
}

// ─── Friction Report ──────────────────────────────────────────
export function createFrictionReport(missionId, score, reasons, blocked) {
  return {
    id: `friction_${uid()}`,
    missionId,
    score,
    reasons,
    blocked,
    repairPrompt: blocked ? `Fix friction issues: ${reasons.join('; ')}` : null,
    timestamp: new Date().toISOString(),
  };
}
