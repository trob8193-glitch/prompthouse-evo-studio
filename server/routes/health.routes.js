/**
 * PH EVO STUDIO — Health Routes
 */

import { TRUTH_STATES } from '../services/truth-labels.js';
import { getProviderGateStatus } from '../services/provider-gates.js';

export function registerHealthRoutes(app, { routeRegistry }) {
  app.get('/status', (req, res) => {
    res.json({
      ok: true,
      service: 'prompthouse-evo-studio-bridge',
      timestamp: new Date().toISOString(),
      truthState: TRUTH_STATES.VERIFIED,
      providerGates: getProviderGateStatus(),
    });
  });

  app.get('/api/bridge/status', (req, res) => {
    res.json({
      ok: true,
      service: 'prompthouse-evo-studio-bridge',
      truthState: TRUTH_STATES.VERIFIED,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/backend/health', (req, res) => {
    res.json({
      ok: true,
      uptime: process.uptime(),
      truthState: TRUTH_STATES.VERIFIED,
      timestamp: new Date().toISOString(),
    });
  });
}
