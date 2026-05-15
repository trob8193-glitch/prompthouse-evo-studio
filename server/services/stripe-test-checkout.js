/**
 * PH EVO STUDIO — STRIPE TEST CHECKOUT SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Safely creates Stripe Checkout Sessions in TEST MODE only.
 * Requires sk_test_ key. Blocks sk_live_.
 */
import Stripe from 'stripe';
import { TRUTH_STATES } from './truth-labels.js';
import { createProviderReceipt } from './provider-receipts.js';

/**
 * Classifies Stripe checkout readiness.
 */
export function classifyStripeCheckoutReadiness() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return {
      ready: false,
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      blockers: ['Missing STRIPE_SECRET_KEY'],
      mode: 'missing'
    };
  }

  if (key.startsWith('sk_live_')) {
    return {
      ready: false,
      truthState: TRUTH_STATES.BLOCKED,
      blockers: ['STRIPE_SECRET_KEY is a live key. Production checkout is blocked.'],
      mode: 'live'
    };
  }

  if (!key.startsWith('sk_test_')) {
    return {
      ready: false,
      truthState: TRUTH_STATES.ERROR,
      blockers: ['STRIPE_SECRET_KEY format is invalid (must start with sk_test_ for this rail)'],
      mode: 'invalid'
    };
  }

  return {
    ready: true,
    truthState: TRUTH_STATES.VERIFIED,
    blockers: [],
    mode: 'test'
  };
}

/**
 * Safely creates a Stripe Checkout Session in test mode.
 */
export async function createStripeTestCheckoutSession(options = {}) {
  const readiness = classifyStripeCheckoutReadiness();
  if (!readiness.ready) {
    throw new Error(readiness.blockers.join(', '));
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { amount = 100, currency = 'usd', successUrl, cancelUrl } = options;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'PromptHouse Evo Studio Test Checkout',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || 'http://localhost:5173/success',
      cancel_url: cancelUrl || 'http://localhost:5173/cancel',
    });

    createProviderReceipt({
      provider: 'stripe',
      action: 'test_checkout_session',
      status: 'success',
      truthState: TRUTH_STATES.VERIFIED,
      details: {
        sessionId: session.id,
        mode: session.mode,
        amount,
        currency
      }
    });

    return {
      ok: true,
      id: session.id,
      url: session.url,
      truthState: TRUTH_STATES.VERIFIED
    };
  } catch (error) {
    createProviderReceipt({
      provider: 'stripe',
      action: 'test_checkout_session',
      status: 'failed',
      truthState: TRUTH_STATES.ERROR,
      message: error.message
    });

    return {
      ok: false,
      error: error.message,
      truthState: TRUTH_STATES.ERROR
    };
  }
}

/**
 * Returns safe checkout config subset.
 */
export function getSafeStripeCheckoutConfig() {
  const readiness = classifyStripeCheckoutReadiness();
  return {
    mode: readiness.mode,
    ready: readiness.ready,
    truthState: readiness.truthState
  };
}
