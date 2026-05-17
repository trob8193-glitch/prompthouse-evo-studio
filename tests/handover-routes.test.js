import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerHandoverRoutes } from '../server/routes/handover.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock fs
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn()
  }
}));

import fs from 'node:fs';

describe('Handover Routes', () => {
  let app;
  let getHandlers = {};

  beforeEach(() => {
    vi.unstubAllEnvs();
    getHandlers = {};
    app = {
      get: (path, ...handlers) => { getHandlers[path] = handlers; }
    };
    registerHandoverRoutes(app, { routeRegistry: { routes: [] } });
  });

  const invokeRoute = async (path) => {
    const handlers = getHandlers[path];
    if (!handlers) throw new Error(`No route for GET ${path}`);
    const res = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };
    for (const handler of handlers) {
      let nextCalled = false;
      await handler({}, res, () => { nextCalled = true; });
      if (!nextCalled && res.body !== null) break;
    }
    return res;
  };

  it('GET /api/handover/status returns safe summary with blockers when missing', async () => {
    fs.existsSync.mockReturnValue(false); // No report
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'false');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    
    const res = await invokeRoute('/api/handover/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.truthState).toBe(TRUTH_STATES.LOCAL_ONLY);
    expect(res.body.productionDeployBlocked).toBe(true);
    expect(res.body.reportGenerated).toBe(false);
  });

  it('GET /api/handover/report returns 404 when missing', async () => {
    fs.existsSync.mockImplementation((p) => !p.includes('handover-report.json'));
    
    const res = await invokeRoute('/api/handover/report');
    expect(res.statusCode).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.truthState).toBe(TRUTH_STATES.LOCAL_ONLY);
  });

  it('GET /api/handover/report strips secrets if somehow present', async () => {
    const mockReport = {
      ok: true,
      environment: { rawToken: 'super-secret', stripeKey: 'test' }
    };
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockReport));

    const res = await invokeRoute('/api/handover/report');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.report.environment.rawToken).toBeUndefined(); // Stripped
  });
});
