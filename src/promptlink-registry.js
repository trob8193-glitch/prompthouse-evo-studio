/**
 * PH EVO STUDIO — PROMPTLINK REGISTRY (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Manages the registry of AI providers, handshakes the Browser Bridge,
 * and validates PromptLink call gates. All state is persisted.
 */

const BRIDGE_URL = 'http://127.0.0.1:3001';
const STORAGE_KEY = 'ph_evo_promptlink_registry';

// ─── Default Provider Registry ────────────────────────────────
const DEFAULT_PROVIDERS = [
  {
    id: 'prompthouse_local',
    displayName: 'PromptHouse Local Bridge',
    baseUrl: 'http://127.0.0.1:3001',
    authType: 'ph_evo_api_key',
    credentialEnvKey: 'PH_EVO_API_KEY',
    capabilities: ['chat', 'embeddings', 'prompt_compile', 'forge'],
    approvalPolicy: 'auto',
    status: 'verified',
    budgetCapUSD: 0,
    enabled: true,
  },
  {
    id: 'openai_gpt4',
    displayName: 'OpenAI GPT-4',
    baseUrl: 'https://api.openai.com/v1',
    authType: 'bearer_token',
    credentialEnvKey: 'OPENAI_API_KEY',
    capabilities: ['chat', 'embeddings', 'vision', 'function_calling'],
    approvalPolicy: 'owner_required',
    status: 'recommended',
    budgetCapUSD: 50,
    enabled: false,
  },
  {
    id: 'openai_gpt35',
    displayName: 'OpenAI GPT-3.5 Turbo',
    baseUrl: 'https://api.openai.com/v1',
    authType: 'bearer_token',
    credentialEnvKey: 'OPENAI_API_KEY',
    capabilities: ['chat', 'function_calling'],
    approvalPolicy: 'owner_required',
    status: 'built',
    budgetCapUSD: 20,
    enabled: false,
  },
  {
    id: 'anthropic_claude',
    displayName: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    authType: 'bearer_token',
    credentialEnvKey: 'ANTHROPIC_API_KEY',
    capabilities: ['chat', 'long_context', 'code'],
    approvalPolicy: 'owner_required',
    status: 'recommended',
    budgetCapUSD: 50,
    enabled: false,
  },
  {
    id: 'gemini_pro',
    displayName: 'Google Gemini Pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    authType: 'api_key',
    credentialEnvKey: 'GEMINI_API_KEY',
    capabilities: ['chat', 'vision', 'embeddings'],
    approvalPolicy: 'owner_required',
    status: 'inferred',
    budgetCapUSD: 30,
    enabled: false,
  },
  {
    id: 'local_ollama',
    displayName: 'Local Ollama (LLaMA / Mistral)',
    baseUrl: 'http://localhost:11434',
    authType: 'none',
    credentialEnvKey: null,
    capabilities: ['chat', 'embeddings', 'local_inference'],
    approvalPolicy: 'auto',
    status: 'inferred',
    budgetCapUSD: 0,
    enabled: false,
  },
];

// ─── Storage ───────────────────────────────────────────────────
function loadRegistry() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROVIDERS;
  } catch { return DEFAULT_PROVIDERS; }
}

function saveRegistry(providers) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(providers)); } catch { /* quota */ }
}

// ─── Public API ───────────────────────────────────────────────
export function getRegistry() {
  return loadRegistry();
}

export function updateProvider(id, patch) {
  const providers = loadRegistry();
  const idx = providers.findIndex(p => p.id === id);
  if (idx < 0) return null;
  providers[idx] = { ...providers[idx], ...patch };
  saveRegistry(providers);
  return providers[idx];
}

export function validatePromptLinkCall(providerId, action) {
  const providers = loadRegistry();
  const provider = providers.find(p => p.id === providerId);

  if (!provider) return { allowed: false, reason: 'Provider not found in registry.' };
  if (!provider.enabled) return { allowed: false, reason: `Provider '${provider.displayName}' is disabled.` };
  if (provider.approvalPolicy === 'blocked') return { allowed: false, reason: 'Provider is hard-blocked by Boundary.' };

  return { allowed: true, provider };
}

// ─── Bridge Handshake ─────────────────────────────────────────
export async function handshakePromptBridge() {
  const start = Date.now();
  try {
    const res = await fetch(`${BRIDGE_URL}/status`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return {
      connected: true,
      latency: Date.now() - start,
      bridgeState: data,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      connected: false,
      latency: Date.now() - start,
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// ─── PromptLink Sync ──────────────────────────────────────────
export async function syncPromptLink(payload = {}) {
  try {
    const res = await fetch(`${BRIDGE_URL}/api/promptlink/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Sync returned ${res.status}`);
    return await res.json();
  } catch (err) {
    // Sync is non-critical — log and continue
    console.warn('[PromptLink] Sync failed (non-fatal):', err.message);
    return { synced: false, error: err.message };
  }
}
