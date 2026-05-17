import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

describe('Stripe Mode Classifier', () => {
  let mod;

  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mod = await import('../server/services/stripe-mode.js');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('missing key returns PROVIDER_GATED', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const status = mod.getStripeSafeStatus();
    expect(status.truthState).toBe(TRUTH_STATES.PROVIDER_GATED);
    expect(status.configured).toBe(false);
  });

  it('sk_test_ returns VERIFIED and safeForLocalTest true', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_1234567890abcdef');
    const status = mod.getStripeSafeStatus();
    expect(status.truthState).toBe(TRUTH_STATES.VERIFIED);
    expect(status.configured).toBe(true);
    expect(status.mode).toBe('test');
    expect(status.safeForLocalTest).toBe(true);
  });

  it('sk_live_ returns BLOCKED during local phase', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_1234567890abcdef');
    vi.stubEnv('DEPLOY_ALLOW_PRODUCTION', 'false'); // Explicitly local
    const status = mod.getStripeSafeStatus();
    expect(status.truthState).toBe(TRUTH_STATES.BLOCKED);
    expect(status.mode).toBe('live');
    expect(status.safeForLocalTest).toBe(false);
    expect(status.blockedReason).toContain('Live keys');
  });

  it('unknown prefix returns BLOCKED', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'some_random_key');
    const status = mod.getStripeSafeStatus();
    expect(status.truthState).toBe(TRUTH_STATES.BLOCKED);
    expect(status.mode).toBe('unknown');
    expect(status.safeForLocalTest).toBe(false);
  });

  it('redactStripeKey never returns raw value', () => {
    const raw = 'sk_test_super_secret_value_9999';
    const redacted = mod.redactStripeKey(raw);
    expect(redacted).toBe('sk_test_...9999');
    expect(redacted).not.toContain('super_secret_value');
  });

  it('assertStripeTestModeOnly throws if live', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_123');
    expect(() => mod.assertStripeTestModeOnly()).toThrow(/Stripe execution BLOCKED/);
  });

  it('assertStripeTestModeOnly passes if test', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    expect(() => mod.assertStripeTestModeOnly()).not.toThrow();
  });
});
