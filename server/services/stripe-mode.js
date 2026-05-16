/**
 * PH EVO STUDIO — Stripe Mode Classifier
 * Classifies Stripe key mode (test/live/unknown) and enforces test-mode-only policy.
 */

import { TRUTH_STATES } from './truth-labels.js';

export function getStripeSafeStatus() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key.trim()) {
    return { truthState: TRUTH_STATES.PROVIDER_GATED, configured: false, mode: 'none', safeForLocalTest: false };
  }

  if (key.startsWith('sk_test_')) {
    return { truthState: TRUTH_STATES.VERIFIED, configured: true, mode: 'test', safeForLocalTest: true };
  }

  if (key.startsWith('sk_live_')) {
    return {
      truthState: TRUTH_STATES.BLOCKED,
      configured: true,
      mode: 'live',
      safeForLocalTest: false,
      blockedReason: 'Live keys are blocked during local development phase.',
    };
  }

  return { truthState: TRUTH_STATES.BLOCKED, configured: true, mode: 'unknown', safeForLocalTest: false };
}

export function redactStripeKey(raw) {
  if (!raw || raw.length < 12) return '****';
  return raw.slice(0, 8) + '...' + raw.slice(-4);
}

export function assertStripeTestModeOnly() {
  const status = getStripeSafeStatus();
  if (status.mode === 'live') {
    throw new Error('Stripe execution BLOCKED: Live keys are not permitted during local development.');
  }
}
