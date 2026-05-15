import { TRUTH_STATES } from '../services/truth-labels.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { getVercelReadinessStatus } from '../services/vercel-readiness.js';

export function registerVercelStatusRoutes(app, context) {
  const { routeRegistry } = context;

  app.get('/api/vercel/status',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/vercel/status',
      method: 'GET',
      source: 'vercel-status.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }),
    (req, res) => {
      const status = getVercelReadinessStatus();
      res.json({ ok: true, data: status, truthState: TRUTH_STATES.VERIFIED });
    }
  );

  app.get('/api/vercel/readiness',
    createRegisteredRouteMiddleware(routeRegistry, {
      path: '/api/vercel/readiness',
      method: 'GET',
      source: 'vercel-status.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }),
    (req, res) => {
      const status = getVercelReadinessStatus();
      res.json({ ok: true, data: status, truthState: TRUTH_STATES.VERIFIED });
    }
  );
}
