import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerAiProviderStatusRoutes } from '../server/routes/ai-provider-status.routes.js';
import { registerAiProviderProbeRoutes } from '../server/routes/ai-provider-probe.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock security gates middleware
vi.mock('../server/middleware/security-gates.js', () => ({
  requireProviderProbeApproval: (req, res, next) => {
    const headerScope = req.headers['x-owner-approval-scope'];
    if (headerScope === 'provider_probe') {
      next(); // Approved
    } else {
      res.status(403).json({ ok: false, error: 'Unauthorized', truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL });
    }
  }
}));

describe('AI Provider Routes', () => {
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
    const context = { routeRegistry: { routes: [] } };
    registerAiProviderStatusRoutes(app, context);
    registerAiProviderProbeRoutes(app, context);
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
    for (const handler of handlers) {
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      await handler(req, res, next);
      if (!nextCalled && res.body !== null) break;
    }
    return res;
  };

  it('GET /api/ai-providers/status returns safe data without secrets', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-proj-safe-key-here-123456');
    const res = await invokeRoute('GET', '/api/ai-providers/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.openai.configured).toBe(true);
    
    const json = JSON.stringify(res.body);
    expect(json).not.toContain('safe-key-here');
  });

  it('POST /api/ai-providers/openai/probe blocks without approval', async () => {
    const res = await invokeRoute('POST', '/api/ai-providers/openai/probe', { headers: {} });
    expect(res.statusCode).toBe(403);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_OWNER_APPROVAL);
  });

  it('POST /api/ai-providers/openai/probe blocks missing key', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const res = await invokeRoute('POST', '/api/ai-providers/openai/probe', { headers: { 'x-owner-approval-scope': 'provider_probe' } });
    expect(res.statusCode).toBe(400);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_CREDENTIALS);
  });
});
