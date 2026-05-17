import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerStripeTestCheckoutRoutes } from '../server/routes/stripe-test-checkout.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock security gates middleware
vi.mock('../server/middleware/security-gates.js', () => ({
  requireCommerceApproval: (req, res, next) => {
    const approval = req.body?.ownerApproval;
    if (approval?.granted && approval?.scope === 'commerce') {
      next(); // Approved
    } else {
      res.status(403).json({ ok: false, error: 'Unauthorized', truthState: 'NEEDS_OWNER_APPROVAL' });
    }
  }
}));

// Mock stripe service
vi.mock('../server/services/stripe-test-checkout.js', () => {
  return {
    classifyStripeCheckoutReadiness: vi.fn().mockReturnValue({ ready: true, truthState: 'VERIFIED', mode: 'test' }),
    createStripeTestCheckoutSession: vi.fn().mockResolvedValue({ ok: true, id: 'cs_test_123', url: 'https://checkout.stripe.com/test' })
  };
});

describe('Stripe Test Checkout Routes', () => {
  let app;
  let getHandlers = {};
  let postHandlers = {};

  beforeEach(() => {
    getHandlers = {};
    postHandlers = {};
    app = {
      get: (path, ...handlers) => { getHandlers[path] = handlers; },
      post: (path, ...handlers) => { postHandlers[path] = handlers; }
    };
    registerStripeTestCheckoutRoutes(app, { routeRegistry: { routes: [] } });
  });

  const invokeRoute = async (handlers, req = {}) => {
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

  it('GET /api/stripe/test-checkout/readiness returns status', async () => {
    const res = await invokeRoute(getHandlers['/api/stripe/test-checkout/readiness']);
    expect(res.statusCode).toBe(200);
    expect(res.body.truthState).toBe(TRUTH_STATES.VERIFIED);
  });

  it('POST /api/stripe/test-checkout/session blocks without approval', async () => {
    const res = await invokeRoute(postHandlers['/api/stripe/test-checkout/session'], { body: {} });
    expect(res.statusCode).toBe(403);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_OWNER_APPROVAL);
  });
});
