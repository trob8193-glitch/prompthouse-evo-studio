/**
 * PH EVO STUDIO — TRUTH STATE CONSTANTS
 * ═══════════════════════════════════════════════════════════════
 * Canonical truth-state vocabulary for the studio's proof layer.
 * Pure, dependency-free functions for labeling, normalization, and tone.
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

const LABELS = {
  [TRUTH_STATES.BUILT]: 'Built',
  [TRUTH_STATES.VERIFIED]: 'Verified',
  [TRUTH_STATES.BLOCKED]: 'Blocked',
  [TRUTH_STATES.PROVEN]: 'Proven',
  [TRUTH_STATES.LOCAL_ONLY]: 'Local Only',
  [TRUTH_STATES.PROVIDER_GATED]: 'Provider Gated',
  [TRUTH_STATES.NEEDS_CREDENTIALS]: 'Needs Credentials',
  [TRUTH_STATES.NEEDS_OWNER_APPROVAL]: 'Needs Owner Approval',
  [TRUTH_STATES.ERROR]: 'Error',
  [TRUTH_STATES.UNKNOWN]: 'Unknown',
};

const DESCRIPTIONS = {
  [TRUTH_STATES.BUILT]: 'This component has been constructed and is structurally present in the codebase.',
  [TRUTH_STATES.VERIFIED]: 'This component has been tested and confirmed to function correctly in its current environment.',
  [TRUTH_STATES.BLOCKED]: 'This component cannot proceed due to a missing dependency, permission, or configuration.',
  [TRUTH_STATES.PROVEN]: 'This component has passed production-grade verification with real provider confirmation.',
  [TRUTH_STATES.LOCAL_ONLY]: 'This component operates entirely within the local runtime. No external provider is involved.',
  [TRUTH_STATES.PROVIDER_GATED]: 'This component requires an external provider connection that is not currently active.',
  [TRUTH_STATES.NEEDS_CREDENTIALS]: 'This component requires API keys or credentials that have not been configured.',
  [TRUTH_STATES.NEEDS_OWNER_APPROVAL]: 'This component requires explicit owner approval before activation.',
  [TRUTH_STATES.ERROR]: 'This component encountered an error during its last operation.',
  [TRUTH_STATES.UNKNOWN]: 'The truth state of this component has not been determined.',
};

const TONES = {
  [TRUTH_STATES.BUILT]: 'neutral',
  [TRUTH_STATES.VERIFIED]: 'success',
  [TRUTH_STATES.BLOCKED]: 'danger',
  [TRUTH_STATES.PROVEN]: 'success',
  [TRUTH_STATES.LOCAL_ONLY]: 'info',
  [TRUTH_STATES.PROVIDER_GATED]: 'warning',
  [TRUTH_STATES.NEEDS_CREDENTIALS]: 'warning',
  [TRUTH_STATES.NEEDS_OWNER_APPROVAL]: 'warning',
  [TRUTH_STATES.ERROR]: 'danger',
  [TRUTH_STATES.UNKNOWN]: 'neutral',
};

/**
 * Normalizes any value to a valid TRUTH_STATE.
 * Unknown or invalid values become UNKNOWN.
 */
export function normalizeTruthState(value) {
  if (typeof value !== 'string') return TRUTH_STATES.UNKNOWN;
  const upper = value.toUpperCase().trim();
  return VALID_STATES.has(upper) ? upper : TRUTH_STATES.UNKNOWN;
}

/**
 * Returns the human-readable label for a truth state.
 */
export function getTruthStateLabel(state) {
  return LABELS[normalizeTruthState(state)] || LABELS[TRUTH_STATES.UNKNOWN];
}

/**
 * Returns the descriptive explanation for a truth state.
 */
export function getTruthStateDescription(state) {
  return DESCRIPTIONS[normalizeTruthState(state)] || DESCRIPTIONS[TRUTH_STATES.UNKNOWN];
}

/**
 * Returns the visual tone for a truth state.
 * Never returns 'success' for blocked, gated, credential, approval, or error states.
 */
export function getTruthStateTone(state) {
  return TONES[normalizeTruthState(state)] || TONES[TRUTH_STATES.UNKNOWN];
}
