/**
 * PH EVO STUDIO — Route Registry
 * Centralized route registration, classification, and README claim comparison.
 */

import { TRUTH_STATES } from './services/truth-labels.js';

export function createRouteRegistry() {
  return { routes: [] };
}

export function registerRoute(registry, { method = 'GET', path, truthState, localOnly, providerGated, ownerApprovalRequired, ...meta } = {}) {
  const route = {
    method,
    path,
    truthState: truthState || TRUTH_STATES.UNKNOWN,
    localOnly: !!localOnly,
    providerGated: !!providerGated,
    ownerApprovalRequired: !!ownerApprovalRequired,
    registeredAt: new Date().toISOString(),
    ...meta,
  };
  registry.routes.push(route);
  return route;
}

export function listRegisteredRoutes(registry) {
  return registry.routes;
}

export function findRoute(registry, method, path) {
  return registry.routes.find(r => r.method === method && r.path === path);
}

export function classifyRegisteredRoutes(registry) {
  const routes = registry.routes;
  return {
    total: routes.length,
    localOnly: routes.filter(r => r.localOnly).length,
    providerGated: routes.filter(r => r.providerGated).length,
    ownerApprovalRequired: routes.filter(r => r.ownerApprovalRequired).length,
  };
}

export function compareRegisteredRoutesToReadmeClaims(registry, readmeContent) {
  const pathRegex = /`(\/api\/[^`]+)`/g;
  const claimed = [];
  let match;
  while ((match = pathRegex.exec(readmeContent)) !== null) {
    claimed.push(match[1]);
  }

  const registeredPaths = new Set(registry.routes.map(r => r.path));
  const missing = claimed
    .filter(p => !registeredPaths.has(p))
    .map(p => ({ path: p, truthState: TRUTH_STATES.BLOCKED }));

  return {
    documentedCount: claimed.length,
    registeredCount: registeredPaths.size,
    missing,
  };
}

export function createRegisteredRouteMiddleware(registry, routeConfig) {
  const route = registerRoute(registry, routeConfig);
  return (req, res, next) => {
    req._registeredRoute = route;
    if (next) next();
  };
}
