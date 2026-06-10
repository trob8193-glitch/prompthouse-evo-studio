/**
 * PH EVO STUDIO — VECTOR PACK (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Compresses mission context into a dense, LLM-ready string.
 * Secrets are auto-redacted. Storage is safe in browser and Node/headless proof runs.
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

// ─── Browser/Node Safe Storage Shim ─────────────────────────────
const memoryStore = new Map();

const safeStorage = (() => {
  const storage = globalThis?.localStorage;
  if (storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function') {
    return storage;
  }

  return {
    getItem: (key) => memoryStore.get(key) ?? null,
    setItem: (key, value) => memoryStore.set(key, String(value)),
    removeItem: (key) => memoryStore.delete(key),
    clear: () => memoryStore.clear(),
  };
})();

function safeRandomId() {
  if (globalThis?.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10).padEnd(8, '0');
}

function findSecretMatches(text = '') {
  const source = String(text);
  const matches = [];

  for (const pattern of SECRET_PATTERNS) {
    const found = source.match(pattern);
    if (found) {
      matches.push(...found.map((value) => ({
        type: 'secret_pattern',
        length: value.length,
        preview: `${value.slice(0, 4)}…${value.slice(-4)}`,
      })));
    }
  }

  return matches;
}

function redactSecrets(text = '') {
  let clean = String(text ?? '');
  for (const pattern of SECRET_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED]');
  }
  return clean;
}

function redactArray(values = []) {
  return values.map((value) => redactSecrets(String(value)));
}

function uid() {
  return `${Date.now().toString(36)}-${safeRandomId()}`;
}

function load() {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(packs) {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  } catch {
    // Storage may be unavailable or quota-limited. VectorPack creation should still return a pack.
  }
}

/**
 * Build a compressed context VectorPack for a mission.
 * @param {string} missionId
 * @param {object} context - { rawSummary, decisions, openBlockers, fileMap }
 * @returns {object} VectorPack
 */
export function buildVectorPack(missionId, context = {}) {
  const { rawSummary = '', decisions = [], openBlockers = [], fileMap = {} } = context;
  const redactedSummary = redactSecrets(rawSummary);
  const redactedDecisions = redactArray(decisions);
  const redactedBlockers = redactArray(openBlockers);
  const redactions = [
    ...findSecretMatches(rawSummary),
    ...decisions.flatMap((decision) => findSecretMatches(decision)),
    ...openBlockers.flatMap((blocker) => findSecretMatches(blocker)),
  ];

  const pack = {
    id: `vpack_${uid()}`,
    missionId,
    rawSummary: redactedSummary,
    contextSummary: redactedSummary,
    decisions: redactedDecisions,
    decisionLog: redactedDecisions,
    openBlockers: redactedBlockers,
    fileMap,
    redactions,
    contextString: packToContextString({
      missionId,
      rawSummary: redactedSummary,
      decisions: redactedDecisions,
      openBlockers: redactedBlockers,
    }),
    createdAt: new Date().toISOString(),
  };

  const all = load();
  if (!all[missionId]) all[missionId] = [];
  all[missionId].unshift(pack);
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
  if (rawSummary) parts.push(`CONTEXT:\n${redactSecrets(rawSummary).trim()}`);
  if (decisions.length > 0) {
    parts.push(`DECISIONS:\n${redactArray(decisions).map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
  }
  if (openBlockers.length > 0) {
    parts.push(`OPEN BLOCKERS:\n${redactArray(openBlockers).map((b, i) => `${i + 1}. ${b}`).join('\n')}`);
  }
  return parts.join('\n\n');
}
