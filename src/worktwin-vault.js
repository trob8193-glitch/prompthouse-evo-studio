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
<<<<<<< HEAD
  PATTERNS: 'ph_evo_wt_patterns',
=======
>>>>>>> main
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
<<<<<<< HEAD
}

// ─── Patterns (derived from Signals) ──────────────────────────
export function getAllPatterns() {
  return load(KEYS.PATTERNS, []);
}

export function savePatterns(patterns = []) {
  save(KEYS.PATTERNS, Array.isArray(patterns) ? patterns.slice(0, 200) : []);
  return getAllPatterns();
}

function signatureFromContext(text = '') {
  const cleaned = String(text)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!cleaned) return 'empty';
  return cleaned.split(' ').slice(0, 7).join(' ');
}

export function minePatterns({ minFrequency = 2 } = {}) {
  const signals = getAllSignals();
  const buckets = new Map();

  for (const signal of signals) {
    const sig = signatureFromContext(signal.redactedContext || '');
    const key = `${signal.patternType}::${sig}`;
    const entry = buckets.get(key) || {
      id: `pattern_${signal.patternType}_${sig.slice(0, 24).replace(/[^a-z0-9]+/g, '_')}`,
      patternType: signal.patternType,
      signature: sig,
      source: signal.source,
      consentScope: signal.consentScope,
      count: 0,
      lastSeenAt: signal.capturedAt,
      example: signal.redactedContext || ''
    };
    entry.count += 1;
    if (signal.capturedAt > entry.lastSeenAt) entry.lastSeenAt = signal.capturedAt;
    buckets.set(key, entry);
  }

  const patterns = Array.from(buckets.values())
    .filter((p) => p.count >= Number(minFrequency || 2))
    .sort((a, b) => (b.count - a.count) || String(b.lastSeenAt).localeCompare(String(a.lastSeenAt)));

  savePatterns(patterns);
  return patterns;
}

export function generateRecipeFromPattern(pattern) {
  if (!pattern) return null;
  const recipe = {
    id: `recipe_${uid()}`,
    name: `${pattern.patternType} recipe`,
    patternType: pattern.patternType,
    fromPatternId: pattern.id,
    signature: pattern.signature,
    createdAt: new Date().toISOString(),
    instructions: [
      `Use this as a reusable template for: ${pattern.signature}`,
      'Request concrete steps and runnable code only.',
      'If required context is missing, ask for it explicitly.'
    ].join('\n')
  };
  saveRecipe(recipe);
  return recipe;
=======
>>>>>>> main
}
