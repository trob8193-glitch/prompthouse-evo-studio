/**
 * PH EVO STUDIO — STRIPE STATUS CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Frontend client for fetching Stripe mode status and running probes.
 * Never handles raw secrets.
 */

import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Fetch Stripe safe status.
 */
export async function getStripeStatus() {
  return safeFetchBridge('/api/stripe/status');
}

/**
 * Fetch Stripe mode (test/live/missing).
 */
export async function getStripeMode() {
  return safeFetchBridge('/api/stripe/mode');
}

/**
 * Run safe Stripe account probe.
 * Requires Owner Approval envelope.
 */
export async function runStripeAccountProbe(approvalEnvelope) {
  if (!approvalEnvelope) {
    return { ok: false, error: 'Owner approval required.' };
  }
  return safeFetchBridge('/api/stripe/test/account-probe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Owner-Approval-Scope': approvalEnvelope.scope,
      'X-Owner-Approval-Token': approvalEnvelope.token,
    },
    body: JSON.stringify({}),
  });
}
