/**
 * PH EVO STUDIO — Truth Labels Service
 * Canonical truth state labels and classification utilities for the studio security layer.
 */

export const TRUTH_STATES = {
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
};

const VALID_STATES = new Set(Object.values(TRUTH_STATES));

/**
 * Normalizes a truth state value. Returns 'UNKNOWN' for invalid/missing values.
 */
export function normalizeTruthState(val) {
  if (!val || typeof val !== 'string') return TRUTH_STATES.UNKNOWN;
  const upper = val.toUpperCase();
  return VALID_STATES.has(upper) ? upper : TRUTH_STATES.UNKNOWN;
}

/**
 * Classifies an env key's credential state.
 * Returns NEEDS_CREDENTIALS if missing, BUILT if present (not yet proven via live call).
 */
export function classifyCredentialState(envKey) {
  const val = process.env[envKey];
  if (!val || val.trim() === '') return TRUTH_STATES.NEEDS_CREDENTIALS;
  return TRUTH_STATES.BUILT;
}

/**
 * Classifies a provider action based on required env keys.
 * Actions with zero required keys are LOCAL_ONLY.
 */
export function classifyProviderAction(actionName, requiredKeys = []) {
  if (!requiredKeys || requiredKeys.length === 0) {
    return { truthState: TRUTH_STATES.LOCAL_ONLY, missingKeys: [] };
  }
  const missingKeys = requiredKeys.filter(k => !process.env[k] || process.env[k].trim() === '');
  if (missingKeys.length > 0) {
    return { truthState: TRUTH_STATES.NEEDS_CREDENTIALS, missingKeys };
  }
  return { truthState: TRUTH_STATES.BUILT, missingKeys: [] };
}

/**
 * Wraps a payload with truthState metadata.
 */
export function buildTruthResponse(payload) {
  return {
    ...payload,
    truthTimestamp: new Date().toISOString(),
  };
}
