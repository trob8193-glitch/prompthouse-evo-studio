/**
 * PH EVO STUDIO — PROVIDER CREDENTIAL CHECKLIST ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Read-only routes. No live deploy. No provider calls. No secrets exposed.
 */
import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { getProviderCredentialChecklist } from '../services/provider-credential-checklist.js';

export function registerProviderCredentialChecklistRoutes(app, context) {
  const { routeRegistry } = context;

  app.get('/api/provider-credentials/checklist',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/provider-credentials/checklist',
      source: 'provider-credential-checklist.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const checklist = getProviderCredentialChecklist();
        res.json({ ok: true, data: checklist });
      } catch (err) {
        res.status(500).json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );
}
