/**
 * PH EVO STUDIO — PROMPT BASE (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Central data layer for missions, proof receipts, gate scores,
 * commerce specs, and patch proposals. All state is persisted to
 * localStorage so data survives page reloads.
 */

const STORAGE_KEYS = {
  MISSIONS:        'ph_evo_missions',
  RECEIPTS:        'ph_evo_receipts',
  POLICY:          'ph_evo_sovereignty_policy',
  COMMERCE_SPECS:  'ph_evo_commerce_specs',
  PATCH_PROPOSALS: 'ph_evo_patch_proposals',
};

// ─── Helpers ───────────────────────────────────────────────────
function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded */ }
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Sovereignty Policy ────────────────────────────────────────
export function getSovereigntyPolicy() {
  return localStorage.getItem(STORAGE_KEYS.POLICY) || 'sovereign';
}

export function setSovereigntyPolicy(policy) {
  localStorage.setItem(STORAGE_KEYS.POLICY, policy);
}

// ─── Missions ─────────────────────────────────────────────────
export function getAllMissions() {
  return load(STORAGE_KEYS.MISSIONS, []);
}

export function createAndSaveMission({ title = 'Untitled', intent = '' } = {}) {
  const missions = getAllMissions();
  const mission = {
    id: `mission_${uid()}`,
    title,
    intent,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  missions.unshift(mission);
  save(STORAGE_KEYS.MISSIONS, missions);
  return mission;
}

export function saveMission(mission) {
  const missions = getAllMissions();
  const idx = missions.findIndex(m => m.id === mission.id);
  const updated = { ...mission, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    missions[idx] = updated;
  } else {
    missions.unshift(updated);
  }
  save(STORAGE_KEYS.MISSIONS, missions);
  return updated;
}

export function deleteMission(missionId) {
  const missions = getAllMissions().filter(m => m.id !== missionId);
  save(STORAGE_KEYS.MISSIONS, missions);
}

// ─── Proof Receipts ────────────────────────────────────────────
export function getAllReceipts() {
  return load(STORAGE_KEYS.RECEIPTS, []);
}

export function addProofReceipt(missionId, action, status, meta = {}) {
  const receipts = getAllReceipts();
  const receipt = {
    id: `receipt_${uid()}`,
    missionId,
    action,
    status, // 'verified' | 'broken' | 'built' | 'blocked'
    meta,
    timestamp: new Date().toISOString(),
  };
  receipts.unshift(receipt);
  // Keep last 500 receipts
  save(STORAGE_KEYS.RECEIPTS, receipts.slice(0, 500));
  return receipt;
}

// ─── Gate Scores ──────────────────────────────────────────────
export function computeAllGateScores(gateDefinitions = []) {
  const receipts = getAllReceipts();
  return gateDefinitions.map(gate => {
    const gateReceipts = receipts.filter(r => r.action?.startsWith(gate.id));
    const latest = gateReceipts[0];
    const score = latest
      ? (latest.status === 'verified' ? 100 : latest.status === 'built' ? 60 : 0)
      : 0;
    return { ...gate, score, lastRun: latest?.timestamp || null };
  });
}

// ─── Commerce Specs ───────────────────────────────────────────
export function getAllCommerceSpecs() {
  return load(STORAGE_KEYS.COMMERCE_SPECS, []);
}

export function saveCommerceSpec(spec) {
  const specs = getAllCommerceSpecs();
  const idx = specs.findIndex(s => s.id === spec.id);
  if (idx >= 0) specs[idx] = spec;
  else specs.unshift(spec);
  save(STORAGE_KEYS.COMMERCE_SPECS, specs);
  return spec;
}

// ─── Patch Proposals ──────────────────────────────────────────
export function getAllPatchProposals() {
  return load(STORAGE_KEYS.PATCH_PROPOSALS, []);
}

export function addPatchProposal(proposal) {
  const proposals = getAllPatchProposals();
  const entry = {
    id: `patch_${uid()}`,
    ...proposal,
    createdAt: new Date().toISOString(),
    approved: false,
  };
  proposals.unshift(entry);
  save(STORAGE_KEYS.PATCH_PROPOSALS, proposals.slice(0, 100));
  return entry;
}

// ─── Bridge Sync ──────────────────────────────────────────────
const BRIDGE_URL = 'http://127.0.0.1:3001';

export async function syncTruthFromBridge() {
  try {
    const res = await fetch(`${BRIDGE_URL}/status`);
    if (!res.ok) throw new Error(`Bridge status ${res.status}`);
    return await res.json();
  } catch (err) {
    return { connected: false, error: err.message };
  }
}
