const USD_PER_MILLION = 1_000_000;

const DEFAULT_PRICES = Object.freeze({
  local: {
    'evo-lm': { inputPerMillion: 0, outputPerMillion: 0, currency: 'usd' },
    llama3: { inputPerMillion: 0, outputPerMillion: 0, currency: 'usd' },
  },
  openai: {
    'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.60, currency: 'usd' },
    'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00, currency: 'usd' },
    'gpt-5.5': { inputPerMillion: 5.00, outputPerMillion: 15.00, currency: 'usd', requiresOwnerApproval: true },
  },
  gemini: {
    'gemini-1.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30, currency: 'usd' },
    'gemini-1.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00, currency: 'usd' },
  },
});

export function getProviderPrice({ provider = 'local', model = 'evo-lm' } = {}) {
  return DEFAULT_PRICES[provider]?.[model] || null;
}

export function estimateProviderCost({ provider = 'local', model = 'evo-lm', inputTokens = 0, outputTokens = 0 } = {}) {
  const price = getProviderPrice({ provider, model });
  if (!price) {
    return {
      known: false,
      provider,
      model,
      estimatedCost: null,
      reason: 'Unknown provider/model price. Owner approval required before paid call.'
    };
  }
  const inputCost = (Number(inputTokens || 0) / USD_PER_MILLION) * price.inputPerMillion;
  const outputCost = (Number(outputTokens || 0) / USD_PER_MILLION) * price.outputPerMillion;
  return {
    known: true,
    provider,
    model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    estimatedCost: Number((inputCost + outputCost).toFixed(8)),
    requiresOwnerApproval: Boolean(price.requiresOwnerApproval),
    currency: price.currency || 'usd'
  };
}

export function listProviderPrices() {
  return DEFAULT_PRICES;
}
