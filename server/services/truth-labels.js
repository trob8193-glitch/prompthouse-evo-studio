/**
 * PH EVO STUDIO — BACKEND TRUTH LABELS
 * ═══════════════════════════════════════════════════════════════
 * Server-side truth-state vocabulary for provider classification.
 * Pure functions — no side effects, no secret exposure.
 */

export const TRUTH_STATES = Object.freeze({
  BUILT: 'BUILT',
  VERIFIED: 'VERIFIED',
  BLOCKED: 'BLOCKED',
  PROVEN: 'PROVEN',
  LOCAL_ONLY: 'LOCAL_ONLY',
  PROVIDER_GATED: 'PROVIDER_GATED',
  NEEDS_CREDENTIALS: 'NEEDS_CREDENTIALS',
  NEEDS_OWNER_APPROVAL: 'NEEDS_OWNER_APPROVAL',
  ERROR: 'ERROR',
  UNKNOWN: 'UNKNOWN',
});

const VALID_STATES = new Set(Object.values(TRUTH_STATES));

/**
 * Normalizes any value to a valid TRUTH_STATE.
 */
export function normalizeTruthState(value) {
  if (typeof value !== 'string') return TRUTH_STATES.UNKNOWN;
  const upper = value.toUpperCase().trim();
  return VALID_STATES.has(upper) ? upper : TRUTH_STATES.UNKNOWN;
}

/**
 * Classifies the truth-state of a given environment key.
 * Never returns PROVEN just because an env var is set.
 */
export function classifyCredentialState(envKey) {
  if (typeof envKey !== 'string') return TRUTH_STATES.UNKNOWN;
  const value = process.env[envKey];
  if (!value || value.trim().length === 0) return TRUTH_STATES.NEEDS_CREDENTIALS;
  return TRUTH_STATES.BUILT;
}

/**
 * Classifies a provider action based on whether its required env keys are present.
 * Missing credentials → NEEDS_CREDENTIALS
 * All keys present → BUILT (not PROVEN — proven requires receipt)
 * Local-only actions (no required keys) → LOCAL_ONLY
 */
export function classifyProviderAction(actionName, requiredEnvKeys = []) {
  if (!Array.isArray(requiredEnvKeys) || requiredEnvKeys.length === 0) {
    return {
      action: actionName,
      truthState: TRUTH_STATES.LOCAL_ONLY,
      missingKeys: [],
      message: `${actionName} is a local-only action.`,
    };
  }

  const missingKeys = requiredEnvKeys.filter(
    (key) => !process.env[key] || process.env[key].trim().length === 0
  );

  if (missingKeys.length > 0) {
    return {
      action: actionName,
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      missingKeys,
      message: `${actionName} requires credentials: ${missingKeys.join(', ')}`,
    };
  }

  return {
    action: actionName,
    truthState: TRUTH_STATES.BUILT,
    missingKeys: [],
    message: `${actionName} credentials are configured. Not yet PROVEN — requires real provider receipt.`,
  };
}

/**
 * Wraps a response payload with a truthState field.
 * Never promotes to PROVEN unless the payload explicitly says so.
 */
export function buildTruthResponse(payload = {}) {
  const truthState = normalizeTruthState(payload.truthState || payload.truth_state);
  return {
    ...payload,
    truthState,
    truthTimestamp: new Date().toISOString(),
  };
}
