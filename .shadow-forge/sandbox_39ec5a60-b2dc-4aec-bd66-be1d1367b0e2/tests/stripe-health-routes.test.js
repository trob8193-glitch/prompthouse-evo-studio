import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerStripeHealthRoutes } from '../server/routes/stripe-health.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

describe('Stripe Health Routes', () => {
  let app;
  let getHandlers = {};
  let postHandlers = {};

  beforeEach(() => {
    vi.unstubAllEnvs();
    getHandlers = {};
    postHandlers = {};
    app = {
      get: (path, ...handlers) => { getHandlers[path] = handlers; },
      post: (path, ...handlers) => { postHandlers[path] = handlers; }
    };
    registerStripeHealthRoutes(app, {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const invokeRoute = async (method, path, req = {}) => {
    const handlers = method === 'GET' ? getHandlers[path] : postHandlers[path];
    if (!handlers) throw new Error(`No route for ${method} ${path}`);
    const res = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };
    // Execute handlers sequentially
    for (const handler of handlers) {
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      await handler(req, res, next);
      if (!nextCalled && res.body !== null) break;
    }
    return res;
  };

  it('GET /api/stripe/status returns safe data without secrets', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_super_secret_123');
    const res = await invokeRoute('GET', '/api/stripe/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.mode).toBe('test');
    expect(res.body.data.safeForLocalTest).toBe(true);
    expect(res.body.data.truthState).toBe(TRUTH_STATES.VERIFIED);
    
    // Ensure raw secret is not leaked
    const json = JSON.stringify(res.body);
    expect(json).not.toContain('super_secret_123');
  });

  it('GET /api/stripe/mode returns only mode', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_super_secret_123');
    const res = await invokeRoute('GET', '/api/stripe/mode');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.mode).toBe('live');
    
    const json = JSON.stringify(res.body);
    expect(json).not.toContain('super_secret_123');
  });
});
