/**
 * PH EVO STUDIO — Mutation Route Auditor Service
 * Extracts Express routes from source code, classifies them, and builds security audit reports.
 */

const ROUTE_REGEX = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]([^)]*)\)/gi;

const AUTH_MIDDLEWARE = [
  'maybeRequireAuthOrMaster',
  'requireOwnerApprovalScope',
  'authenticateToken',
  'authorizeExternal',
  'authRateLimit',
  'requireAuth',
];

const CATEGORY_MAP = {
  deploy: /\/(deploy|vercel-deploy|hosting)/i,
  commerce: /\/(commerce|stripe|billing|checkout)/i,
  auth: /\/auth\//i,
  config: /\/(config|keys)(\/|$)/i,
  file_write: /\/(files|forge)\/(write|save)/i,
  self_implementation: /\/self-implementation\//i,
  training: /\/(training|capture|finetune)/i,
  promptlink: /\/promptlink/i,
  nightforge: /\/nightforge/i,
  evolution: /\/evolution/i,
  connector: /\/connectors/i,
  git: /\/git\//i,
  other: /.*/,
};

/**
 * Extracts Express route definitions with their middleware from source code.
 */
export function extractExpressRoutesWithMiddleware(source) {
  const routes = [];
  let match;
  const re = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]([^;]*)/gi;

  while ((match = re.exec(source)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    const rest = match[3] || '';

    const middleware = AUTH_MIDDLEWARE.filter(mw => rest.includes(mw));
    const hasAuthGate = middleware.length > 0;

    routes.push({ method, path, middleware, hasAuthGate });
  }

  return routes;
}

function categorizeRoute(path) {
  for (const [cat, regex] of Object.entries(CATEGORY_MAP)) {
    if (cat === 'other') continue;
    if (regex.test(path)) return cat;
  }
  return 'other';
}

/**
 * Classifies mutation route coverage from source code.
 */
export function classifyMutationRouteCoverage(source) {
  const routes = extractExpressRoutesWithMiddleware(source);
  const readOnly = routes.filter(r => r.method === 'GET').length;
  const mutations = routes.filter(r => r.method !== 'GET').length;
  const gatedMutations = routes.filter(r => r.method !== 'GET' && r.hasAuthGate).length;
  const gatePercentage = mutations === 0 ? 100 : Math.round((gatedMutations / mutations) * 100);

  return {
    total: routes.length,
    readOnly,
    mutations,
    gatedMutations,
    gatePercentage,
  };
}

/**
 * Finds mutation routes that lack any auth middleware.
 */
export function findUngatedMutationRoutes(source) {
  const routes = extractExpressRoutesWithMiddleware(source);
  return routes
    .filter(r => r.method !== 'GET' && !r.hasAuthGate)
    .map(r => ({
      ...r,
      category: categorizeRoute(r.path),
    }));
}

/**
 * Builds a full security audit report from source code.
 */
export function buildSecurityAuditReport(source) {
  const coverage = classifyMutationRouteCoverage(source);
  const suspiciousRoutes = findUngatedMutationRoutes(source);
  const routes = extractExpressRoutesWithMiddleware(source);

  const routesByCategory = {};
  for (const [cat] of Object.entries(CATEGORY_MAP)) {
    if (cat === 'other') continue;
    routesByCategory[cat] = routes.filter(r => categorizeRoute(r.path) === cat).length;
  }

  const truthState = suspiciousRoutes.length > 0 ? 'NEEDS_REVIEW' : 'VERIFIED';

  return {
    truthState,
    coverage,
    suspiciousRoutes,
    routesByCategory,
    timestamp: new Date().toISOString(),
  };
}
