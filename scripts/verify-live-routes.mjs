#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { ROUTE_REGISTRY } from '../src/core/routes/RouteRegistry.js';

const baseUrl = process.env.BRIDGE_URL || process.env.VITE_BRIDGE_URL || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))))));
const paths = new Set(['/status', '/api/metrics', '/api/reviews', '/api/proof-docs', '/api/truth/probe', '/api/rift/status', '/api/evopulse/nodes', '/api/evopulse/routes', '/api/ai/models', '/api/evo-bridge/status', '/api/platform-sentinel/status']);
const routes = ROUTE_REGISTRY.filter(route => route.method === 'GET' && paths.has(route.path));

async function check(route) {
  const startedAt = Date.now();
  try {
    const response = await fetch(`${baseUrl}${route.path}`);
    return { ...route, ok: response.ok, status: response.status, latencyMs: Date.now() - startedAt };
  } catch (error) {
    return { ...route, ok: false, status: null, latencyMs: Date.now() - startedAt, error: error.message };
  }
}

const checked = [];
for (const route of routes) checked.push(await check(route));

const passed = checked.filter(item => item.ok).length;
const receipt = {
  success: passed === checked.length,
  truthState: passed === checked.length ? 'LIVE_ROUTES_VERIFIED' : 'LIVE_ROUTES_NEED_REVIEW',
  baseUrl,
  checkedAt: new Date().toISOString(),
  passed,
  failed: checked.length - passed,
  routes: checked
};

const dir = path.join(process.cwd(), '.prompthouse-data', 'routes');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `live-route-verification-${Date.now()}.json`);
fs.writeFileSync(file, JSON.stringify(receipt, null, 2), 'utf8');
console.log(JSON.stringify({ ...receipt, receiptFile: file }, null, 2));
