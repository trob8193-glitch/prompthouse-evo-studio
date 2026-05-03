/**
 * PromptHouse Evo Studio — Tool Autogenerator Engine
 * Owner: Compiler Bearcat | Blueprint Section 5.1
 *
 * Generates agent/app/extension/template recipes from approved patterns.
 * All outputs are saved to vault and require owner approval before publishing.
 */

import { getAllRecipes, saveRecipe, createToolRecipe } from './worktwin-vault.js';
import { addProofReceipt } from './prompt-base.js';

const TOOL_TYPES = ['agent', 'extension', 'template', 'promptlink_adapter', 'forgerail_rail', 'app'];

/**
 * Auto-generate a tool recipe from a user intent + source signals
 * @param {object} params - { intent, type, sourceSignals, callBridge }
 * @returns {Promise<{recipe, code}>}
 */
export async function autoGenerateTool(params = {}) {
  const { intent = '', type = 'template', sourceSignals = [], callBridge = null } = params;

  if (!TOOL_TYPES.includes(type)) {
    return { error: `Invalid tool type: ${type}. Valid: ${TOOL_TYPES.join(', ')}` };
  }

  let promptRecipe = '';
  let generatedCode = '';

  if (callBridge) {
    try {
      const prompt = `You are Compiler Bearcat, the PromptHouse Evo Tool Autogenerator.

Generate a ${type} tool for the following intent:
"${intent}"

Output JSON with:
{
  "promptRecipe": "A clear, reusable prompt or spec for this tool (2-4 sentences)",
  "generatedCode": "Minimal code scaffold or prompt template for this ${type}",
  "testPlan": ["test 1", "test 2"],
  "exportTargets": ["vault"]
}

RULES:
- No secrets, API keys, or private data in the output.
- Mark as draft/template only — owner must approve before publishing.
- If intent is unclear, scaffold a minimal version and note what's missing.`;

      const raw = await callBridge(prompt);
      try {
        const parsed = JSON.parse(raw.replace(/```json\n?|```/g, '').trim());
        promptRecipe = parsed.promptRecipe || intent;
        generatedCode = parsed.generatedCode || '';
      } catch {
        promptRecipe = intent;
        generatedCode = `// Auto-generated ${type} scaffold\n// Intent: ${intent}\n// Requires: owner review before use`;
      }
    } catch {
      promptRecipe = intent;
      generatedCode = `// [DRY RUN] ${type} scaffold for: "${intent}"\n// Bridge offline — connect PromptBridge for AI generation`;
    }
  } else {
    promptRecipe = `[DRY RUN] ${type}: ${intent}`;
    generatedCode = `// [DRY RUN] Auto-generated ${type}\n// Intent: ${intent}\n// Connect PromptBridge for full generation`;
  }

  const recipe = createToolRecipe({
    name: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${intent.slice(0, 50)}`,
    type,
    sourceSignals,
    promptRecipe,
    testPlan: ['Owner review required', 'No secrets present', 'Test in dry-run first'],
    proofRequired: ['owner_approval', 'test_run', 'no_secret_check'],
    exportTargets: ['vault'],
    status: 'recommended',
  });

  // Attach generated code
  recipe.generatedCode = generatedCode;
  saveRecipe(recipe);

  addProofReceipt('tool_autogenerator', 'tool_autogenerator:generate', 'built', {
    evidenceType: 'tool_recipe',
    evidenceUri: `memory:recipe:${recipe.id}`,
  });

  return { recipe, code: generatedCode };
}

/**
 * Get all saved recipes from the vault
 */
export { getAllRecipes };
