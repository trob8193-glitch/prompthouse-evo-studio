/**
 * PH EVO STUDIO — ENV VALIDATION ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Read-only route. No mutations. No secrets exposed.
 */
import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { getEnvValidationStatus } from '../services/env-validation.js';

export function registerEnvValidationRoutes(app, context) {
  const { routeRegistry } = context;

  // GET /api/environment/validation
  app.get('/api/environment/validation',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/environment/validation',
      source: 'env-validation.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const status = getEnvValidationStatus();
        res.json({ ok: true, ...status });
      } catch (err) {
        res.status(500).json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );
}
