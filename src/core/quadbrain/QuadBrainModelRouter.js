/**
 * QuadBrain Dynamic Model Router
 * ─────────────────────────────────────────────────────────────────────────────
 * Intelligently routes tasks to the optimal AI model based on:
 *   • Task complexity class (PATCH, AUDIT, ARCHITECTURE, CREATIVE, LOCAL)
 *   • Provider availability (live key check per provider)
 *   • Cost firewall budget remaining
 *   • Rate-limit backoff state
 *
 * Rule: always prefer $0-cost options first. Cloud is last resort.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
dotenv.config({ path: path.join(rootDir, '.env') });

// ─── Task Complexity Classes ─────────────────────────────────────────────────
export const TASK_CLASS = Object.freeze({
  /** Fast structural patch, CSS fix, lint fix — cheap models only */
  PATCH:        'PATCH',
  /** Code audit, semantic analysis, diff review */
  AUDIT:        'AUDIT',
  /** System architecture, multi-file reasoning, roadmap planning */
  ARCHITECTURE: 'ARCHITECTURE',
  /** Image prompts, UI generation, creative writing */
  CREATIVE:     'CREATIVE',
  /** Completely local — no cloud, no cost */
  LOCAL:        'LOCAL',
  /** Emergency crash response — fastest available */
  EMERGENCY:    'EMERGENCY',
});

// ─── Model Profiles ──────────────────────────────────────────────────────────
const MODEL_PROFILES = [
  {
    id:         'local',
    provider:   'local',
    model:      process.env.LOCAL_AI_MODEL || 'evo-lm',
    costPerK:   0,
    maxTokens:  4096,
    classes:    [TASK_CLASS.LOCAL, TASK_CLASS.PATCH],
    priority:   1, // Highest priority (lowest cost)
    available:  () => Boolean(process.env.LOCAL_AI_URL),
  },
  {
    id:         'gemini-flash',
    provider:   'gemini',
    model:      'gemini-2.0-flash',
    costPerK:   0.000075,
    maxTokens:  8192,
    classes:    [TASK_CLASS.PATCH, TASK_CLASS.AUDIT, TASK_CLASS.EMERGENCY],
    priority:   2,
    available:  () => Boolean(process.env.GEMINI_API_KEY),
  },
  {
    id:         'gemini-pro',
    provider:   'gemini',
    model:      'gemini-1.5-pro',
    costPerK:   0.00125,
    maxTokens:  32768,
    classes:    [TASK_CLASS.AUDIT, TASK_CLASS.ARCHITECTURE, TASK_CLASS.CREATIVE],
    priority:   3,
    available:  () => Boolean(process.env.GEMINI_API_KEY),
  },
  {
    id:         'gpt-4o-mini',
    provider:   'openai',
    model:      'gpt-4o-mini',
    costPerK:   0.00015,
    maxTokens:  8192,
    classes:    [TASK_CLASS.PATCH, TASK_CLASS.AUDIT, TASK_CLASS.CREATIVE],
    priority:   3,
    available:  () => Boolean(process.env.OPENAI_API_KEY),
  },
  {
    id:         'gpt-4o',
    provider:   'openai',
    model:      process.env.OPENAI_MODEL || 'gpt-4o',
    costPerK:   0.005,
    maxTokens:  16384,
    classes:    [TASK_CLASS.ARCHITECTURE, TASK_CLASS.AUDIT, TASK_CLASS.EMERGENCY],
    priority:   4, // Only when cheaper options fail
    available:  () => Boolean(process.env.OPENAI_API_KEY),
  },
  {
    id:         'anthropic',
    provider:   'anthropic',
    model:      process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
    costPerK:   0.0008,
    maxTokens:  8192,
    classes:    [TASK_CLASS.ARCHITECTURE, TASK_CLASS.CREATIVE],
    priority:   4,
    available:  () => Boolean(process.env.ANTHROPIC_API_KEY),
  },
];

// ─── Rate Limit Backoff State ─────────────────────────────────────────────────
const backoffState = new Map(); // provider → timestamp when backoff expires

function isInBackoff(provider) {
  const until = backoffState.get(provider) || 0;
  return Date.now() < until;
}

export function reportRateLimit(provider, retryAfterSeconds = 60) {
  const until = Date.now() + retryAfterSeconds * 1000;
  backoffState.set(provider, until);
  console.warn(`⏳ [MODEL-ROUTER] ${provider} rate-limited. Backoff until ${new Date(until).toISOString()}`);
}

// ─── Core Router ─────────────────────────────────────────────────────────────

/**
 * Detect task class from task description text.
 * Used when callers don't specify a class explicitly.
 */
export function detectTaskClass(taskDescription = '') {
  const lower = taskDescription.toLowerCase();
  if (/\b(patch|css|fix|lint|format|style|typo|rename)\b/.test(lower)) return TASK_CLASS.PATCH;
  if (/\b(image|creative|visual|mockup|banner|logo|design|ui)\b/.test(lower)) return TASK_CLASS.CREATIVE;
  if (/\b(architect|system|design|roadmap|plan|strategy|structure)\b/.test(lower)) return TASK_CLASS.ARCHITECTURE;
  if (/\b(audit|scan|drift|semantic|review|analyze|check)\b/.test(lower)) return TASK_CLASS.AUDIT;
  if (/\b(emergency|crash|fatal|urgent|hotfix)\b/.test(lower)) return TASK_CLASS.EMERGENCY;
  if (/\b(local|offline|ollama)\b/.test(lower)) return TASK_CLASS.LOCAL;
  return TASK_CLASS.AUDIT; // Safe default
}

/**
 * Select the best available model for a given task class.
 * Returns the model profile or null if nothing is available.
 */
export function selectModel(taskClass, { forceCheapest = false } = {}) {
  const candidates = MODEL_PROFILES
    .filter(p => p.classes.includes(taskClass))
    .filter(p => p.available())
    .filter(p => !isInBackoff(p.provider))
    .sort((a, b) => {
      // Sort by priority first (lower = preferred), then cost
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.costPerK - b.costPerK;
    });

  if (forceCheapest) {
    return candidates.find(p => p.costPerK === 0) || candidates[0] || null;
  }

  return candidates[0] || null;
}

/**
 * Main routing function.
 *
 * @param {string} taskDescription - Human-readable task text
 * @param {string|null} preferredBrain - Legacy hint ('gemini', 'openai', 'local')
 * @returns {{ provider: string, model: string, profile: object }}
 */
export function routeTask(taskDescription = '', preferredBrain = null) {
  // Legacy hint override — allows callers to still pass 'gemini' etc.
  if (preferredBrain === 'local') {
    const localProfile = MODEL_PROFILES.find(p => p.provider === 'local' && p.available());
    if (localProfile) {
      console.log(`🧠 [MODEL-ROUTER] LOCAL brain forced → ${localProfile.model}`);
      return { provider: 'local', model: localProfile.model, profile: localProfile };
    }
  }

  const taskClass = detectTaskClass(taskDescription);
  const profile = selectModel(taskClass);

  if (!profile) {
    // Total fallback — return offline stub profile
    console.warn(`⚠️ [MODEL-ROUTER] No models available for class ${taskClass}. Using offline stub.`);
    return {
      provider: 'offline',
      model: 'none',
      profile: { id: 'offline', provider: 'offline', model: 'none', costPerK: 0, maxTokens: 0, classes: [], priority: 99, available: () => false },
    };
  }

  console.log(`🧠 [MODEL-ROUTER] Task class: ${taskClass} → ${profile.id} (${profile.model}) [$${profile.costPerK}/1k tokens]`);
  return { provider: profile.provider, model: profile.model, profile };
}

/**
 * Get a full routing report — useful for dashboard display.
 */
export function getRoutingReport() {
  return {
    generatedAt: new Date().toISOString(),
    profiles: MODEL_PROFILES.map(p => ({
      id: p.id,
      provider: p.provider,
      model: p.model,
      costPerK: p.costPerK,
      classes: p.classes,
      available: p.available(),
      inBackoff: isInBackoff(p.provider),
      backoffUntil: backoffState.get(p.provider) ? new Date(backoffState.get(p.provider)).toISOString() : null,
    })),
    backoff: Object.fromEntries(
      [...backoffState.entries()].map(([k, v]) => [k, new Date(v).toISOString()])
    ),
  };
}
