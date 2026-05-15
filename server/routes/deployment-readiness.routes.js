/**
 * PH EVO STUDIO — DEPLOYMENT READINESS ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Read-only routes. No live deploy. No provider calls. No secrets.
 */
import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { getDeploymentReadinessStatus, classifyDeploymentBlockers, checkEnvironmentReadiness } from '../services/deployment-readiness.js';
import { listDeploymentReceipts } from '../services/deployment-receipts.js';

export function registerDeploymentReadinessRoutes(app, context) {
  const { routeRegistry } = context;

  // GET /api/deployment/readiness
  app.get('/api/deployment/readiness',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/deployment/readiness',
      source: 'deployment-readiness.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const status = getDeploymentReadinessStatus();
        res.json({ ok: true, ...status });
      } catch (err) {
        res.status(500).json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );

  // GET /api/deployment/blockers
  app.get('/api/deployment/blockers',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/deployment/blockers',
      source: 'deployment-readiness.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const status = getDeploymentReadinessStatus();
        res.json({ ok: true, blockers: status.blockers, warnings: status.warnings, nextActions: status.nextActions, truthState: status.truthState });
      } catch (err) {
        res.status(500).json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );

  // GET /api/deployment/environment
  app.get('/api/deployment/environment',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/deployment/environment',
      source: 'deployment-readiness.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const envCheck = checkEnvironmentReadiness();
        res.json({ ok: true, ...envCheck });
      } catch (err) {
        res.status(500).json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );

  // GET /api/deployment/receipts
  app.get('/api/deployment/receipts',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/deployment/receipts',
      source: 'deployment-readiness.routes.js',
      truthState: TRUTH_STATES.VERIFIED, security: [S.READ_ONLY], localOnly: true,
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
        const receipts = listDeploymentReceipts(limit);
        res.json({ ok: true, receipts, truthState: 'LOCAL_ONLY' });
      } catch (err) {
        res.status(500).json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );
}
