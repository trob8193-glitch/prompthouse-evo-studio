/**
 * PromptHouse Evo Studio — ForgeFriction Gate
 * Step 7: Add ForgeFriction Gate
 * Owner: Forge Rhino | block_above_score: 80 | warn_above_score: 45
 *
 * Doctrine: Detects bad requests before generating code.
 * Rejects prompts that would create security risk, tech debt, impossible scope,
 * hidden cost, or privacy violations. Override requires Sovereignty proof.
 */

import { createFrictionReport } from './models.js';
import { addProofReceipt } from './prompt-base.js';

const FRICTION_DIMENSIONS = ['security', 'complexity', 'data_risk', 'cost', 'maintainability', 'legality'];

const BLOCK_THRESHOLD = 60;
const WARN_THRESHOLD = 30;

// ─── Red Flag Patterns ──────────────────────────────────────────────────────────
const SECURITY_FLAGS = [
  /store.*password.*plain/i, /no.*auth/i, /skip.*validation/i,
  /eval\s*\(/i, /exec\s*\(/i, /sql.*concat/i, /no.*sanitiz/i,
  /password\s*[:=]\s*\S+/i,
  /api[_-]?key\s*[:=]\s*\S+/i,
];
const COMPLEXITY_FLAGS = [
  /everything/i, /all features/i, /entire platform/i,
  /complete app.*one prompt/i, /full system/i,
];
const DATA_RISK_FLAGS = [
  /delete.*all/i, /drop.*table/i, /wipe.*database/i,
  /expose.*api.*key/i, /log.*password/i,
  /expose\s+api/i,
];
const COST_FLAGS = [
  /call.*api.*every.*keystroke/i, /real.time.*gpt.*every/i,
  /no.*cache/i,
];
const LEGALITY_FLAGS = [
  /bypass.*copyright/i, /scrape.*without.*permission/i,
  /impersonat/i, /steal/i,
];

function scoreFlags(prompt, flags) {
  return flags.reduce((score, flag) => flag.test(prompt) ? score + 20 : score, 0);
}

/**
 * Run the ForgeFriction gate on a user prompt
 * @param {string} missionId
 * @param {string} userPrompt
 * @param {boolean} sovereigntyOverride - Allows bypass with proof
 * @returns {{ report, blocked, warned }}
 */
export function runForgeFriction(missionId, userPrompt, sovereigntyOverride = false) {
  const reasons = [];
  let totalScore = 0;

  const secScore = Math.min(100, scoreFlags(userPrompt, SECURITY_FLAGS) * 3); // Triple impact
  const compScore = Math.min(80, scoreFlags(userPrompt, COMPLEXITY_FLAGS));
  const dataScore = Math.min(100, scoreFlags(userPrompt, DATA_RISK_FLAGS) * 2); // Double impact
  const costScore = Math.min(60, scoreFlags(userPrompt, COST_FLAGS));
  const maintScore = userPrompt.length > 2000 ? 30 : 0;
  const legalScore = Math.min(100, scoreFlags(userPrompt, LEGALITY_FLAGS));

  if (secScore > 0) reasons.push(`Security risk detected (score: ${secScore}). ${secScore >= 40 ? 'CRITICAL: This prompt may expose vulnerabilities.' : 'Review before proceeding.'}`);
  if (compScore > 0) reasons.push(`Complexity overload detected (score: ${compScore}). Break into smaller missions.`);
  if (dataScore > 0) reasons.push(`Data risk detected (score: ${dataScore}). Destructive or privacy-exposing patterns found.`);
  if (costScore > 0) reasons.push(`High API cost pattern detected (score: ${costScore}). Add caching or rate-limiting.`);
  if (maintScore > 0) reasons.push(`Prompt too long (score: ${maintScore}). Consider splitting into sub-missions.`);
  if (legalScore > 0) reasons.push(`Legal risk pattern detected (score: ${legalScore}). Review for compliance.`);

  // Weighted friction score
  const weightedSum = Math.min(100, Math.round(
    (secScore * 0.50) + (compScore * 0.15) + (dataScore * 0.30) +
    (costScore * 0.05) + (maintScore * 0.05) + (legalScore * 0.10)
  ));

  // Multi-flag additive override
  const triggeredDimensions = [secScore, compScore, dataScore, costScore, legalScore].filter(s => s > 0).length;
  const multiFlag = triggeredDimensions >= 2 ? 40 : 0;
  totalScore = Math.max(secScore, weightedSum + multiFlag); // Guarantee score is at least the highest single flag impact

  const blocked = totalScore >= BLOCK_THRESHOLD && !sovereigntyOverride;
  const warned = totalScore >= WARN_THRESHOLD && !blocked;

  let repairPrompt = '';
  if (reasons.length > 0) {
    repairPrompt = `Rewrite your prompt to address these issues:\n${reasons.map((r, i) => `${i+1}. ${r}`).join('\n')}`;
  }

  const report = createFrictionReport(missionId, totalScore, reasons, blocked);

  // Write proof receipt
  addProofReceipt(missionId, 'forge_friction:check', blocked ? 'blocked' : warned ? 'built' : 'verified', {
    evidenceType: 'friction_report',
    evidenceUri: 'memory:friction_report',
  });

  return { report, blocked, warned };
}
