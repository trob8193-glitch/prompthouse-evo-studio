import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PH EVO STUDIO — STRIPE ADAPTOR (PRODUCTION GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Handles real-world Stripe sessions, products, and webhooks.
 */
export class StripeAdaptor {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.STRIPE_SECRET_KEY;
    this.stripe = this.apiKey ? new Stripe(this.apiKey) : null;
    this.baseUrl = process.env.APP_URL || 'https://prompthouse-evo-studio-fnd.web.app';
  }

  updateKey(key) {
    if (key) {
      this.apiKey = key;
      this.stripe = new Stripe(key);
    }
  }

  async createProductSession(params) {
    if (!this.stripe) {
      throw new Error('STRIPE_KEY_MISSING: Cannot create real session without API key.');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: params.currency || 'usd',
            product_data: {
              name: params.productName || 'PH Studio Pro',
              description: params.description || 'Access to sovereign studio modules.',
            },
            unit_amount: params.price || 299900, // in cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${this.baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.baseUrl}/cancel`,
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
        receipt: `receipt_${Date.now()}`,
        injectionCode: `<a href="${session.url}" class="stripe-button">Buy Now</a>`
      };
    } catch (e) {
      console.error('❌ [Stripe] Error:', e.message);
      return { success: false, error: e.message };
    }
  }

  getPricingTable() {
    return {
      success: true,
      tiers: [
        { name: 'Core Edition', price: 9900, features: ['Local Autonomy', 'Basic Bridge', '11-Bot Roster'] },
        { name: 'Sovereign Pro', price: 29900, features: ['Advanced Evolution', 'Truth Auditor', 'Full Interop Adaptors'] },
        { name: 'Enterprise Foundry', price: 99900, features: ['Multi-Project Swarm', 'Deep Training Edges', 'Priority Support'] }
      ]
    };
  }
}
