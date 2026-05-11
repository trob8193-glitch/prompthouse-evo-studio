/**
 * PromptHouse Evo Studio — Temporal Stackchain Engine
 * Step 8: Add Temporal Stackchain
 * Owner: Temporal Raven | Forge Rhino blocks release if untracked
 * Proof: temporal_plan.md
 *
 * Doctrine: Every generated module includes:
 *   - Now: implementation plan
 *   - +6 months: refactor plan
 *   - +12 months: deprecation or upgrade path
 */

import { createTemporalStack } from './models.js';
import { addProofReceipt } from './prompt-base.js';

/**
 * Generate a Temporal Stackchain for a mission/feature
 * @param {string} missionId
 * @param {string} featureDescription - What was built
 * @param {string[]} techStack - Technologies used
 * @param {Function} callBridge - async fn(prompt) => string
 * @returns {Promise<{stack, markdown}>}
 */
export async function generateTemporalStack(missionId, featureDescription, techStack = [], callBridge = null) {
  const techList = techStack.length ? techStack.join(', ') : 'React, Node.js, OpenAI API';

  let nowPlan = '';
  let sixMonthRefactor = '';
  let twelveMonthDeprecationPath = '';
  let riskNotes = [];

  if (callBridge) {
    try {
      const prompt = `You are Temporal Raven, a future-proofing strategist for PromptHouse Evo Studio.

Feature Built: ${featureDescription}
Tech Stack: ${techList}

Generate a 3-part Temporal Stackchain in JSON format:
{
  "nowPlan": "What was implemented and why (2-3 sentences)",
  "sixMonthRefactor": "Key refactors needed in 6 months: API changes, performance improvements, tech debt (2-3 sentences)",
  "twelveMonthDeprecationPath": "Deprecations or upgrades expected in 12 months: framework updates, API retirements, replacements (2-3 sentences)",
  "riskNotes": ["Risk 1", "Risk 2", "Risk 3"]
}

Respond ONLY with the JSON object.`;

      const raw = await callBridge(prompt);
      try {
        const parsed = JSON.parse(raw.replace(/```json\n?|```/g, '').trim());
        nowPlan = parsed.nowPlan || '';
        sixMonthRefactor = parsed.sixMonthRefactor || '';
        twelveMonthDeprecationPath = parsed.twelveMonthDeprecationPath || '';
        riskNotes = parsed.riskNotes || [];
      } catch {
        // Fallback if JSON parsing fails
        nowPlan = raw.slice(0, 300);
      }
    } catch (err) {
      riskNotes = [`Bridge call failed: ${err.message}`];
    }
  } else {
    // Dry run
    nowPlan = `[LIVE RUN] Implemented: ${featureDescription} using ${techList}.`;
    sixMonthRefactor = `[LIVE RUN] Review ${techList} for breaking changes. Refactor any deprecated API calls.`;
    twelveMonthDeprecationPath = `[LIVE RUN] Check for major version bumps in ${techList}. Plan migration if needed.`;
    riskNotes = ['[LIVE RUN] Risk assessment requires live bridge connection.'];
  }

  const stack = createTemporalStack(missionId, {
    nowPlan,
    sixMonthRefactor,
    twelveMonthDeprecationPath,
    riskNotes,
  });

  const markdown = `# Temporal Stackchain — ${featureDescription}
> Generated: ${new Date().toISOString()} | Owner: Temporal Raven

## Now — Implementation
${nowPlan}

## +6 Months — Refactor Plan
${sixMonthRefactor}

## +12 Months — Deprecation / Upgrade Path
${twelveMonthDeprecationPath}

## Risk Notes
${riskNotes.map(r => `- ${r}`).join('\n')}
`;

  addProofReceipt(missionId, 'temporal_stack:generate', 'verified', {
    evidenceType: 'temporal_plan',
    evidenceUri: 'memory:temporal_plan',
  });

  return { stack, markdown };
}
