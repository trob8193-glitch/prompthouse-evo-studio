import { evaluateCostedRequest } from '../gateway/index.js';

export function evaluateEvoLlmTrainingCostGate({ provider = 'local-dataset', examples = 0, expectedOutputTokens = 1000 } = {}) {
  if (provider === 'local-dataset') {
    return {
      provider,
      allowed: true,
      truthState: 'LOCAL_DATASET_COST_SAFE',
      estimatedCostUsd: 0,
      note: 'Local dataset preparation does not call an external model provider.'
    };
  }

  const result = evaluateCostedRequest({
    orgId: 'studio_owner',
    orgPlan: 'internal',
    endpoint: '/api/evo-llm/train',
    taskType: 'evo_llm_provider_training',
    taskComplexity: examples > 1000 ? 'large' : 'standard',
    providerAllowed: provider,
    messages: [{ role: 'user', content: `Evaluate Evo LLM provider training request for ${examples} examples.` }],
    expectedOutputTokens
  });

  return {
    provider,
    allowed: result?.decision !== 'BLOCK',
    truthState: result?.decision === 'BLOCK' ? 'COST_FIREWALL_BLOCKED' : 'COST_FIREWALL_ALLOWED',
    costFirewall: result
  };
}
