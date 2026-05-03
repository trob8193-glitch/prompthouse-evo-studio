/**
 * PromptHouse Evo Studio — VectorPack Compression Engine
 * Step 9: Add VectorPack Compression
 * Owner: Vector Wolf | Cipher Lynx guards secrets
 *
 * Doctrine: Creates structured summaries, code maps, decision logs,
 * symbol tables, and selective retrieval hints.
 * Does NOT replace full context with a hash — creates smart structured summaries.
 * Forbidden: secrets, raw_private_data, tokens
 */

import { createVectorPack } from './models.js';
import { saveVectorPack, addProofReceipt } from './prompt-base.js';

const FORBIDDEN_PATTERNS = [
  /sk-[a-zA-Z0-9_-]{10,}/g,          // OpenAI keys (real or test)
  /Bearer\s+[a-zA-Z0-9._-]{10,}/g, // Bearer tokens
  /password\s*[:=]\s*\S+/gi,        // Passwords
  /secret\s*[:=]\s*\S+/gi,          // Secrets
  /api[_-]?key\s*[:=]\s*\S+/gi,    // API keys
  /private[_-]?key/gi,              // Private keys
];

const REDACTION_SOVEREIGN_IMPLEMENTATION = '[REDACTED_BY_CIPHER_LYNX]';

/**
 * Redact secrets from text — Cipher Lynx protocol
 */
function redactSecrets(text) {
  let redacted = text;
  const found = [];
  FORBIDDEN_PATTERNS.forEach(pattern => {
    if (pattern.test(redacted)) {
      found.push(pattern.source);
      redacted = redacted.replace(pattern, REDACTION_SOVEREIGN_IMPLEMENTATION);
    }
    pattern.lastIndex = 0;
  });
  return { redacted, redactions: found };
}

/**
 * Build a VectorPack from mission context
 * @param {string} missionId
 * @param {object} context - { fileMap, decisions, openBlockers, apiContracts, rawSummary }
 * @returns {VectorPack}
 */
export function buildVectorPack(missionId, context = {}) {
  const {
    fileMap = {},
    decisions = [],
    openBlockers = [],
    apiContracts = {},
    rawSummary = '',
  } = context;

  // Redact all text content
  const { redacted: safeSummary, redactions: summaryRedactions } = redactSecrets(rawSummary);

  // Build clean file map (redact values)
  const safeFileMap = {};
  const fileRedactions = [];
  Object.entries(fileMap).forEach(([k, v]) => {
    const { redacted, redactions } = redactSecrets(String(v));
    safeFileMap[k] = redacted;
    if (redactions.length) fileRedactions.push(...redactions);
  });

  // Sanitize decisions
  const safeDecisions = decisions.map(d => {
    const { redacted } = redactSecrets(String(d));
    return redacted;
  });

  // Build retrieval hints from file names and decision keywords
  const retrievalHints = [
    ...Object.keys(safeFileMap).slice(0, 10),
    ...safeDecisions.flatMap(d => d.split(' ').filter(w => w.length > 5)).slice(0, 10),
    ...openBlockers.map(b => `BLOCKED:${b}`).slice(0, 5),
  ];

  const pack = createVectorPack(missionId, {
    fileMap: safeFileMap,
    decisionLog: safeDecisions,
    contextSummary: safeSummary,
    retrievalHints: [...new Set(retrievalHints)],
    redactions: [...summaryRedactions, ...fileRedactions],
  });

  saveVectorPack(pack);

  addProofReceipt(missionId, 'vector_pack:build', 'verified', {
    evidenceType: 'vector_pack_summary',
    evidenceUri: 'memory:vector_pack',
  });

  return pack;
}

/**
 * Convert a VectorPack into an optimized context string for API calls
 * Reduces token count significantly vs. sending raw files
 */
export function packToContextString(pack) {
  if (!pack) return '';
  const lines = [
    `MISSION: ${pack.missionId}`,
    `SUMMARY: ${pack.contextSummary}`,
    `FILES: ${Object.keys(pack.fileMap).join(', ')}`,
    `DECISIONS: ${pack.decisionLog.slice(0, 5).join(' | ')}`,
    `HINTS: ${pack.retrievalHints.slice(0, 8).join(', ')}`,
  ];
  return lines.join('\n');
}
