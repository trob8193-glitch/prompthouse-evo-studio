/**
 * PH EVO STUDIO — STRIPE MODE CLASSIFIER
 * ═══════════════════════════════════════════════════════════════
 * Strictly evaluates STRIPE_SECRET_KEY for test vs live mode.
 * Never exposes the raw key. Enforces LOCAL test rules.
 */

import { TRUTH_STATES } from './truth-labels.js';

export function classifyStripeKeyMode(rawKey) {
  if (!rawKey || typeof rawKey !== 'string' || rawKey.trim() === '') {
    return 'missing';
  }
  if (rawKey.startsWith('sk_test_')) {
    return 'test';
  }
  if (rawKey.startsWith('sk_live_')) {
    return 'live';
  }
  return 'unknown';
}

export function redactStripeKey(rawKey) {
  if (!rawKey) return null;
  const mode = classifyStripeKeyMode(rawKey);
  if (mode === 'missing') return null;
  // Return only the prefix and the last 4 characters for safe identification
  const prefix = mode === 'test' ? 'sk_test_' : mode === 'live' ? 'sk_live_' : 'sk_unknown_';
  return `${prefix}...${rawKey.slice(-4)}`;
}

export function isStripeConfigured() {
  return classifyStripeKeyMode(process.env.STRIPE_SECRET_KEY) !== 'missing';
}

export function isStripeTestMode() {
  return classifyStripeKeyMode(process.env.STRIPE_SECRET_KEY) === 'test';
}

export function isStripeLiveMode() {
  return classifyStripeKeyMode(process.env.STRIPE_SECRET_KEY) === 'live';
}

/**
 * Returns a completely safe status object for frontend rendering.
 */
export function getStripeSafeStatus() {
  const mode = classifyStripeKeyMode(process.env.STRIPE_SECRET_KEY);
  const isLocalPhase = process.env.DEPLOY_ALLOW_PRODUCTION !== 'true';

  const status = {
    configured: mode !== 'missing',
    mode,
    safeForLocalTest: mode === 'test',
    truthState: TRUTH_STATES.UNKNOWN,
    blockedReason: null,
    nextAction: null,
  };

  if (!status.configured) {
    status.truthState = TRUTH_STATES.PROVIDER_GATED;
    status.nextAction = 'Configure STRIPE_SECRET_KEY with a test key in your .env file.';
  } else if (mode === 'live') {
    status.truthState = TRUTH_STATES.BLOCKED;
    status.blockedReason = 'Live keys (sk_live_) are explicitly prohibited during the local proof phase to prevent accidental real billing.';
    status.nextAction = 'Replace your live key with a Stripe test key (sk_test_).';
  } else if (mode === 'unknown') {
    status.truthState = TRUTH_STATES.BLOCKED;
    status.blockedReason = 'The provided Stripe key does not match known test or live prefixes.';
    status.nextAction = 'Provide a valid Stripe test key (sk_test_).';
  } else if (mode === 'test') {
    status.truthState = TRUTH_STATES.VERIFIED;
    status.nextAction = 'Stripe test-mode is configured and ready for safe account probing.';
  }

  // If we are in local phase but somehow live mode is passed and forced through
  if (mode === 'live' && isLocalPhase) {
    status.truthState = TRUTH_STATES.BLOCKED;
    status.safeForLocalTest = false;
  }

  return status;
}

/**
 * Throws an error if Stripe is not explicitly in test mode.
 * Safe to call before any simulated Stripe interaction.
 */
export function assertStripeTestModeOnly() {
  const status = getStripeSafeStatus();
  if (!status.safeForLocalTest) {
    throw new Error(`Stripe execution BLOCKED: ${status.blockedReason || 'Must use test mode.'}`);
  }
}
