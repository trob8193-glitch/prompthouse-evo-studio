/**
 * PH EVO STUDIO — AI Provider Status Service
 */

import { TRUTH_STATES } from './truth-labels.js';

function redactKey(raw) {
  if (!raw || raw.length < 12) return '****';
  return raw.slice(0, 6) + '...' + raw.slice(-4);
}

export function classifyOpenAiKey() {
  const key = process.env.OPENAI_API_KEY || '';
  if (!key.trim()) return { configured: false, truthState: TRUTH_STATES.PROVIDER_GATED };
  return { configured: true, truthState: TRUTH_STATES.VERIFIED, redactedKey: redactKey(key) };
}

export function classifyGeminiKey() {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key.trim()) return { configured: false, truthState: TRUTH_STATES.PROVIDER_GATED };
  return { configured: true, truthState: TRUTH_STATES.VERIFIED, redactedKey: redactKey(key) };
}

export function getAiProviderStatus() {
  return {
    openai: classifyOpenAiKey(),
    gemini: classifyGeminiKey(),
  };
}
