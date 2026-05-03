/**
 * PromptHouse Evo Studio — Core Data Models
 * Source: PromptHouse_Evo_Max_Execution_Past_MVP_Build_Packet_v1_0.docx
 * Owner: Evo | Verifier gates | Boundary enforces
 *
 * Truth States: known | inferred | blocked | broken | built | verified | recommended
 */

// ─── Truth State ───────────────────────────────────────────────────────────────
export const TRUTH_STATES = ['known','inferred','blocked','broken','built','verified','recommended'];

// ─── Studio Mission ────────────────────────────────────────────────────────────
export function createMission(overrides = {}) {
  return {
    id: `mission_${Date.now()}`,
    ownerUserId: 'local_owner',
    title: '',
    intent: '',
    activeBot: 'evo',
    truthStates: ['known'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Fission Candidate ─────────────────────────────────────────────────────────
export function createFissionCandidate(missionId, lane, overrides = {}) {
  return {
    id: `fission_${Date.now()}_${lane}`,
    missionId,
    lane, // conservative | fast | scalable | premium_ui | low_cost
    filesChanged: [],
    testScore: 0,
    securityScore: 0,
    uxScore: 0,
    costScore: 0,
    maintainabilityScore: 0,
    status: 'inferred',
    ...overrides,
  };
}

// ─── Friction Report ───────────────────────────────────────────────────────────
export function createFrictionReport(missionId, overrides = {}) {
  return {
    id: `friction_${Date.now()}`,
    missionId,
    score: 0,
    blocked: false,
    reasons: [],
    repairPrompt: '',
    ...overrides,
  };
}

// ─── Temporal Stack ────────────────────────────────────────────────────────────
export function createTemporalStack(missionId, overrides = {}) {
  return {
    missionId,
    nowPlan: '',
    sixMonthRefactor: '',
    twelveMonthDeprecationPath: '',
    riskNotes: [],
    ...overrides,
  };
}

// ─── VectorPack ────────────────────────────────────────────────────────────────
export function createVectorPack(missionId, overrides = {}) {
  return {
    missionId,
    fileMap: {},
    decisionLog: [],
    contextSummary: '',
    retrievalHints: [],
    redactions: [],
    ...overrides,
  };
}

// ─── Proof Receipt ─────────────────────────────────────────────────────────────
export function createProofReceipt(missionId, action, status, overrides = {}) {
  return {
    id: `receipt_${Date.now()}`,
    missionId,
    action,
    status, // TruthState
    evidenceType: 'log',
    evidenceUri: null,
    timestamp: new Date().toISOString(),
    rollback: null,
    ...overrides,
  };
}

// ─── Commerce Spec ─────────────────────────────────────────────────────────────
export function createCommerceSpec(missionId, overrides = {}) {
  return {
    id: `commerce_${Date.now()}`,
    missionId,
    mode: 'mock', // mock | test | live
    productName: '',
    price: 0,
    currency: 'usd',
    stripePaymentLinkUrl: null,
    approvalRequired: true,
    status: 'inferred',
    receipt: null,
    ...overrides,
  };
}

// ─── Deploy Receipt ────────────────────────────────────────────────────────────
export function createDeployReceipt(missionId, overrides = {}) {
  return {
    id: `deploy_${Date.now()}`,
    missionId,
    stage: 'dry_run', // test|build|secret_check|preview|owner_approval|production|rollback
    provider: null, // vercel|netlify|firebase|aws
    deployUrl: null,
    approvalRequired: true,
    status: 'inferred',
    log: [],
    ...overrides,
  };
}

// ─── NightForge Patch Proposal ─────────────────────────────────────────────────
export function createPatchProposal(overrides = {}) {
  return {
    id: `patch_${Date.now()}`,
    triggeredAt: new Date().toISOString(),
    scannedItems: [],
    proposedActions: [],
    testResults: [],
    status: 'inferred',
    prUrl: null,
    cannot: ['silent_production_deploy','delete_data','expose_secrets'],
    circuitBreaks: 0, // NEW: Track failed attempts to prevent runaway loops
    ...overrides,
  };
}

// ─── Neural Dream State (Offline Cache) ────────────────────────────────────────
export function createDreamCache(overrides = {}) {
  return {
    id: `dream_${Date.now()}`,
    events: [], // [{ type: 'friction', component: 'DeployRail', message: 'Blocked by config', timestamp: '...' }]
    synced: false,
    ...overrides,
  };
}

// ─── Gate Score ────────────────────────────────────────────────────────────────
export const GATE_DEFINITIONS = [
  { id: 'fission_arena',    label: 'Swarm Fission Arena',     owner: 'swarm_falcon' },
  { id: 'forge_friction',   label: 'ForgeFriction Gate',      owner: 'forge_rhino' },
  { id: 'temporal_stack',   label: 'Temporal Stackchain',     owner: 'temporal_raven' },
  { id: 'vector_pack',      label: 'VectorPack Compression',  owner: 'vector_wolf' },
  { id: 'deploy_rail',      label: 'Sovereign DeployRail',    owner: 'blueprint_orca' },
  { id: 'commerce_rail',    label: 'Commerce Rail',           owner: 'compiler_bearcat' },
  { id: 'nightforge',       label: 'NightForge Daemon',       owner: 'temporal_raven' },
  { id: 'proof_deck',       label: 'Proof Deck',              owner: 'verifier' },
  { id: 'browser_bridge',   label: 'Browser Agent Bridge',    owner: 'cipher_lynx' },
  { id: 'prompt_base',      label: 'PromptBase & Missions',   owner: 'memory' },
  { id: 'live_forge',       label: 'LiveForge Preview',       owner: 'forge_rhino' },
  { id: 'forge_render',     label: 'ForgeRender Pipeline',    owner: 'builder' },
  { id: 'self_build',       label: 'Self-Build Cycle',        owner: 'sovereignty' },
];

export function scoreGate(gateId, proofReceipts = []) {
  const relevant = proofReceipts.filter(r => r.action && r.action.includes(gateId));
  if (relevant.length === 0) return 0;
  const verified = relevant.filter(r => r.status === 'verified').length;
  return Math.round((verified / relevant.length) * 100);
}
