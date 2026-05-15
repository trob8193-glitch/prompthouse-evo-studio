/**
 * PH EVO STUDIO — AI PROVIDER STATUS SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Safely inspects and classifies AI provider keys (OpenAI, Gemini).
 * NEVER exposes raw keys. NEVER spends tokens. NEVER claims success
 * without a valid provider receipt.
 */
import { TRUTH_STATES } from './truth-labels.js';

/**
 * Returns a redacted version of a provider key for logging/UI.
 * Keeps only the first 6 and last 4 characters if it's long enough.
 */
export function redactProviderKey(key) {
  if (!key) return null;
  const str = String(key).trim();
  if (str.length < 15) return '***';
  return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
}

/**
 * Classifies the OpenAI API Key.
 * Returns missing (PROVIDER_GATED) or configured (VERIFIED local check).
 */
export function classifyOpenAiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      configured: false,
      truthState: TRUTH_STATES.PROVIDER_GATED,
      blockedReason: 'Missing OPENAI_API_KEY in environment',
      nextAction: 'Add OPENAI_API_KEY to your .env file.',
    };
  }

  return {
    configured: true,
    truthState: TRUTH_STATES.VERIFIED, // verified configured, not proven
    redactedKey: redactProviderKey(key),
    blockedReason: null,
    nextAction: 'Ready for owner-approved probe.',
  };
}

/**
 * Classifies the Gemini API Key.
 */
export function classifyGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      configured: false,
      truthState: TRUTH_STATES.PROVIDER_GATED,
      blockedReason: 'Missing GEMINI_API_KEY in environment',
      nextAction: 'Add GEMINI_API_KEY to your .env file.',
    };
  }

  return {
    configured: true,
    truthState: TRUTH_STATES.VERIFIED,
    redactedKey: redactProviderKey(key),
    blockedReason: null,
    nextAction: 'Ready for owner-approved probe.',
  };
}

/**
 * Gets a unified AI provider status map.
 */
export function getAiProviderStatus() {
  return {
    openai: classifyOpenAiKey(),
    gemini: classifyGeminiKey(),
  };
}

/**
 * Returns an array of configured AI provider keys securely.
 */
export function getConfiguredAiProvidersSafe() {
  const status = getAiProviderStatus();
  return Object.keys(status).filter(k => status[k].configured);
}

/**
 * Returns an array of missing AI provider keys.
 */
export function getMissingAiProviders() {
  const status = getAiProviderStatus();
  return Object.keys(status).filter(k => !status[k].configured);
}
