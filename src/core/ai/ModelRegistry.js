/**
 * PH EVO STUDIO — MODEL REGISTRY
 * ═══════════════════════════════════════════════════════════════
 * Central registry of all available AI models that the studio,
 * daemons, EvoLLM brain, and any connected IDE can select from.
 * 
 * Mirrors the model-selection pattern used by Antigravity IDE.
 * Each model entry includes: id, display name, provider, tier,
 * capabilities, context window, and online status.
 * ═══════════════════════════════════════════════════════════════
 */

export const MODEL_TIERS = Object.freeze({
  FAST: 'fast',
  HIGH: 'high',
  THINKING: 'thinking',
  LOCAL: 'local',
});

export const MODEL_PROVIDERS = Object.freeze({
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
  OLLAMA: 'ollama',
  CUSTOM: 'custom',
});

/**
 * The canonical model registry. Each entry is a selectable model
 * that any daemon, the EvoLLM brain, or a connected IDE extension
 * can request by `id`.
 */
export const MODEL_REGISTRY = [
  // ── GEMINI FAMILY ─────────────────────────────────────────────
  {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro (High)',
    provider: MODEL_PROVIDERS.GEMINI,
    tier: MODEL_TIERS.HIGH,
    contextWindow: 1048576,
    capabilities: ['code', 'reasoning', 'vision', 'long-context'],
    apiModel: 'gemini-2.5-pro-preview-05-06',
    costPer1kTokens: 0.00125,
    online: true,
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash (Fast)',
    provider: MODEL_PROVIDERS.GEMINI,
    tier: MODEL_TIERS.FAST,
    contextWindow: 1048576,
    capabilities: ['code', 'reasoning', 'fast-inference'],
    apiModel: 'gemini-2.5-flash-preview-05-20',
    costPer1kTokens: 0.00015,
    online: true,
  },
  {
    id: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    provider: MODEL_PROVIDERS.GEMINI,
    tier: MODEL_TIERS.FAST,
    contextWindow: 1048576,
    capabilities: ['code', 'fast-inference'],
    apiModel: 'gemini-2.0-flash',
    costPer1kTokens: 0.0001,
    online: true,
  },

  // ── OPENAI FAMILY ─────────────────────────────────────────────
  {
    id: 'gpt-4o',
    displayName: 'GPT-4o (High)',
    provider: MODEL_PROVIDERS.OPENAI,
    tier: MODEL_TIERS.HIGH,
    contextWindow: 128000,
    capabilities: ['code', 'reasoning', 'vision'],
    apiModel: 'gpt-4o',
    costPer1kTokens: 0.005,
    online: true,
  },
  {
    id: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini (Fast)',
    provider: MODEL_PROVIDERS.OPENAI,
    tier: MODEL_TIERS.FAST,
    contextWindow: 128000,
    capabilities: ['code', 'fast-inference'],
    apiModel: 'gpt-4o-mini',
    costPer1kTokens: 0.00015,
    online: true,
  },
  {
    id: 'o3',
    displayName: 'o3 (Thinking)',
    provider: MODEL_PROVIDERS.OPENAI,
    tier: MODEL_TIERS.THINKING,
    contextWindow: 200000,
    capabilities: ['code', 'deep-reasoning', 'chain-of-thought'],
    apiModel: 'o3',
    costPer1kTokens: 0.01,
    online: true,
  },

  // ── ANTHROPIC FAMILY ──────────────────────────────────────────
  {
    id: 'claude-sonnet-4',
    displayName: 'Claude Sonnet 4 (High)',
    provider: MODEL_PROVIDERS.ANTHROPIC,
    tier: MODEL_TIERS.HIGH,
    contextWindow: 200000,
    capabilities: ['code', 'reasoning', 'extended-thinking'],
    apiModel: 'claude-sonnet-4-20250514',
    costPer1kTokens: 0.003,
    online: true,
  },
  {
    id: 'claude-opus-4',
    displayName: 'Claude Opus 4 (Thinking)',
    provider: MODEL_PROVIDERS.ANTHROPIC,
    tier: MODEL_TIERS.THINKING,
    contextWindow: 200000,
    capabilities: ['code', 'deep-reasoning', 'extended-thinking', 'agentic'],
    apiModel: 'claude-opus-4-20250514',
    costPer1kTokens: 0.015,
    online: true,
  },

  // ── LOCAL / OLLAMA FAMILY ─────────────────────────────────────
  {
    id: 'evo-lm-local',
    displayName: 'EvoLM (Local Ollama)',
    provider: MODEL_PROVIDERS.OLLAMA,
    tier: MODEL_TIERS.LOCAL,
    contextWindow: 8192,
    capabilities: ['code', 'offline', 'zero-cost'],
    apiModel: 'evo-lm',
    costPer1kTokens: 0,
    online: true,
  },
  {
    id: 'llama3-local',
    displayName: 'Llama 3 (Local Ollama)',
    provider: MODEL_PROVIDERS.OLLAMA,
    tier: MODEL_TIERS.LOCAL,
    contextWindow: 8192,
    capabilities: ['code', 'offline', 'zero-cost'],
    apiModel: 'llama3',
    costPer1kTokens: 0,
    online: true,
  },
];

// ═══════════════════════════════════════════════════════════════
//  ACTIVE MODEL STATE
// ═══════════════════════════════════════════════════════════════

let _activeModelId = 'gemini-2.0-flash'; // Default: fast + free-tier friendly

/**
 * Get the currently selected model for the entire studio.
 * Daemons, EvoLLM, and IDE extensions all read from this.
 */
export function getActiveModel() {
  return MODEL_REGISTRY.find(m => m.id === _activeModelId) || MODEL_REGISTRY[0];
}

/**
 * Set the active model by ID. Called by the UI selector, CLI,
 * or the Omni-Orchestrator when it decides a task needs a
 * higher-tier model.
 */
export function setActiveModel(modelId) {
  const model = MODEL_REGISTRY.find(m => m.id === modelId);
  if (!model) {
    throw new Error(`Model '${modelId}' not found in registry. Available: ${MODEL_REGISTRY.map(m => m.id).join(', ')}`);
  }
  _activeModelId = modelId;
  console.log(`🧠 [ModelRegistry] Active model switched to: ${model.displayName} (${model.provider}/${model.tier})`);
  return model;
}

/**
 * List all registered models grouped by provider.
 */
export function listModels() {
  const grouped = {};
  for (const model of MODEL_REGISTRY) {
    if (!grouped[model.provider]) grouped[model.provider] = [];
    grouped[model.provider].push({
      id: model.id,
      displayName: model.displayName,
      tier: model.tier,
      contextWindow: model.contextWindow,
      costPer1kTokens: model.costPer1kTokens,
      online: model.online,
    });
  }
  return grouped;
}

/**
 * Filter models by capability (e.g., 'thinking', 'vision', 'code').
 */
export function filterModelsByCapability(capability) {
  return MODEL_REGISTRY.filter(m => m.capabilities.includes(capability));
}

/**
 * Get the cheapest model that supports a given capability.
 * Used by daemons to auto-select the most cost-efficient model.
 */
export function getCheapestModelFor(capability) {
  const candidates = filterModelsByCapability(capability).filter(m => m.online);
  candidates.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);
  return candidates[0] || null;
}

/**
 * Get the most powerful model available (highest tier, largest context).
 * Used when accuracy is more important than cost.
 */
export function getMostPowerfulModel() {
  const tierOrder = { thinking: 3, high: 2, fast: 1, local: 0 };
  return [...MODEL_REGISTRY]
    .filter(m => m.online)
    .sort((a, b) => (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0) || b.contextWindow - a.contextWindow)[0];
}
