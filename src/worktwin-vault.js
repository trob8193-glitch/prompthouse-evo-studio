/**
 * PromptHouse Evo Studio — Evo WorkTwin Vault Engine
 * Blueprint: PromptHouse_Evo_Autonomous_SelfBuild_Command_Center_Blueprint_v1_0.docx
 * Owner: Evo | Section 5 — WorkTwin Marketplace
 *
 * Captures approved workflow signals from browser/studio/API/extension.
 * Generates reusable tool recipes from repeated patterns.
 * NEVER learns from private data without consent.
 */

import { addProofReceipt } from './prompt-base.js';

const WORKTWIN_KEY = 'ph_evo_worktwin_signals';
const RECIPES_KEY = 'ph_evo_tool_recipes';

// ─── WorkTwin Signal ───────────────────────────────────────────────────────────
export function createWorkTwinSignal(overrides = {}) {
  return {
    id: `signal_${Date.now()}`,
    ownerUserId: 'local_owner',
    source: 'studio', // browser | studio | api | extension
    patternType: 'repeat_prompt', // repeat_prompt | repeat_error | repeat_doc | repeat_workflow
    sourceUrl: null,
    redactedContext: '',
    consentScope: 'private', // private | team | marketplace_candidate
    capturedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Tool Recipe ───────────────────────────────────────────────────────────────
export function createToolRecipe(overrides = {}) {
  return {
    id: `recipe_${Date.now()}`,
    ownerUserId: 'local_owner',
    name: '',
    type: 'template', // agent | extension | template | promptlink_adapter | forgerail_rail | app
    sourceSignals: [],
    promptRecipe: '',
    testPlan: [],
    proofRequired: ['test_run', 'owner_approval'],
    exportTargets: ['vault'],
    status: 'inferred',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Storage ───────────────────────────────────────────────────────────────────
export function getAllSignals() {
  try { return JSON.parse(localStorage.getItem(WORKTWIN_KEY) || '[]'); }
  catch { return []; }
}

export function saveSignal(signal) {
  const all = getAllSignals();
  all.unshift(signal);
  localStorage.setItem(WORKTWIN_KEY, JSON.stringify(all.slice(0, 200)));
  return signal;
}

export function getAllRecipes() {
  try { return JSON.parse(localStorage.getItem(RECIPES_KEY) || '[]'); }
  catch { return []; }
}

export function saveRecipe(recipe) {
  const all = getAllRecipes();
  const idx = all.findIndex(r => r.id === recipe.id);
  if (idx >= 0) { all[idx] = recipe; } else { all.unshift(recipe); }
  localStorage.setItem(RECIPES_KEY, JSON.stringify(all.slice(0, 100)));
  return recipe;
}

/**
 * Capture an approved workflow signal into the WorkTwin Vault
 * @param {object} params - { source, patternType, context, consentScope }
 */
export function captureWorkflowSignal(params = {}) {
  const { source = 'studio', patternType = 'repeat_prompt', context = '', consentScope = 'private' } = params;

  // Redact secrets from context before storing (Cipher Lynx protocol)
  const redacted = context
    .replace(/sk-[a-zA-Z0-9_-]{10,}/g, '[REDACTED_KEY]')
    .replace(/password\s*[:=]\s*\S+/gi, '[REDACTED_PASS]')
    .replace(/Bearer\s+\S+/gi, '[REDACTED_TOKEN]');

  const signal = createWorkTwinSignal({ source, patternType, redactedContext: redacted, consentScope, sourceUrl: window?.location?.href || null });
  saveSignal(signal);

  addProofReceipt('worktwin', 'worktwin:capture', 'built', {
    evidenceType: 'workflow_signal',
    evidenceUri: `memory:worktwin_signal:${signal.id}`,
  });

  return signal;
}
