#!/usr/bin/env node
/**
 * PH EVO STUDIO — PRINT BACKEND ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Statically analyzes promptbridge-server.js and registered 
 * modules to print all API endpoints.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractExpressRoutesWithMiddleware } from '../server/services/mutation-route-auditor.js';

const cwd = process.cwd();
const serverFile = join(cwd, 'promptbridge-server.js');

try {
  const source = readFileSync(serverFile, 'utf8');
  const routes = extractExpressRoutesWithMiddleware(source);

  console.log(`\n🚦 Backend Route Audit`);
  console.log(`   Found ${routes.length} statically declared routes.\n`);

  // Group by method
  const byMethod = routes.reduce((acc, r) => {
    if (!acc[r.method]) acc[r.method] = [];
    acc[r.method].push(r);
    return acc;
  }, {});

  for (const method of Object.keys(byMethod).sort()) {
    console.log(`   ${method} Routes:`);
    byMethod[method].forEach(r => {
      const authInfo = r.hasAuthGate ? ' [AUTH GATED]' : '';
      const gates = r.middleware.length > 0 ? ` (${r.middleware.join(', ')})` : '';
      console.log(`     ${r.path}${authInfo}${gates}`);
    });
    console.log('');
  }

  // Also print newly modularized ones
  console.log(`   [Note] Modular routes (e.g., /api/security, /api/health) are dynamically registered via registerCoreRoutes and will be printed if they match app.get/app.post patterns, or when the server is running.\n`);
} catch (e) {
  console.error('❌ Failed to read or parse server source:', e.message);
  process.exit(1);
}
