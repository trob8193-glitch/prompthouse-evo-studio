import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classifyStripeCheckoutReadiness, createStripeTestCheckoutSession } from '../server/services/stripe-test-checkout.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock Stripe
vi.mock('stripe', () => {
  class StripeMock {
    constructor() {
      this.checkout = {
        sessions: {
          create: vi.fn().mockResolvedValue({ 
            id: 'cs_test_123', 
            url: 'https://checkout.stripe.com/pay/cs_test_123', 
            mode: 'payment' 
          })
        }
      };
    }
  }
  return { default: StripeMock };
});

describe('Stripe Test Checkout Service', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('missing key blocks readiness', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const readiness = classifyStripeCheckoutReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.truthState).toBe(TRUTH_STATES.NEEDS_CREDENTIALS);
  });

  it('live key blocks readiness', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_123');
    const readiness = classifyStripeCheckoutReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.truthState).toBe(TRUTH_STATES.BLOCKED);
  });

  it('test key allows session creation', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    const result = await createStripeTestCheckoutSession({ amount: 100 });
    expect(result.ok).toBe(true);
    expect(result.id).toBe('cs_test_123');
    expect(result.url).toContain('checkout.stripe.com');
  });
});
