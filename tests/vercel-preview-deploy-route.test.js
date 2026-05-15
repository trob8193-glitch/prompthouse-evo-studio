import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerVercelPreviewDeployRoutes } from '../server/routes/vercel-preview-deploy.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock security gates middleware
vi.mock('../server/middleware/security-gates.js', () => ({
  requireDeployApproval: (req, res, next) => {
    const approval = req.body?.ownerApproval;
    if (approval?.granted && approval?.scope === 'deploy') {
      next(); // Approved
    } else {
      res.status(403).json({ ok: false, error: 'Unauthorized', truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL });
    }
  }
}));

// Mock deployment receipts
vi.mock('../server/services/deployment-receipts.js', () => ({
  createDeploymentReceipt: vi.fn().mockReturnValue({ id: 'mock-receipt-123' })
}));

describe('Vercel Preview Deploy Route', () => {
  let app;
  let postHandlers = {};

  beforeEach(() => {
    vi.unstubAllEnvs();
    postHandlers = {};
    app = {
      post: (path, ...handlers) => { postHandlers[path] = handlers; }
    };
    registerVercelPreviewDeployRoutes(app, { routeRegistry: { routes: [] } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const invokeRoute = async (method, path, req = {}) => {
    const handlers = postHandlers[path];
    if (!handlers) throw new Error(`No route for POST ${path}`);
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

  it('blocks without owner approval', async () => {
    const res = await invokeRoute('POST', '/api/vercel/preview-deploy', { body: {} });
    expect(res.statusCode).toBe(403);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_OWNER_APPROVAL);
  });

  it('blocks with missing VERCEL_TOKEN', async () => {
    vi.stubEnv('VERCEL_TOKEN', '');
    const req = { body: { ownerApproval: { granted: true, scope: 'deploy' } } };
    const res = await invokeRoute('POST', '/api/vercel/preview-deploy', req);
    expect(res.statusCode).toBe(400);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_CREDENTIALS);
  });

  it('returns PROVIDER_GATED because real API call is not yet wired in this phase', async () => {
    vi.stubEnv('VERCEL_TOKEN', 'token-present');
    const req = { body: { ownerApproval: { granted: true, scope: 'deploy' } } };
    const res = await invokeRoute('POST', '/api/vercel/preview-deploy', req);
    
    // In Phase 13A, we don't have the Vercel Adapter, so it should honestly report PROVIDER_GATED
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(false);
    expect(res.body.truthState).toBe(TRUTH_STATES.PROVIDER_GATED);
    expect(res.body.receiptId).toBe('mock-receipt-123');
  });
});
