import { describe, expect, it } from 'vitest';
import registerStudioCoreRoutes from '../server/routes/studio-core.routes.js';

function createMockApp() {
  const routes = [];
  return {
    routes,
    get(path, handler) { routes.push({ method: 'GET', path, handler }); },
    post(path, handler) { routes.push({ method: 'POST', path, handler }); }
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
});
