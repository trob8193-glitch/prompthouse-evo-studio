/**
 * PH EVO STUDIO — PROVIDER GATES ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Read-only route for provider credential gate status.
 */
import { getProviderGateStatus } from '../services/provider-gates.js';
import { buildTruthResponse } from '../services/truth-labels.js';

export function registerProviderGateRoutes(app) {
  app.get('/api/provider-gates/status', (req, res) => {
    try {
      const gates = getProviderGateStatus();
      res.json(buildTruthResponse({
        success: true,
        gates,
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
