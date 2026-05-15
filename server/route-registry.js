import { TRUTH_STATES } from './services/truth-labels.js';

/**
 * Creates a dependency-free route registry.
 */
export function createRouteRegistry() {
  return {
    routes: []
  };
}

/**
 * Registers a route and its metadata.
 */
export function registerRoute(registry, route) {
  registry.routes.push({
    method: route.method || 'GET',
    path: route.path,
    source: route.source || 'unknown',
    truthState: route.truthState || TRUTH_STATES.UNKNOWN,
    security: route.security || [],
    providerGated: !!route.providerGated,
    ownerApprovalRequired: !!route.ownerApprovalRequired,
    localOnly: !!route.localOnly,
    notes: route.notes || []
  });
}

/**
 * Returns a list of all registered routes.
 */
export function listRegisteredRoutes(registry) {
  return registry.routes;
}

/**
 * Finds a specific route by method and path.
 */
export function findRoute(registry, method, path) {
  return registry.routes.find(r => r.method === method && r.path === path);
}

/**
 * Classifies registered routes by security status.
 */
export function classifyRegisteredRoutes(registry) {
  return registry.routes.reduce((acc, route) => {
    if (route.localOnly) acc.localOnly++;
    if (route.providerGated) acc.providerGated++;
    if (route.ownerApprovalRequired) acc.ownerApprovalRequired++;
    acc.total++;
    return acc;
  }, { localOnly: 0, providerGated: 0, ownerApprovalRequired: 0, total: 0 });
}

/**
 * Compares README documented /api paths against registered routes.
 */
export function compareRegisteredRoutesToReadmeClaims(registry, readmeText) {
  const readmePaths = new Set();
  const pattern = /`(\/api\/[^`]+)`/g;
  let match;
  while ((match = pattern.exec(readmeText)) !== null) {
    readmePaths.add(match[1]);
  }

  const registeredPaths = new Set(registry.routes.map(r => r.path));
  
  const missing = [];
  for (const p of readmePaths) {
    // If a route uses a path parameter like /api/connectors/:id, 
    // exact matches might fail, but for now we look for prefixes or exact matches.
    const isMatched = Array.from(registeredPaths).some(rp => rp === p || rp.startsWith(p.split('/:')[0]));
    if (!isMatched) {
      missing.push({ path: p, truthState: TRUTH_STATES.BLOCKED, reason: 'Documented but not registered' });
    }
  }

  return {
    documentedCount: readmePaths.size,
    registeredCount: registeredPaths.size,
    missing
  };
}

/**
 * Express middleware that registers route metadata inline and adds
 * diagnostic info to the request for auditing.
 */
export function createRegisteredRouteMiddleware(registry, metadata) {
  // Register it immediately
  registerRoute(registry, metadata);
  
  // Return the middleware that marks the req as registered
  return (req, res, next) => {
    req._registeredRoute = metadata;
    next();
  };
}
