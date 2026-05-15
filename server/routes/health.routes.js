import os from 'os';
import { TRUTH_STATES } from '../services/truth-labels.js';
import { getProviderGateStatus } from '../services/provider-gates.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';

export function registerHealthRoutes(app, context) {
  const { routeRegistry } = context;

  const buildHealthResponse = () => ({
    ok: true,
    service: 'prompthouse-evo-studio-bridge',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: os.platform(),
    port: parseInt(process.env.BRIDGE_PORT || '3001', 10),
    providerGates: getProviderGateStatus(),
    truthState: TRUTH_STATES.VERIFIED
  });

  const healthHandler = (req, res) => res.json(buildHealthResponse());

  // GET /status
  app.get('/status', 
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/status',
      source: 'health.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    healthHandler
  );

  // GET /api/bridge/status
  app.get('/api/bridge/status', 
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/bridge/status',
      source: 'health.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    healthHandler
  );

  // GET /api/backend/health
  app.get('/api/backend/health', 
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET',
      path: '/api/backend/health',
      source: 'health.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.READ_ONLY],
      localOnly: true
    }) : (req, res, next) => next(),
    healthHandler
  );
}
