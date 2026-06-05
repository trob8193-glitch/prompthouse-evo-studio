#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src', 'store.js');
const current = fs.readFileSync(file, 'utf8');
let next = current
  .replace("const res = await fetch('http://127.0.0.1:3002/status', { signal: AbortSignal.timeout(3000) });\n      if (!res.ok) throw new Error(`Rift returned ${res.status}`);\n      const data = await res.json();", "const result = await safeFetchBridge('/api/rift/status', { timeout: 4000 });\n      if (!result.ok) throw new Error(result.error || `Rift returned ${result.status}`);\n      const data = result.data;")
  .replace("fetch('http://127.0.0.1:3002/api/evopulse/nodes'),\n        fetch('http://127.0.0.1:3002/api/evopulse/routes')", "safeFetchBridge('/api/evopulse/nodes', { timeout: 4000 }),\n        safeFetchBridge('/api/evopulse/routes', { timeout: 4000 })")
  .replace("const nodes = await nodesRes.json();\n      const routes = await routesRes.json();", "const nodes = nodesRes.data;\n      const routes = routesRes.data;")
  .replace("// Stay silent on mesh failure", "set({ gridNodes: [], gridRoutes: [] });");

if (next === current) {
  console.log(JSON.stringify({ success: true, truthState: 'STORE_RIFT_ROUTES_ALREADY_REPAIRED', file }, null, 2));
  process.exit(0);
}

fs.writeFileSync(file, next, 'utf8');
console.log(JSON.stringify({ success: true, truthState: 'STORE_RIFT_ROUTES_REPAIRED', file }, null, 2));
