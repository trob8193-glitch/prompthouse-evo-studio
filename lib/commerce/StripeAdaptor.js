import Stripe from 'stripe';

export class StripeAdaptor {
  constructor(secretKey) {
    this.stripe = secretKey ? new Stripe(secretKey) : null;
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    if (!this.stripe) return { success: false, error: 'Stripe not configured' };
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // cents
        currency,
        metadata
      });
      return { success: true, clientSecret: intent.client_secret };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async processWorkTwinPurchase(userId, twinId, price) {
    // Stub for deducting credits or triggering purchase
    return { success: true, transactionId: `txn_${Date.now()}` };
  }
}
