import { TRUTH_STATES } from '../services/truth-labels.js';
import { getProviderGateStatus } from '../services/provider-gates.js';
import { getReceiptsByProvider } from '../services/provider-receipts.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';

export function registerProviderRoutes(app, context) {
  const { routeRegistry } = context;

  // GET /api/provider-gates/status
  app.get('/api/provider-gates/status',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/provider-gates/status',
      source: 'provider.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      const gates = getProviderGateStatus();
      res.json({ ok: true, gates });
    }
  );

  // GET /api/provider/status (Alias for the above)
  app.get('/api/provider/status',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/provider/status',
      source: 'provider.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      const gates = getProviderGateStatus();
      res.json({ ok: true, gates });
    }
  );

  // GET /api/provider-receipts
  app.get('/api/provider-receipts',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/provider-receipts',
      source: 'provider.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    async (req, res) => {
      const { provider } = req.query;
      try {
        const receipts = provider ? await getReceiptsByProvider(provider) : [];
        res.json({ ok: true, receipts });
      } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
      }
    }
  );
}
