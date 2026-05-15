/**
 * PH EVO STUDIO — ROUTE CONTRACT UTILITY
 * ═══════════════════════════════════════════════════════════════
 * Extracts and compares README-documented endpoints against
 * actual Express route definitions in server source files.
 */

/**
 * Extracts /api/... endpoint references from README text.
 */
export function extractReadmeEndpoints(readmeText) {
  if (typeof readmeText !== 'string') return [];
  const pattern = /(?:GET|POST|PUT|PATCH|DELETE|`)\s*(\/api\/[^\s`'",)}\]]+)/gi;
  const endpoints = new Set();
  let match;
  while ((match = pattern.exec(readmeText)) !== null) {
    const clean = match[1].replace(/[`'"]/g, '').replace(/\/$/, '');
    if (clean.length > 4) endpoints.add(clean);
  }
  // Also catch bare /api/... paths not preceded by HTTP method
  const barePattern = /(?:^|\s|[`"'])(\/api\/[a-zA-Z0-9_\-/:]+)/gm;
  while ((match = barePattern.exec(readmeText)) !== null) {
    const clean = match[1].replace(/[`'"]/g, '').replace(/\/$/, '');
    if (clean.length > 4) endpoints.add(clean);
  }
  return Array.from(endpoints).sort();
}

/**
 * Extracts Express route definitions from source text.
 * Matches app.get('/path'), app.post("/path"), app.put(`/path`) etc.
 */
export function extractExpressRoutes(sourceText) {
  if (typeof sourceText !== 'string') return [];
  const pattern = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/gi;
  const routes = [];
  let match;
  while ((match = pattern.exec(sourceText)) !== null) {
    routes.push({
      method: match[1].toUpperCase(),
      path: match[2],
    });
  }
  return routes;
}

/**
 * Compares README endpoints against Express route definitions.
 * Returns structured coverage report.
 */
export function compareEndpointCoverage(readmeEndpoints, routeDefinitions) {
  const definedPaths = new Set(routeDefinitions.map((r) => r.path));

  const covered = [];
  const missing = [];

  for (const endpoint of readmeEndpoints) {
    // Check exact match or parametric match (e.g. /api/foo/:id covers /api/foo/bar)
    const found = definedPaths.has(endpoint) ||
      Array.from(definedPaths).some((defined) => {
        // Convert Express :param patterns to regex-safe wildcards
        const pattern = defined.replace(/:[^/]+/g, '[^/]+');
        try {
          return new RegExp(`^${pattern}$`).test(endpoint);
        } catch {
          return false;
        }
      });

    if (found) {
      covered.push(endpoint);
    } else {
      missing.push(endpoint);
    }
  }

  return {
    readmeEndpoints,
    routeDefinitions,
    covered,
    missing,
  };
}
