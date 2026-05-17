import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerStripeCheckoutBrowserRunRoutes } from '../server/routes/stripe-checkout-browser-run.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock security middleware
vi.mock('../server/middleware/security-gates.js', () => ({
  requireCommerceApproval: (req, res, next) => {
    if (req.body?.ownerApproval?.granted) return next();
    return res.status(403).json({ ok: false, truthState: 'NEEDS_OWNER_APPROVAL' });
  }
}));

// Mock service
vi.mock('../server/services/stripe-checkout-browser-run.js', () => ({
  getStripeCheckoutBrowserRunStatus: vi.fn().mockReturnValue({ ok: true, truthState: 'LOCAL_ONLY' }),
  listStripeBrowserRunRecords: vi.fn().mockReturnValue([]),
  createStripeBrowserRunRecord: vi.fn().mockReturnValue({ id: 'SBR-MOCK' }),
  updateStripeBrowserRunManualStatus: vi.fn().mockReturnValue({ id: 'SBR-MOCK', status: 'VERIFIED' }),
  verifyStripeCheckoutSessionForBrowserRun: vi.fn().mockReturnValue({ valid: true }),
  buildStripeBrowserRunBlockedResponse: vi.fn().mockImplementation((r) => ({ ok: false, reason: r })),
  STRIPE_BROWSER_RUN_STATUSES: { TEST_PAYMENT_COMPLETED: 'TEST_PAYMENT_COMPLETED' }
}));

describe('Stripe Checkout Browser Run Routes', () => {
  let app;
  let routes = { GET: {}, POST: {} };

  beforeEach(() => {
    routes = { GET: {}, POST: {} };
    app = {
      get: (path, handler) => { routes.GET[path] = handler; },
      post: (path, ...handlers) => { routes.POST[path] = handlers; }
    };
    registerStripeCheckoutBrowserRunRoutes(app);
  });

  const invokeGet = async (path) => {
    const res = { json: vi.fn() };
    await routes.GET[path]({}, res);
    return res.json.mock.calls[0][0];
  };

  const invokePost = async (path, body) => {
    const handlers = routes.POST[path];
    const req = { body };
    const res = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };
    for (const h of handlers) {
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      await h(req, res, next);
      if (!nextCalled && res.body) break;
    }
    return res;
  };

  it('GET /status returns status', async () => {
    const status = await invokeGet('/api/stripe/test-checkout/browser-run/status');
    expect(status.ok).toBe(true);
  });

  it('POST /record blocks without approval', async () => {
    const res = await invokePost('/api/stripe/test-checkout/browser-run/record', {});
    expect(res.statusCode).toBe(403);
  });

  it('POST /record passes with approval', async () => {
    const res = await invokePost('/api/stripe/test-checkout/browser-run/record', { 
      ownerApproval: { granted: true },
      checkoutSessionId: 'cs_1',
      checkoutUrl: 'url'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
