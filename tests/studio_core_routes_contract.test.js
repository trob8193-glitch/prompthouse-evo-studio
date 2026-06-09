import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';
import registerStudioCoreRoutes, { buildStudioIqMetrics, readStudioLedgerStats } from '../server/routes/studio-core.routes.js';

function createMockApp() {
  const routes = [];
  const routeMap = new Map();
  return {
    routes,
    get(path, handler) {
      routes.push({ method: 'GET', path, handler });
      routeMap.set(`GET ${path}`, handler);
    },
    post(path, handler) {
      routes.push({ method: 'POST', path, handler });
      routeMap.set(`POST ${path}`, handler);
    },
    invoke(method, path) {
      const handler = routeMap.get(`${method} ${path}`);
      if (!handler) throw new Error(`Route not found: ${method} ${path}`);
      const res = {
        body: null,
        json(payload) {
          this.body = payload;
          return this;
        }
      };
      handler({}, res);
      return res.body;
    }
  };
}

describe('studio core route contract', () => {
  it('registers recovery routes used by the frontend store', () => {
    const app = createMockApp();
    registerStudioCoreRoutes(app);
    const registered = new Set(app.routes.map(route => `${route.method} ${route.path}`));

    for (const route of [
      'GET /status',
      'GET /api/metrics',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/config/keys',
      'POST /api/sovereign-ledger/log',
      'POST /api/maintenance/run',
      'GET /api/truth/probe',
      'POST /api/evo-lm/chat',
      'GET /api/reviews',
      'GET /api/proof-docs',
      'GET /api/rift/status',
      'GET /api/evopulse/nodes',
      'GET /api/evopulse/routes'
    ]) {
      expect(registered.has(route)).toBe(true);
    }
  });

  it('returns IQ telemetry expected by dashboard and top bar', () => {
    const app = createMockApp();
    registerStudioCoreRoutes(app);

    const status = app.invoke('GET', '/status');
    expect(status.iq_metrics.baseline).toBe(165000000);
    expect(status.iq_metrics.sovereign_gain).toBe(0);

    const metrics = buildStudioIqMetrics(2500, 3);
    expect(metrics.logic.iq).toBe(165002500);
    expect(metrics.logic.density).toBe('165.00');
    expect(metrics.logic.action_count).toBe(3);
    expect(metrics.iqMetrics.baseline).toBe(165000000);
  });

  it('sums file-backed ledger IQ gains', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-iq-'));
    const ledger = path.join(dir, 'sovereign-ledger.jsonl');
    fs.writeFileSync(ledger, [
      JSON.stringify({ iq_gain: 2 }),
      JSON.stringify({ iqGain: 3 }),
      'not-json',
      JSON.stringify({ action: 'no_gain' })
    ].join('\n'));

    const stats = readStudioLedgerStats(ledger);
    expect(stats.sovereignGain).toBe(5);
    expect(stats.actionCount).toBe(3);
  });
});
