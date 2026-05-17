/**
 * PH EVO STUDIO — Stripe Health Routes
 */

import { TRUTH_STATES } from '../services/truth-labels.js';
import { requireCommerceApproval } from '../middleware/security-gates.js';
import Stripe from 'stripe';

export function registerStripeHealthRoutes(app, context = {}) {
  app.get('/api/stripe/status', (req, res) => {
    const key = process.env.STRIPE_SECRET_KEY || '';
    const configured = key.trim() !== '';
    let mode = 'none';
    if (key.startsWith('sk_test_')) mode = 'test';
    else if (key.startsWith('sk_live_')) mode = 'live';
    else if (configured) mode = 'unknown';

    const safeForLocalTest = mode === 'test';

    res.json({
      ok: true,
      data: {
        configured,
        mode,
        safeForLocalTest,
        truthState: configured ? TRUTH_STATES.VERIFIED : TRUTH_STATES.NEEDS_CREDENTIALS,
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/stripe/mode', (req, res) => {
    const key = process.env.STRIPE_SECRET_KEY || '';
    let mode = 'none';
    if (key.startsWith('sk_test_')) mode = 'test';
    else if (key.startsWith('sk_live_')) mode = 'live';
    else if (key.trim()) mode = 'unknown';

    res.json({
      ok: true,
      data: {
        mode,
      },
    });
  });

  app.post('/api/stripe/test/account-probe', requireCommerceApproval, async (req, res) => {
    const key = process.env.STRIPE_SECRET_KEY || '';
    
    if (!key.trim()) {
      return res.status(400).json({ ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS });
    }
    if (key.startsWith('sk_live_') && process.env.DEPLOY_ALLOW_PRODUCTION !== 'true') {
      return res.status(403).json({ ok: false, truthState: TRUTH_STATES.BLOCKED });
    }

    try {
      const stripe = new Stripe(key);
      const account = await stripe.accounts.retrieve();
      res.json({
        ok: true,
        truthState: TRUTH_STATES.VERIFIED,
        data: {
          message: 'Stripe test account probe successful.',
          account,
        }
      });
    } catch (err) {
      res.status(500).json({ ok: false, truthState: TRUTH_STATES.ERROR, error: err.message });
    }
  });
}
