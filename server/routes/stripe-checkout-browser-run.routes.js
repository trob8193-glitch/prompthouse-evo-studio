/**
 * PH EVO STUDIO — Stripe Checkout Browser Run Routes
 */

import { requireCommerceApproval } from '../middleware/security-gates.js';
import {
  getStripeCheckoutBrowserRunStatus,
  createStripeBrowserRunRecord,
  updateStripeBrowserRunManualStatus,
  listStripeBrowserRunRecords,
  STRIPE_BROWSER_RUN_STATUSES,
} from '../services/stripe-checkout-browser-run.js';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerStripeCheckoutBrowserRunRoutes(app, context = {}) {
  app.get('/api/stripe/test-checkout/browser-run/status', (req, res) => {
    const readiness = getStripeCheckoutBrowserRunStatus();
    res.json({ ok: true, ...readiness, timestamp: new Date().toISOString() });
  });

  app.get('/api/stripe/test-checkout/browser-run/records', (req, res) => {
    const records = listStripeBrowserRunRecords();
    res.json({ ok: true, records, truthState: TRUTH_STATES.VERIFIED });
  });

  app.post('/api/stripe/test-checkout/browser-run/record', requireCommerceApproval, (req, res) => {
    const record = createStripeBrowserRunRecord(req.body);
    res.json({ ok: true, record, truthState: TRUTH_STATES.LOCAL_ONLY });
  });

  app.post('/api/stripe/test-checkout/browser-run/update', requireCommerceApproval, (req, res) => {
    const { id, status, notes } = req.body;
    const updated = updateStripeBrowserRunManualStatus(id, status, notes);
    res.json({ ok: true, record: updated, truthState: TRUTH_STATES.LOCAL_ONLY });
  });
}
