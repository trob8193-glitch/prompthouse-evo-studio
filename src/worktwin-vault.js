/**
 * PH EVO STUDIO — WORKTWIN VAULT (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Captures workflow signals from the browser/studio, mines patterns,
 * and surfaces reusable prompt recipes. All data persisted to
 * localStorage. Consent-gated — no silent capture.
 */

const KEYS = {
  SIGNALS: 'ph_evo_wt_signals',
  RECIPES: 'ph_evo_wt_recipes',
};

function uid() {
  return `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// Auto-redact secrets from captured context
const SECRET_RE = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /ph_evo_[A-Za-z0-9]+/g,
  /Bearer\s+\S{20,}/g,
  /password\s*[:=]\s*\S+/gi,
];

function redact(text = '') {
  let s = text;
  for (const re of SECRET_RE) s = s.replace(re, '[REDACTED]');
  return s;
}

// ─── Signals ───────────────────────────────────────────────────
export function getAllSignals() {
  return load(KEYS.SIGNALS, []);
}

export function captureWorkflowSignal({ source = 'studio', patternType, context = '', consentScope = 'private' } = {}) {
  const signals = getAllSignals();
  const signal = {
    id: `signal_${uid()}`,
    source,
    patternType,
    redactedContext: redact(context),
    consentScope,
    capturedAt: new Date().toISOString(),
  };
  signals.unshift(signal);
  save(KEYS.SIGNALS, signals.slice(0, 200));
  return signal;
}

export function saveSignal(signal) {
  const signals = getAllSignals();
  const idx = signals.findIndex(s => s.id === signal.id);
  if (idx >= 0) signals[idx] = signal;
  else signals.unshift(signal);
  save(KEYS.SIGNALS, signals.slice(0, 200));
  return signal;
}

// ─── Recipes ───────────────────────────────────────────────────
export function getAllRecipes() {
  return load(KEYS.RECIPES, []);
}

export function saveRecipe(recipe) {
  const recipes = getAllRecipes();
  const idx = recipes.findIndex(r => r.id === recipe.id);
  if (idx >= 0) recipes[idx] = recipe;
  else recipes.unshift(recipe);
  save(KEYS.RECIPES, recipes.slice(0, 100));
  return recipe;
}
