/**
 * PH EVO STUDIO — Stripe Test Checkout Service
 */

import Stripe from 'stripe';
import { TRUTH_STATES } from './truth-labels.js';
import { createProviderReceipt } from './provider-receipts.js';

export function classifyStripeCheckoutReadiness() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key.trim()) return { ready: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS };
  if (key.startsWith('sk_live_')) return { ready: false, truthState: TRUTH_STATES.BLOCKED };
  if (key.startsWith('sk_test_')) return { ready: true, truthState: TRUTH_STATES.VERIFIED, mode: 'test' };
  return { ready: false, truthState: TRUTH_STATES.BLOCKED };
}

export async function createStripeTestCheckoutSession({ amount, currency = 'usd', productName = 'PH Evo Test', ownerApproval } = {}) {
  if (ownerApproval?.granted !== true) {
    const receipt = createProviderReceipt({
      provider: 'stripe',
      action: 'test_checkout_session',
      status: 'blocked',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      message: 'Commerce owner approval required.',
      requestPayload: { amount, currency, productName }
    });
    return { ok: false, truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL, blockedReason: 'Commerce owner approval required', receipt, receiptId: receipt.id };
  }

  const readiness = classifyStripeCheckoutReadiness();
  if (!readiness.ready) {
    const receipt = createProviderReceipt({
      provider: 'stripe',
      action: 'test_checkout_session',
      status: 'blocked',
      truthState: readiness.truthState,
      message: readiness.truthState === TRUTH_STATES.NEEDS_CREDENTIALS ? 'STRIPE_SECRET_KEY not configured.' : 'Stripe key is not safe for test checkout.',
      requestPayload: { amount, currency, productName, approvalReceiptId: ownerApproval?.receiptId || null },
      responsePayload: readiness
    });
    return { ok: false, ...readiness, receipt, receiptId: receipt.id };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency, product_data: { name: productName }, unit_amount: amount || 100 }, quantity: 1 }],
    mode: 'payment',
    success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:5173/cancel',
  });

  const receipt = createProviderReceipt({
    provider: 'stripe',
    action: 'test_checkout_session',
    status: 'success',
    truthState: TRUTH_STATES.PROVEN,
    message: 'Stripe test checkout session created.',
    requestPayload: { amount, currency, productName, approvalReceiptId: ownerApproval?.receiptId || null },
    responsePayload: { id: session.id, url: session.url, mode: session.mode }
  });

  return { ok: true, id: session.id, url: session.url, mode: session.mode, receipt, receiptId: receipt.id, truthState: TRUTH_STATES.PROVEN };
}
