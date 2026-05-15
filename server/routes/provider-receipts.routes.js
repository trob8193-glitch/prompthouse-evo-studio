/**
 * PH EVO STUDIO — PROVIDER RECEIPTS ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Read-only route for provider interaction receipts.
 */
import { listProviderReceipts } from '../services/provider-receipts.js';
import { buildTruthResponse } from '../services/truth-labels.js';

export function registerProviderReceiptRoutes(app) {
  app.get('/api/provider-receipts', (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
      const receipts = listProviderReceipts(limit);
      res.json(buildTruthResponse({
        success: true,
        count: receipts.length,
        receipts,
        truthState: 'LOCAL_ONLY',
      }));
    } catch (err) {
      res.status(500).json(buildTruthResponse({
        success: false,
        error: err.message,
        truthState: 'ERROR',
      }));
    }
  });
}
