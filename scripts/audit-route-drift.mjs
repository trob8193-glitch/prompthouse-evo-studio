#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const filesToRead = [
  'src/store.js',
  'src/features/GovernanceCockpit.jsx',
  'src/App.jsx',
  'src/components/Navigation.jsx',
  'promptbridge-server-recovery.js',
  'server/routes/studio-core.routes.js',
  'generated_apis/evo_bridge_routes.js',
  'generated_apis/platform_sentinel_routes.js',
  'generated_apis/ai_model_routes.js'
];

function read(rel) {
  const file = path.join(root, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function collectClientRoutes() {
  const routes = new Set();
  for (const rel of filesToRead.filter(file => file.startsWith('src/'))) {
    const text = read(rel);
    for (const match of text.matchAll(/safeFetchBridge\(['"`]([^'"`]+)['"`]/g)) routes.add(match[1]);
  }
  return [...routes].sort();
}

function collectServerRoutes() {
  const routes = new Set();
  for (const rel of filesToRead.filter(file => !file.startsWith('src/'))) {
    const text = read(rel);
    for (const match of text.matchAll(/app\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g)) {
      routes.add(`${match[1].toUpperCase()} ${match[2]}`);
    }
    for (const match of text.matchAll(/app\[['"`](get|post|put|patch|delete)['"`]\]\(route\(([^\n]+?)\),/gs)) {
      routes.add(`${match[1].toUpperCase()} DYNAMIC_ROUTE_BUILDER`);
    }
  }
  return [...routes].sort();
}

const clientRoutes = collectClientRoutes();
const serverRoutes = collectServerRoutes();
const serverPaths = new Set(serverRoutes.map(route => route.replace(/^[A-Z]+\s+/, '')));
const unresolved = clientRoutes.filter(route => !serverPaths.has(route));
const hardcodedExternal = read('src/store.js').includes('127.0.0.1:3002');

const report = {
  success: unresolved.length === 0 && !hardcodedExternal,
  truthState: unresolved.length || hardcodedExternal ? 'ROUTE_DRIFT_FOUND' : 'ROUTE_DRIFT_CLEAR',
  clientRoutes,
  serverRoutes,
  unresolvedClientRoutes: unresolved,
  hardcodedExternal
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.success ? 0 : 1);
