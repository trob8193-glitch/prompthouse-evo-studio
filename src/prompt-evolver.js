/**
 * PromptHouse Evo Studio — Prompt Evolver (A/B Testing Engine)
 * Rewrites the 6-layer prompt stack based on pattern analysis.
 * A/B tests the new version against the old. Promotes the winner.
 * No fake logic. Real experiments with real statistical evaluation.
 */

const BRIDGE = 'http://127.0.0.1:3001';

/**
 * Given a weak pattern and its AI analysis, generate an improved 6-layer prompt stack.
 * The AI rewrites the specific layer identified as the root cause.
 */
export async function generateImprovedStack(weakPattern, analysisItem) {
  const prompt = `You are a prompt stack architect for PromptHouse Evo Studio.

A 6-layer prompt stack for domain="${weakPattern.domain}" has a ${weakPattern.failureRate}% failure rate.

Root cause analysis:
- Weakness: ${analysisItem.stackWeakness}
- Root cause: ${analysisItem.rootCause}
- Suggested fix: ${analysisItem.specificFix}

The 6 layers are:
1. IDENTITY — Role persona injection
2. MISSION — Exact objective definition
3. DOMAIN_LOCK — Domain-specific rules and strictness level
4. CONSTRAINTS — Numbered rules the AI cannot break
5. VARIABLES — Dynamic data injection
6. FORMAT — Output structure mandate

Write a complete, improved 6-layer prompt stack that fixes the identified weakness.
Respond in strict JSON:
{
  "identity": "You are a [specific role]...",
  "mission": "Your mission is to...",
  "domainLock": "Domain: [domain]. Strictness: [level]...",
  "constraints": "Rules:\\n1. ...\\n2. ...\\n3. ...",
  "variables": "Available variables: {{VAR1}}, {{VAR2}}...",
  "format": "Return your output as..."
}`;

  try {
    const res = await fetch(`${BRIDGE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const raw = data.message || '';
    const cleaned = raw.replace(/```json\n?|```/g, '').trim();
    const stack = JSON.parse(cleaned);

    // Validate the stack has all 6 layers
    const requiredLayers = ['identity', 'mission', 'domainLock', 'constraints', 'variables', 'format'];
    for (const layer of requiredLayers) {
      if (!stack[layer] || stack[layer].length < 10) {
        throw new Error(`Generated stack missing or empty layer: ${layer}`);
      }
    }

    return { stack, version: `v_${Date.now()}` };
  } catch (e) {
    console.error('[PromptEvolver] Stack generation failed:', e.message);
    return null;
  }
}

/**
 * Compile a 6-layer stack object into a single system prompt string.
 */
export function compileStack(stack) {
  return [stack.identity, stack.mission, stack.domainLock, stack.constraints, stack.variables, stack.format].join('\n\n');
}

/**
 * Create an A/B experiment on the bridge.
 * Variant A = original stack, Variant B = improved stack.
 */
export async function createExperiment(domain, originalStack, improvedStack) {
  try {
    const res = await fetch(`${BRIDGE}/api/feedback/experiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        variantA: originalStack,
        variantB: improvedStack,
        minTrials: 20,
      }),
    });
    const data = await res.json();
    return data.experiment;
  } catch (e) {
    console.error('[PromptEvolver] Failed to create experiment:', e.message);
    return null;
  }
}

/**
 * Get the active A/B experiment for a domain (if any).
 * Returns the experiment and which variant to use (random 50/50 split).
 */
export async function getActiveExperiment(domain) {
  try {
    const res = await fetch(`${BRIDGE}/api/feedback/experiments?status=active`);
    const experiments = await res.json();
    const exp = experiments.find(e => e.domain === domain && e.status === 'active');
    if (!exp) return null;

    // Random 50/50 split
    const variant = Math.random() < 0.5 ? 'a' : 'b';
    const stack = variant === 'a' ? exp.variantA : exp.variantB;

    return { experiment: exp, variant, stack };
  } catch (e) {
    return null;
  }
}

/**
 * Record the result of an A/B experiment trial.
 */
export async function recordExperimentResult(experimentId, variant, rating) {
  try {
    const res = await fetch(`${BRIDGE}/api/feedback/experiment/${experimentId}/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant, rating }),
    });
    return await res.json();
  } catch (e) {
    console.error('[PromptEvolver] Failed to record experiment result:', e.message);
    return null;
  }
}

/**
 * Check all concluded experiments and report winners.
 */
export async function getExperimentResults() {
  try {
    const res = await fetch(`${BRIDGE}/api/feedback/experiments`);
    const all = await res.json();
    return {
      active: all.filter(e => e.status === 'active'),
      concluded: all.filter(e => e.status === 'concluded'),
    };
  } catch (e) {
    return { active: [], concluded: [] };
  }
}
