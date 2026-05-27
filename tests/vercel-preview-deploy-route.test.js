import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerVercelPreviewDeployRoutes } from '../server/routes/vercel-preview-deploy.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock owner approval service instead of middleware so the real middleware passes
vi.mock('../server/services/owner-approval-service.js', () => ({
  validateOwnerApproval: (envelope, requiredScope) => {
    if (envelope?.granted && envelope?.scope === requiredScope) {
      return { valid: true };
    }
    return { valid: false, reason: 'Invalid test envelope' };
  }
}));

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 'dpl_123', url: 'ph-evo-proof.vercel.app', inspectorUrl: 'https://vercel.com/inspect' })
  })
}));

// Mock deployment receipts
vi.mock('../server/services/deployment-receipts.js', () => ({
  createDeploymentReceipt: vi.fn().mockReturnValue({ id: 'mock-receipt-123' })
}));

// Mock vercel-preview-runner
vi.mock('../server/services/vercel-preview-runner.js', () => ({
  runVercelPreviewDeploy: vi.fn().mockResolvedValue({
    ok: true,
    truthState: 'VERIFIED',
    deploymentId: 'dpl_123',
    deploymentUrl: 'https://ph-evo-proof.vercel.app',
    receiptId: 'mock-receipt-123'
  })
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
    const { runVercelPreviewDeploy } = await import('../server/services/vercel-preview-runner.js');
    runVercelPreviewDeploy.mockResolvedValueOnce({
      ok: false,
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      blockedReason: 'Token missing',
      receiptId: 'rcpt_123'
    });

    const req = { body: { ownerApproval: { granted: true, scope: 'deploy' } } };
    const res = await invokeRoute('POST', '/api/vercel/preview-deploy', req);
    expect(res.statusCode).toBe(400);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_CREDENTIALS);
  });

  it('returns VERIFIED on successful Vercel API call', async () => {
    vi.stubEnv('VERCEL_TOKEN', 'token-present');
    const req = { body: { ownerApproval: { granted: true, scope: 'deploy' } } };
    const res = await invokeRoute('POST', '/api/vercel/preview-deploy', req);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.truthState).toBe(TRUTH_STATES.VERIFIED);
    expect(res.body.deploymentUrl).toBe('https://ph-evo-proof.vercel.app');
    expect(res.body.receiptId).toBe('mock-receipt-123');
  });
});
