import { estimateProviderCost } from './providerPriceRegistry.js';

const DEFAULT_MODEL_ORDER = [
  { provider: 'local', model: 'evo-lm', quality: 'basic' },
  { provider: 'gemini', model: 'gemini-1.5-flash', quality: 'standard' },
  { provider: 'openai', model: 'gpt-4o-mini', quality: 'standard' },
  { provider: 'gemini', model: 'gemini-1.5-pro', quality: 'advanced' },
  { provider: 'openai', model: 'gpt-4o', quality: 'advanced' }
];

export function routeModelV2({
  orgPlan = 'free',
  endpoint = '',
  taskComplexity = 'standard',
  providerAllowed = 'any',
  inputTokens = 0,
  outputTokens = 800,
  preferLocal = true
} = {}) {
  const cloudAllowed = providerAllowed === 'any' || providerAllowed === 'cloud';
  const candidates = DEFAULT_MODEL_ORDER.filter(item => {
    if (item.provider === 'local') return providerAllowed === 'any' || providerAllowed === 'local' || preferLocal;
    if (orgPlan === 'free') return false;
    if (!cloudAllowed && providerAllowed !== item.provider) return false;
    if (taskComplexity === 'basic') return item.quality === 'basic' || item.quality === 'standard';
    if (taskComplexity === 'advanced') return true;
    return item.quality !== 'advanced' || providerAllowed === item.provider;
  }).map(item => ({
    ...item,
    cost: estimateProviderCost({ provider: item.provider, model: item.model, inputTokens, outputTokens })
  }));

  const known = candidates.filter(item => item.cost.known);
  const sorted = known.sort((a, b) => Number(a.cost.estimatedCost || 0) - Number(b.cost.estimatedCost || 0));
  const selected = sorted[0] || { provider: 'local', model: 'evo-lm', quality: 'basic', cost: estimateProviderCost({ provider: 'local', model: 'evo-lm', inputTokens, outputTokens }) };
  return {
    selectedProvider: selected.provider,
    selectedModel: selected.model,
    quality: selected.quality,
    estimatedCost: selected.cost.estimatedCost || 0,
    candidates: sorted,
    decisionReason: selected.provider === 'local' ? 'local_first_lowest_cost' : 'lowest_allowed_known_cost_provider'
  };
}

export default routeModelV2;
