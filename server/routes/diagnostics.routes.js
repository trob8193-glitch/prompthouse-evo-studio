import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { runCssAudit } from '../../src/diagnostics/css-var-audit.js';
import { runImportAudit } from '../../src/diagnostics/import-audit.js';
import { classifyMutationRouteCoverage } from '../services/mutation-route-auditor.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export function registerDiagnosticsRoutes(app, context) {
  const { routeRegistry } = context;

  // Helper to read server source
  const getSourceCode = () => {
    try {
      const serverFile = join(process.cwd(), 'promptbridge-server.js');
      return readFileSync(serverFile, 'utf-8');
    } catch (e) {
      return '';
    }
  };

  // GET /api/diagnostics/routes
  app.get('/api/diagnostics/routes',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/diagnostics/routes',
      source: 'diagnostics.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      const source = getSourceCode();
      if (!source) return res.json({ ok: false, error: 'Could not read server source' });
      const coverage = classifyMutationRouteCoverage(source);
      res.json({ ok: true, coverage, truthState: coverage.gatePercentage === 100 ? TRUTH_STATES.VERIFIED : TRUTH_STATES.BLOCKED });
    }
  );

  // GET /api/diagnostics/imports
  app.get('/api/diagnostics/imports',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/diagnostics/imports',
      source: 'diagnostics.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const result = runImportAudit(process.cwd());
        res.json({ ok: true, result, truthState: result.ok ? TRUTH_STATES.VERIFIED : TRUTH_STATES.ERROR });
      } catch (err) {
        res.json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );

  // GET /api/diagnostics/css-vars
  app.get('/api/diagnostics/css-vars',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/diagnostics/css-vars',
      source: 'diagnostics.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      try {
        const result = runCssAudit(process.cwd());
        res.json({ ok: true, result, truthState: result.ok ? TRUTH_STATES.VERIFIED : TRUTH_STATES.ERROR });
      } catch (err) {
        res.json({ ok: false, error: err.message, truthState: TRUTH_STATES.ERROR });
      }
    }
  );

  // GET /api/diagnostics/worktree
  app.get('/api/diagnostics/worktree',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/diagnostics/worktree',
      source: 'diagnostics.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      // Very basic worktree classification
      const cwd = process.cwd();
      const hasSrc = existsSync(join(cwd, 'src'));
      const hasServer = existsSync(join(cwd, 'server'));
      const hasTests = existsSync(join(cwd, 'tests'));
      const hasDataDir = existsSync(join(cwd, '.prompthouse-data'));
      
      const ok = hasSrc && hasServer && hasTests;
      res.json({
        ok: true,
        directories: {
          src: hasSrc,
          server: hasServer,
          tests: hasTests,
          data: hasDataDir
        },
        truthState: ok ? TRUTH_STATES.VERIFIED : TRUTH_STATES.ERROR
      });
    }
  );
}
