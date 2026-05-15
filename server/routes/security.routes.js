import { readFileSync } from 'fs';
import { join } from 'path';
import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { 
  extractExpressRoutesWithMiddleware, 
  buildSecurityAuditReport,
  findUngatedMutationRoutes
} from '../services/mutation-route-auditor.js';

export function registerSecurityRoutes(app, context) {
  const { routeRegistry } = context;

  // Helper to read current source code for static analysis
  const getSourceCode = () => {
    try {
      const serverFile = join(process.cwd(), 'promptbridge-server.js');
      return readFileSync(serverFile, 'utf-8');
    } catch (e) {
      return '';
    }
  };

  // GET /api/security/audit
  app.get('/api/security/audit',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/security/audit',
      source: 'security.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      const source = getSourceCode();
      if (!source) {
        return res.json({ ok: false, error: 'Could not read server source for audit' });
      }
      const report = buildSecurityAuditReport(source);
      res.json({ ok: true, report });
    }
  );

  // GET /api/security/routes
  app.get('/api/security/routes',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/security/routes',
      source: 'security.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      const source = getSourceCode();
      if (!source) return res.json({ ok: false, routes: [] });
      const routes = extractExpressRoutesWithMiddleware(source);
      res.json({ ok: true, routes });
    }
  );

  // GET /api/security/mutations
  app.get('/api/security/mutations',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/security/mutations',
      source: 'security.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      const source = getSourceCode();
      if (!source) return res.json({ ok: false, ungated: [] });
      const ungated = findUngatedMutationRoutes(source);
      res.json({ ok: true, ungated, total: ungated.length });
    }
  );
}
