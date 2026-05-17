/**
 * PH EVO STUDIO — Stripe Test Checkout Routes
 */

import { requireCommerceApproval } from '../middleware/security-gates.js';
import { classifyStripeCheckoutReadiness, createStripeTestCheckoutSession } from '../services/stripe-test-checkout.js';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerStripeTestCheckoutRoutes(app, context = {}) {
  app.get('/api/stripe/test-checkout/readiness', (req, res) => {
    const readiness = classifyStripeCheckoutReadiness();
    res.json({ ok: true, ...readiness, timestamp: new Date().toISOString() });
  });

  app.post('/api/stripe/test-checkout/session', requireCommerceApproval, async (req, res) => {
    try {
      const result = await createStripeTestCheckoutSession(req.body);
      res.json(result);
    } catch (err) {
      res.status(500).json({ ok: false, truthState: TRUTH_STATES.ERROR, error: err.message });
    }
  });
}
