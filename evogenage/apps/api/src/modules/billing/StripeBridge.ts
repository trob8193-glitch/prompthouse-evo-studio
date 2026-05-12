import Stripe from 'stripe';

/**
 * EVOGENAGE — STRIPE BILLING BRIDGE (PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Physically connects the Credit Ledger to the Stripe Grid.
 * Enforces real-world financial truth for the Sovereign Foundry.
 */

export class StripeBridge {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-01-27' as any
    });
  }

  /**
   * Create a physical checkout session for credit top-ups.
   */
  async createCheckoutSession(userId: string, amount: number) {
    console.log(`💳 [StripeBridge] Creating physical session for ${userId} (Amount: ${amount})...`);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Evo-Studio Credits' },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
      metadata: { userId }
    });

    return session.url;
  }
}
