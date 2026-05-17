/**
 * PH EVO STUDIO — Stripe Test Checkout Service
 */

import Stripe from 'stripe';
import { TRUTH_STATES } from './truth-labels.js';

export function classifyStripeCheckoutReadiness() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key.trim()) return { ready: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS };
  if (key.startsWith('sk_live_')) return { ready: false, truthState: TRUTH_STATES.BLOCKED };
  if (key.startsWith('sk_test_')) return { ready: true, truthState: TRUTH_STATES.VERIFIED, mode: 'test' };
  return { ready: false, truthState: TRUTH_STATES.BLOCKED };
}

export async function createStripeTestCheckoutSession({ amount, currency = 'usd', productName = 'PH Evo Test', ownerApproval } = {}) {
  const readiness = classifyStripeCheckoutReadiness();
  if (!readiness.ready) return { ok: false, ...readiness };

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency, product_data: { name: productName }, unit_amount: amount || 100 }, quantity: 1 }],
    mode: 'payment',
    success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:5173/cancel',
  });

  return { ok: true, id: session.id, url: session.url, mode: session.mode };
}
