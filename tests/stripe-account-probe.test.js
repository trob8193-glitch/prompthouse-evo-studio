import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerStripeHealthRoutes } from '../server/routes/stripe-health.routes.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock security gates middleware
vi.mock('../server/middleware/security-gates.js', () => ({
  requireCommerceApproval: (req, res, next) => {
    const scope = req.headers['x-owner-approval-scope'];
    if (scope === 'commerce') {
      next(); // Approved
    } else {
      res.status(403).json({ ok: false, error: 'Unauthorized', truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL });
    }
  }
}));

vi.mock('stripe', () => {
  return {
    default: class StripeMock {
      constructor() {
        this.accounts = {
          retrieve: async () => ({
            id: 'acct_mock', country: 'US', default_currency: 'usd',
            charges_enabled: true, payouts_enabled: true, details_submitted: true
          })
        };
      }
    }
  };
});

describe('Stripe Account Probe Route', () => {
  let app;
  let postHandlers = {};

  beforeEach(() => {
    vi.unstubAllEnvs();
    postHandlers = {};
    app = {
      get: () => {},
      post: (path, ...handlers) => { postHandlers[path] = handlers; }
    };
    registerStripeHealthRoutes(app, {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const invokeRoute = async (path, req = {}) => {
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

  it('missing approval blocks probe', async () => {
    const res = await invokeRoute('/api/stripe/test/account-probe', { headers: {} });
    expect(res.statusCode).toBe(403);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_OWNER_APPROVAL);
  });

  it('missing key blocks probe', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const res = await invokeRoute('/api/stripe/test/account-probe', { headers: { 'x-owner-approval-scope': 'commerce' } });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.truthState).toBe(TRUTH_STATES.NEEDS_CREDENTIALS);
  });

  it('live key blocks probe', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_123');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'false');
    const res = await invokeRoute('/api/stripe/test/account-probe', { headers: { 'x-owner-approval-scope': 'commerce' } });
    
    expect(res.statusCode).toBe(403);
    expect(res.body.truthState).toBe(TRUTH_STATES.BLOCKED);
  });

  it('test key path is allowed and mocks Stripe SDK if missing', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    const res = await invokeRoute('/api/stripe/test/account-probe', { headers: { 'x-owner-approval-scope': 'commerce' } });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.truthState).toBe(TRUTH_STATES.VERIFIED);
    expect(res.body.data.message).toBe('Stripe test account probe successful.');
    expect(res.body.data.account.id).toBe('acct_mock');
  });
});
