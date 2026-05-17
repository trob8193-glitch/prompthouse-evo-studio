import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Returns Stripe test checkout readiness.
 */
export async function getStripeTestCheckoutReadiness() {
  return await safeFetchBridge('/api/stripe/test-checkout/readiness');
}

/**
 * Creates a Stripe test checkout session (requires ownerApproval with scope: commerce).
 */
export async function createStripeTestCheckoutSession(ownerApproval, options = {}) {
  if (!ownerApproval || ownerApproval.scope !== 'commerce') {
    return { ok: false, error: 'Owner approval with scope "commerce" is required', truthState: 'NEEDS_OWNER_APPROVAL' };
  }

  return await safeFetchBridge('/api/stripe/test-checkout/session', {
    method: 'POST',
    body: JSON.stringify({ 
      ownerApproval,
      ...options
    })
  });
}
