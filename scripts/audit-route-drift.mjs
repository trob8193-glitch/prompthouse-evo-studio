#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next']);
const mountedRouteFiles = [
  'promptbridge-server.js',
  'server/routes/studio-core.routes.js',
  'server/routes/emulator.routes.js',
  'server/routes/ai-provider-status.routes.js',
  'server/routes/ai-provider-probe.routes.js',
  'server/routes/stripe-health.routes.js',
  'server/routes/stripe-test-checkout.routes.js',
  'server/routes/stripe-checkout-browser-run.routes.js',
  'server/routes/vercel-preview-deploy.routes.js',
  'server/routes/handover.routes.js',
  'generated_apis/evo_bridge_routes.js',
  'generated_apis/platform_sentinel_routes.js',
  'generated_apis/ai_model_routes.js',
  'generated_apis/evo_diffuser_routes.js',
  'generated_apis/evo_terminal_routes.js',
  'generated_apis/evo_capability_routes.js',
  'generated_apis/portfolio_routes.js',
  'generated_apis/engine_dashboard_routes.js',
  'generated_apis/evo_llm_routes.js',
  'generated_apis/module_maturity_routes.js',
  'generated_apis/spinecore_routes.js',
  'generated_apis/promptshell_routes.js',
  'generated_apis/execution_routes.js'
];

function read(rel) {
  const file = path.join(root, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function collectFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const filePath = path.join(dir, entry);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      collectFiles(filePath, files);
    } else if (/\.(js|jsx|mjs)$/.test(entry)) {
      files.push(filePath);
    }
  }
  return files;
}

function normalizeRoute(route) {
  const trimmed = String(route || '').trim();
  if (!trimmed || trimmed.startsWith('http')) return trimmed;
  const [withoutQuery] = trimmed.split('?');
  return withoutQuery.replace(/\$\{[^}]+\}/g, ':param');
}

function routeMatches(clientRoute, serverPath) {
  if (clientRoute === serverPath) return true;
  const clientParts = clientRoute.split('/').filter(Boolean);
  const serverParts = serverPath.split('/').filter(Boolean);
  if (clientParts.length !== serverParts.length) return false;
  return serverParts.every((part, index) => part.startsWith(':') || part === clientParts[index]);
}

function collectClientRoutes() {
  const routes = new Map();
  for (const filePath of collectFiles(path.join(root, 'src'))) {
    const rel = path.relative(root, filePath);
    const text = fs.readFileSync(filePath, 'utf8');
    for (const match of text.matchAll(/safeFetchBridge\(\s*['"`]([^'"`]+)['"`]/g)) {
      const route = normalizeRoute(match[1]);
      if (!routes.has(route)) routes.set(route, []);
      routes.get(route).push(rel);
    }
  }
  return [...routes.entries()]
    .map(([route, files]) => ({ route, files: [...new Set(files)].sort() }))
    .sort((a, b) => a.route.localeCompare(b.route));
}

function collectServerRoutes() {
  const routes = [];
  const routeRegex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
  for (const rel of mountedRouteFiles) {
    const text = read(rel);
    let match;
    while ((match = routeRegex.exec(text)) !== null) {
      routes.push({ method: match[1].toUpperCase(), path: normalizeRoute(match[2]), file: rel });
    }
  }
  return routes.sort((a, b) => `${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`));
}

const clientRoutes = collectClientRoutes();
const serverRoutes = collectServerRoutes();
const serverPaths = [...new Set(serverRoutes.map(route => route.path))];
const unresolved = clientRoutes.filter(client => !serverPaths.some(serverPath => routeMatches(client.route, serverPath)));
const hardcodedStoreSidecar = read('src/store.js').includes('127.0.0.1:3002');

const report = {
  success: unresolved.length === 0 && !hardcodedStoreSidecar,
  truthState: unresolved.length || hardcodedStoreSidecar ? 'ROUTE_DRIFT_FOUND' : 'ROUTE_DRIFT_CLEAR',
  clientRoutes,
  serverRoutes,
  unresolvedClientRoutes: unresolved,
  hardcodedStoreSidecar
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.success ? 0 : 1);
