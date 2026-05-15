/**
 * PH EVO STUDIO — PROVIDER GATE SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Reports which provider credentials are configured without
 * ever exposing the actual secret values.
 */
import { classifyCredentialState, classifyProviderAction, TRUTH_STATES } from './truth-labels.js';

export const REQUIRED_PROVIDER_KEYS = Object.freeze({
  openai:    'OPENAI_API_KEY',
  gemini:    'GEMINI_API_KEY',
  stripe:    'STRIPE_SECRET_KEY',
  vercel:    'VERCEL_TOKEN',
  auth:      'JWT_SECRET',
  masterKey: 'PH_EVO_MASTER_KEY',
});

/**
 * Redacts a secret value to a safe display form.
 */
export function redactSecret(value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  if (value.length <= 8) return '****';
  return `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 8, 20))}${value.slice(-4)}`;
}

/**
 * Returns the gate status for all required providers.
 * Never returns actual secret values.
 */
export function getProviderGateStatus() {
  const gates = {};
  for (const [label, envKey] of Object.entries(REQUIRED_PROVIDER_KEYS)) {
    const state = classifyCredentialState(envKey);
    gates[label] = {
      envKey,
      configured: state !== TRUTH_STATES.NEEDS_CREDENTIALS,
      truthState: state,
      redacted: redactSecret(process.env[envKey] || ''),
    };
  }
  return gates;
}

/**
 * Checks a specific credential key and throws a structured error if missing.
 */
export function requireCredential(envKey) {
  const value = process.env[envKey];
  if (!value || value.trim().length === 0) {
    return {
      ok: false,
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      error: `Missing required credential: ${envKey}`,
    };
  }
  return {
    ok: true,
    truthState: TRUTH_STATES.BUILT,
  };
}

export { classifyProviderAction };
