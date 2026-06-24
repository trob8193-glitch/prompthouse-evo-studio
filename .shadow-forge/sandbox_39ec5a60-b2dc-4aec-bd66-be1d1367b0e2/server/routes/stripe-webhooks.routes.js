/**
 * PH EVO STUDIO — Stripe Webhook + Checkout Routes
 * Handles live webhook events from Stripe and creates real checkout sessions.
 */

import Stripe from 'stripe';
import { getUserByEmail, updateUserSubscription } from '../services/auth-service.js';

const PLANS = {
  indie: { name: 'Indie Builder', price_id: process.env.STRIPE_PRICE_INDIE || null },
  pro: { name: 'Studio Pro', price_id: process.env.STRIPE_PRICE_PRO || null },
  sovereign: { name: 'Studio Sovereign', price_id: process.env.STRIPE_PRICE_SOVEREIGN || null },
  enterprise: { name: 'Enterprise White-Label', price_id: process.env.STRIPE_PRICE_ENTERPRISE || null },
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set.');
  return new Stripe(key);
}

export function registerStripeWebhookRoutes(app) {

  // ── CREATE CHECKOUT SESSION ────────────────────────────────────
  app.post('/api/stripe/checkout', async (req, res) => {
    const { tier, userEmail, successUrl, cancelUrl } = req.body || {};
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return res.status(503).json({
        ok: false,
        error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in your .env file.',
        action: 'ADD_STRIPE_KEY'
      });
    }

    // Map tier to plan
    const planKey = tier === 'seed' ? 'indie' : tier === 'enterprise' ? 'enterprise' : tier === 'sovereign' ? 'sovereign' : 'pro';
    const plan = PLANS[planKey];

    // If no price ID configured yet, return instruction
    if (!plan?.price_id) {
      return res.status(503).json({
        ok: false,
        error: `No Stripe Price ID configured for "${planKey}" tier. Set STRIPE_PRICE_${planKey.toUpperCase()} in your .env file.`,
        action: 'ADD_PRICE_ID',
        setupGuide: 'https://dashboard.stripe.com/products'
      });
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: plan.price_id, quantity: 1 }],
        customer_email: userEmail || undefined,
        success_url: successUrl || `${process.env.VITE_APP_URL || 'http://localhost:5173'}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.VITE_APP_URL || 'http://localhost:5173'}/?checkout=cancelled`,
        metadata: { tier: planKey, studio: 'prompthouse-evo' },
      });
      return res.json({ ok: true, url: session.url, sessionId: session.id });
    } catch (err) {
      console.error('[Stripe Checkout] Error:', err.message);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // ── STRIPE WEBHOOK ─────────────────────────────────────────────
  // Must use raw body for signature verification.
  // Mount with express.raw() before express.json() in app-shell.
  app.post('/api/stripe/webhook',
    (req, res, next) => {
      // express.raw() should have already parsed this if mounted correctly
      // If body is a Buffer, proceed; otherwise handle gracefully
      next();
    },
    async (req, res) => {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const sig = req.headers['stripe-signature'];

      let event;
      try {
        if (webhookSecret && sig && Buffer.isBuffer(req.body)) {
          const stripe = getStripe();
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
          // Dev mode: accept unsigned events
          event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        }
      } catch (err) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return res.status(400).json({ ok: false, error: `Webhook Error: ${err.message}` });
      }

      console.log(`[Stripe Webhook] Received event: ${event.type}`);

      try {
        await handleWebhookEvent(event);
        res.json({ ok: true, received: true });
      } catch (err) {
        console.error('[Stripe Webhook] Handler error:', err.message);
        res.status(500).json({ ok: false, error: err.message });
      }
    }
  );

  // ── WEBHOOK STATUS ─────────────────────────────────────────────
  app.get('/api/stripe/webhook-status', (_req, res) => {
    res.json({
      ok: true,
      configured: Boolean(process.env.STRIPE_SECRET_KEY),
      webhookSecretSet: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      priceIds: {
        indie: Boolean(process.env.STRIPE_PRICE_INDIE),
        pro: Boolean(process.env.STRIPE_PRICE_PRO),
        sovereign: Boolean(process.env.STRIPE_PRICE_SOVEREIGN),
        enterprise: Boolean(process.env.STRIPE_PRICE_ENTERPRISE),
      },
      setupInstructions: !process.env.STRIPE_SECRET_KEY ? [
        '1. Get your Stripe secret key from https://dashboard.stripe.com/apikeys',
        '2. Add STRIPE_SECRET_KEY=sk_test_xxx to your .env file',
        '3. Create products in Stripe dashboard and add their price IDs',
        '4. Run: stripe listen --forward-to localhost:3333/api/stripe/webhook',
        '5. Add STRIPE_WEBHOOK_SECRET from the stripe listen output to .env',
      ] : null,
    });
  });
}

async function handleWebhookEvent(event) {
  const obj = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const email = obj.customer_email || obj.customer_details?.email;
      const customerId = obj.customer;
      const subscriptionId = obj.subscription;
      const tier = obj.metadata?.tier || 'pro';
      if (email) {
        const user = getUserByEmail(email);
        if (user) {
          updateUserSubscription(user.id, {
            plan: tier,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active'
          });
          console.log(`[Stripe] Activated ${tier} plan for ${email}`);
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const status = obj.status;
      const customerId = obj.customer;
      // Find user by stripe_customer_id — would need a getUserByStripeId function
      // For now log it
      console.log(`[Stripe] Subscription updated for customer ${customerId}: ${status}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const customerId = obj.customer;
      console.log(`[Stripe] Subscription cancelled for customer ${customerId}`);
      break;
    }

    case 'invoice.payment_succeeded': {
      console.log(`[Stripe] Payment succeeded for invoice ${obj.id}`);
      break;
    }

    case 'invoice.payment_failed': {
      const email = obj.customer_email;
      console.warn(`[Stripe] Payment FAILED for ${email} — invoice ${obj.id}`);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}
