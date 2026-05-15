/**
 * PH EVO STUDIO — STRIPE CHECKOUT BROWSER RUN ROUTES
 * ═══════════════════════════════════════════════════════════════
 * GET  /api/stripe/test-checkout/browser-run/status
 * GET  /api/stripe/test-checkout/browser-run/records
 * POST /api/stripe/test-checkout/browser-run/record
 * POST /api/stripe/test-checkout/browser-run/manual-verification
 */
import { 
  getStripeCheckoutBrowserRunStatus,
  listStripeBrowserRunRecords,
  createStripeBrowserRunRecord,
  updateStripeBrowserRunManualStatus,
  verifyStripeCheckoutSessionForBrowserRun,
  buildStripeBrowserRunBlockedResponse,
  STRIPE_BROWSER_RUN_STATUSES
} from '../services/stripe-checkout-browser-run.js';
import { requireCommerceApproval } from '../middleware/security-gates.js';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerStripeCheckoutBrowserRunRoutes(app) {
  /**
   * GET status: Read-only readiness.
   */
  app.get('/api/stripe/test-checkout/browser-run/status', (req, res) => {
    res.json(getStripeCheckoutBrowserRunStatus());
  });

  /**
   * GET records: Read-only recent run log.
   */
  app.get('/api/stripe/test-checkout/browser-run/records', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 50;
    res.json(listStripeBrowserRunRecords(limit));
  });

  /**
   * POST record: Create a run after session creation.
   * Requires ownerApproval scope: commerce.
   */
  app.post('/api/stripe/test-checkout/browser-run/record', requireCommerceApproval, (req, res) => {
    const check = verifyStripeCheckoutSessionForBrowserRun(req.body);
    if (!check.valid) {
      return res.status(400).json(buildStripeBrowserRunBlockedResponse(check.reason));
    }

    const record = createStripeBrowserRunRecord(req.body);
    res.json({
      ok: true,
      truthState: TRUTH_STATES.LOCAL_ONLY,
      message: 'Stripe test browser run record created.',
      record
    });
  });

  /**
   * POST manual-verification: Update status.
   */
  app.post('/api/stripe/test-checkout/browser-run/manual-verification', (req, res) => {
    const { id, status, note } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ ok: false, message: 'id and status are required.' });
    }

    try {
      const update = updateStripeBrowserRunManualStatus(id, status, note);
      res.json({
        ok: true,
        truthState: status === STRIPE_BROWSER_RUN_STATUSES.TEST_PAYMENT_COMPLETED ? TRUTH_STATES.VERIFIED : TRUTH_STATES.LOCAL_ONLY,
        message: `Status updated to ${status}. This confirms a test flow, not live billing.`,
        update
      });
    } catch (err) {
      res.status(400).json({ ok: false, message: err.message });
    }
  });
}
