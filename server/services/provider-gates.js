/**
 * PH EVO STUDIO — Provider Gates Service
 * Maps provider names to required env keys, redacts secrets, and gates access.
 */

import { TRUTH_STATES, classifyCredentialState } from './truth-labels.js';

export const REQUIRED_PROVIDER_KEYS = {
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  stripe: 'STRIPE_SECRET_KEY',
  vercel: 'VERCEL_TOKEN',
  auth: 'JWT_SECRET',
  masterKey: 'PH_EVO_MASTER_KEY',
};

/**
 * Redacts a secret value for safe display.
 * Shows first 4 and last 4 chars for values > 12 chars, else '****'.
 * Returns null for empty/missing values.
 */
export function redactSecret(val) {
  if (!val || val.trim() === '') return null;
  if (val.length <= 12) return '****';
  return val.slice(0, 4) + '****' + val.slice(-4);
}

/**
 * Returns gate status for all providers.
 * Never returns raw secret values.
 */
export function getProviderGateStatus() {
  const gates = {};
  for (const [provider, envKey] of Object.entries(REQUIRED_PROVIDER_KEYS)) {
    const val = process.env[envKey] || '';
    const configured = val.trim() !== '';
    gates[provider] = {
      envKey,
      configured,
      truthState: configured ? TRUTH_STATES.BUILT : TRUTH_STATES.NEEDS_CREDENTIALS,
      redacted: configured ? redactSecret(val) : null,
    };
  }
  return gates;
}

/**
 * Checks a single credential.
 * Returns { ok, truthState, envKey }.
 */
export function requireCredential(envKey) {
  const state = classifyCredentialState(envKey);
  return {
    ok: state !== TRUTH_STATES.NEEDS_CREDENTIALS,
    truthState: state,
    envKey,
  };
}
