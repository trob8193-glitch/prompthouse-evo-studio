/**
 * PH EVO STUDIO — MUTATION ROUTE AUDITOR
 * ═══════════════════════════════════════════════════════════════
 * Static analysis of Express route registrations to detect
 * ungated mutation routes and build security audit reports.
 * Dependency-free — operates on source text only.
 */

const MUTATION_METHODS = ['post', 'put', 'patch', 'delete'];

const ROUTE_REGEX = /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;

const KNOWN_MIDDLEWARE = [
  'requireAuth',
  'requireAuthOrMaster',
  'maybeRequireAuthOrMaster',
  'requireMasterKey',
  'requireOwnerApprovalScope',
  'enforceJsonObjectBody',
  'writeRateLimit',
  'authRateLimit',
  'validateApiKey',
  'requireDeployApproval',
  'requireCommerceApproval',
  'requireSelfImplementationApproval',
  'requireProviderCredentials',
  'requireConfigWriteAuth',
  'requireFileWriteAuth',
  'requireMutationAuth',
  'securityGateForRoute',
];

const AUTH_MIDDLEWARE = new Set([
  'requireAuth',
  'requireAuthOrMaster',
  'maybeRequireAuthOrMaster',
  'requireMasterKey',
  'requireOwnerApprovalScope',
  'validateApiKey',
  'requireDeployApproval',
  'requireCommerceApproval',
  'requireSelfImplementationApproval',
  'requireProviderCredentials',
  'requireConfigWriteAuth',
  'requireFileWriteAuth',
  'requireMutationAuth',
]);

const PATH_CLASSIFIERS = [
  { pattern: /deploy|vercel/, category: 'deploy' },
  { pattern: /commerce|stripe|checkout|billing/, category: 'commerce' },
  { pattern: /config\/keys|keys\/create/, category: 'config' },
  { pattern: /files\/write|forge\/save/, category: 'file_write' },
  { pattern: /self-implementation|initiate-self-mutation/, category: 'self_implementation' },
  { pattern: /nightforge|daemon|maintenance|cycle/, category: 'maintenance' },
  { pattern: /terminal|sandbox/, category: 'terminal' },
  { pattern: /foundry|generate/, category: 'foundry' },
  { pattern: /auth\/register|auth\/login/, category: 'auth' },
];

/**
 * Extracts routes with their detected middleware from source text.
 */
export function extractExpressRoutesWithMiddleware(sourceText) {
  const routes = [];
  const lines = sourceText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/.exec(line);
    if (!match) continue;

    const [, method, path] = match;
    const middlewareFound = [];
    for (const mw of KNOWN_MIDDLEWARE) {
      if (line.includes(mw)) {
        middlewareFound.push(mw);
      }
    }

    routes.push({
      method: method.toUpperCase(),
      path,
      line: i + 1,
      middleware: middlewareFound,
      hasAuthGate: middlewareFound.some((m) => AUTH_MIDDLEWARE.has(m)),
    });
  }

  return routes;
}

/**
 * Classifies the mutation route coverage.
 */
export function classifyMutationRouteCoverage(sourceText) {
  const routes = extractExpressRoutesWithMiddleware(sourceText);

  const readOnly = routes.filter((r) => r.method === 'GET');
  const mutations = routes.filter((r) => MUTATION_METHODS.includes(r.method.toLowerCase()));
  const gated = mutations.filter((r) => r.hasAuthGate);
  const ungated = mutations.filter((r) => !r.hasAuthGate);

  return {
    total: routes.length,
    readOnly: readOnly.length,
    mutations: mutations.length,
    gated: gated.length,
    ungated: ungated.length,
    gatePercentage: mutations.length > 0 ? Math.round((gated.length / mutations.length) * 100) : 100,
  };
}

/**
 * Returns mutation routes that lack any auth middleware.
 */
export function findUngatedMutationRoutes(sourceText) {
  const routes = extractExpressRoutesWithMiddleware(sourceText);
  return routes
    .filter((r) => MUTATION_METHODS.includes(r.method.toLowerCase()) && !r.hasAuthGate)
    .map((r) => {
      const category = classifyPathCategory(r.path);
      return { ...r, category, suspicious: isSuspiciousUngated(r.path, category) };
    });
}

function classifyPathCategory(path) {
  for (const { pattern, category } of PATH_CLASSIFIERS) {
    if (pattern.test(path)) return category;
  }
  return 'general';
}

function isSuspiciousUngated(path, category) {
  // Auth routes are expected to be ungated (they ARE the auth)
  if (category === 'auth') return false;
  // Read-only telemetry/sync routes are low risk
  if (/sync$|capture$|log$|ingest$/.test(path)) return false;
  // Mutation routes without auth on deploy/commerce/config/file_write are suspicious
  return ['deploy', 'commerce', 'config', 'file_write', 'self_implementation', 'terminal'].includes(category);
}

/**
 * Builds a full security audit report from source text.
 */
export function buildSecurityAuditReport(sourceText) {
  const coverage = classifyMutationRouteCoverage(sourceText);
  const ungated = findUngatedMutationRoutes(sourceText);
  const suspicious = ungated.filter((r) => r.suspicious);
  const routes = extractExpressRoutesWithMiddleware(sourceText);

  // Classify by purpose
  const deployRoutes = routes.filter((r) => classifyPathCategory(r.path) === 'deploy');
  const commerceRoutes = routes.filter((r) => classifyPathCategory(r.path) === 'commerce');
  const configRoutes = routes.filter((r) => classifyPathCategory(r.path) === 'config');
  const fileWriteRoutes = routes.filter((r) => classifyPathCategory(r.path) === 'file_write');
  const selfImplRoutes = routes.filter((r) => classifyPathCategory(r.path) === 'self_implementation');

  // Determine truth state
  let truthState = 'VERIFIED';
  if (suspicious.length > 0) truthState = 'NEEDS_OWNER_APPROVAL';
  if (coverage.gatePercentage < 50) truthState = 'BLOCKED';

  return {
    truthState,
    coverage,
    ungatedMutationRoutes: ungated.map((r) => ({
      method: r.method,
      path: r.path,
      line: r.line,
      category: r.category,
      suspicious: r.suspicious,
    })),
    suspiciousRoutes: suspicious.map((r) => ({
      method: r.method,
      path: r.path,
      line: r.line,
      category: r.category,
    })),
    routesByCategory: {
      deploy: deployRoutes.length,
      commerce: commerceRoutes.length,
      config: configRoutes.length,
      fileWrite: fileWriteRoutes.length,
      selfImplementation: selfImplRoutes.length,
    },
    timestamp: new Date().toISOString(),
  };
}
