/**
 * PromptHouse Evo Studio — Pattern Miner Engine
 * Owner: Signal Foxhound | Blueprint Section 5.1
 *
 * Detects repeatable work patterns from WorkTwin signals.
 * NEVER learns globally from private data without consent.
 * Patterns are scoped to owner only unless explicitly shared.
 */

import { getAllSignals, createToolRecipe, saveRecipe } from './worktwin-vault.js';
import { addProofReceipt } from './prompt-base.js';

const PATTERNS_KEY = 'ph_evo_patterns';

export function createPattern(overrides = {}) {
  return {
    id: `pattern_${Date.now()}`,
    ownerUserId: 'local_owner',
    patternType: 'repeat_prompt',
    frequency: 1,
    examples: [],
    suggestedToolType: 'template',
    friction: 'low',
    status: 'inferred',
    consentRequired: true, // NEVER share without explicit consent
    detectedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function getAllPatterns() {
  try { return JSON.parse(localStorage.getItem(PATTERNS_KEY) || '[]'); }
  catch { return []; }
}

export function savePattern(pattern) {
  const all = getAllPatterns();
  const idx = all.findIndex(p => p.id === pattern.id);
  if (idx >= 0) { all[idx] = pattern; } else { all.unshift(pattern); }
  localStorage.setItem(PATTERNS_KEY, JSON.stringify(all.slice(0, 50)));
  return pattern;
}

/**
 * Scan WorkTwin signals and detect repeatable patterns
 * @param {object} opts - { minFrequency }
 * @returns {Pattern[]}
 */
export function runPatternMiner(opts = {}) {
  const { minFrequency = 2 } = opts;
  const signals = getAllSignals();

  // Group signals by patternType
  const groups = {};
  signals.forEach(s => {
    if (!groups[s.patternType]) groups[s.patternType] = [];
    groups[s.patternType].push(s);
  });

  const detectedPatterns = [];

  Object.entries(groups).forEach(([type, group]) => {
    if (group.length >= minFrequency) {
      const existing = getAllPatterns().find(p => p.patternType === type);
      const pattern = createPattern({
        id: existing?.id || `pattern_${Date.now()}_${type}`,
        patternType: type,
        frequency: group.length,
        examples: group.slice(0, 3).map(s => s.redactedContext.slice(0, 100)),
        suggestedToolType: type === 'repeat_workflow' ? 'agent' : type === 'repeat_error' ? 'extension' : 'template',
        friction: group.length > 5 ? 'high' : group.length > 2 ? 'medium' : 'low',
        status: 'recommended',
      });
      savePattern(pattern);
      detectedPatterns.push(pattern);
    }
  });

  addProofReceipt('pattern_miner', 'pattern_miner:scan', detectedPatterns.length > 0 ? 'built' : 'verified', {
    evidenceType: 'pattern_scan_result',
    evidenceUri: 'memory:patterns',
  });

  return detectedPatterns;
}

/**
 * Generate a tool recipe from a detected pattern
 */
export function generateRecipeFromPattern(pattern) {
  const typeMap = {
    repeat_prompt: { type: 'template', name: 'Prompt Template' },
    repeat_workflow: { type: 'agent', name: 'Workflow Agent' },
    repeat_error: { type: 'extension', name: 'Error Fix Extension' },
    repeat_doc: { type: 'promptlink_adapter', name: 'Doc Adapter' },
  };

  const mapped = typeMap[pattern.patternType] || { type: 'template', name: 'Custom Tool' };

  const recipe = createToolRecipe({
    name: `Auto: ${mapped.name} (${pattern.frequency}x detected)`,
    type: mapped.type,
    sourceSignals: [pattern.id],
    promptRecipe: `Auto-generated from ${pattern.frequency} detected instances of "${pattern.patternType}". Examples:\n${pattern.examples.join('\n')}`,
    testPlan: ['Verify tool output matches expected pattern', 'Confirm no secrets in recipe', 'Owner approval required for sharing'],
    proofRequired: ['test_run', 'owner_approval', 'no_secret_check'],
    exportTargets: ['vault'],
    status: 'recommended',
  });

  saveRecipe(recipe);

  addProofReceipt('pattern_miner', 'pattern_miner:recipe_generated', 'built', {
    evidenceType: 'tool_recipe',
    evidenceUri: `memory:recipe:${recipe.id}`,
  });

  return recipe;
}
