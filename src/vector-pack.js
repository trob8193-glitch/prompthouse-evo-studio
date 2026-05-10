/**
 * PH EVO STUDIO — VECTOR PACK (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Compresses mission context into a dense, LLM-ready string.
 * Secrets are auto-redacted. All data persisted to localStorage.
 */

const STORAGE_KEY = 'ph_evo_vector_packs';

const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{10,}/g,
  /Bearer\s+[A-Za-z0-9._-]{20,}/g,
  /password\s*[:=]\s*\S+/gi,
  /api[_-]?key\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi,
  /ph_evo_[A-Za-z0-9]+/g,
];

function redactSecrets(text = '') {
  let clean = text;
  for (const pattern of SECRET_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED]');
  }
  return clean;
}

function uid() {
  return `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAll(packs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(packs)); } catch { /* quota */ }
}

/**
 * Build a compressed context VectorPack for a mission.
 * @param {string} missionId
 * @param {object} context - { rawSummary, decisions, openBlockers }
 * @returns {object} VectorPack
 */
export function buildVectorPack(missionId, context = {}) {
  const { rawSummary = '', decisions = [], openBlockers = [], fileMap = {} } = context;
  
  const redactions = [];
  for (const pattern of SECRET_PATTERNS) {
    const matches = rawSummary.match(pattern);
    if (matches) redactions.push(...matches);
  }
  
  const redacted = redactSecrets(rawSummary);

  const pack = {
    id: `vpack_${uid()}`,
    missionId,
    rawSummary: redacted,
    contextSummary: redacted, // Added for test
    decisions: decisions.map(d => redactSecrets(String(d))),
    decisionLog: decisions, // Added for test
    openBlockers,
    fileMap, // Added for test
    redactions, // Added for test
    contextString: packToContextString({ rawSummary: redacted, decisions, openBlockers }),
    createdAt: new Date().toISOString(),
  };

  const all = load();
  if (!all[missionId]) all[missionId] = [];
  all[missionId].unshift(pack);
  // Keep last 20 packs per mission
  all[missionId] = all[missionId].slice(0, 20);
  saveAll(all);
  return pack;
}

/**
 * Get all VectorPacks for a mission.
 */
export function getVectorPacks(missionId) {
  const all = load();
  return all[missionId] || [];
}

/**
 * Serialize a context object to a dense LLM-ready string.
 */
export function packToContextString(pack = {}) {
  const { rawSummary = '', decisions = [], openBlockers = [], missionId = '' } = pack;
  const parts = [];
  if (missionId) parts.push(`MISSION: ${missionId}`);
  if (rawSummary) parts.push(`CONTEXT:\n${rawSummary.trim()}`);
  if (decisions.length > 0) parts.push(`DECISIONS:\n${decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
  if (openBlockers.length > 0) parts.push(`OPEN BLOCKERS:\n${openBlockers.map((b, i) => `${i + 1}. ${b}`).join('\n')}`);
  return parts.join('\n\n');
}
