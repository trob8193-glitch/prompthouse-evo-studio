import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import { 
  classifyStripeCheckoutBrowserReadiness,
  createStripeBrowserRunRecord,
  updateStripeBrowserRunManualStatus,
  listStripeBrowserRunRecords,
  STRIPE_BROWSER_RUN_STATUSES
} from '../server/services/stripe-checkout-browser-run.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    appendFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    default: {
      ...actual.default,
      existsSync: vi.fn(),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      appendFileSync: vi.fn(),
      mkdirSync: vi.fn(),
    }
  };
});

describe('Stripe Checkout Browser Run Service', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('classifyStripeCheckoutBrowserReadiness', () => {
    it('returns NEEDS_CREDENTIALS when key is missing', () => {
      const result = classifyStripeCheckoutBrowserReadiness();
      expect(result.truthState).toBe(TRUTH_STATES.NEEDS_CREDENTIALS);
      expect(result.ok).toBe(false);
    });

    it('returns BLOCKED when sk_live_ is present', () => {
      vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_123');
      const result = classifyStripeCheckoutBrowserReadiness();
      expect(result.truthState).toBe(TRUTH_STATES.BLOCKED);
      expect(result.mode).toBe('LIVE_MODE_BLOCKED');
    });

    it('returns LOCAL_ONLY when sk_test_ is present', () => {
      vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
      const result = classifyStripeCheckoutBrowserReadiness();
      expect(result.truthState).toBe(TRUTH_STATES.LOCAL_ONLY);
      expect(result.mode).toBe('TEST_MODE');
    });
  });

  describe('createStripeBrowserRunRecord', () => {
    it('appends record to file', () => {
      const { appendFileSync } = fs;
      createStripeBrowserRunRecord({ checkoutSessionId: 'cs_123', checkoutUrl: 'http://test' });
      expect(appendFileSync).toHaveBeenCalled();
      const callArgs = appendFileSync.mock.calls[0];
      const record = JSON.parse(callArgs[1]);
      expect(record.checkoutSessionId).toBe('cs_123');
      expect(record.status).toBe(STRIPE_BROWSER_RUN_STATUSES.NOT_STARTED);
    });
  });

  describe('updateStripeBrowserRunManualStatus', () => {
    it('appends update to file', () => {
      const { appendFileSync } = fs;
      updateStripeBrowserRunManualStatus('SBR-123', STRIPE_BROWSER_RUN_STATUSES.TEST_PAYMENT_COMPLETED, 'verified');
      expect(appendFileSync).toHaveBeenCalled();
      const callArgs = appendFileSync.mock.calls[0];
      const update = JSON.parse(callArgs[1]);
      expect(update.id).toBe('SBR-123');
      expect(update.status).toBe(STRIPE_BROWSER_RUN_STATUSES.TEST_PAYMENT_COMPLETED);
    });
  });

  describe('listStripeBrowserRunRecords', () => {
    it('resolves state from multiple entries', () => {
      const { existsSync, readFileSync } = fs;
      existsSync.mockReturnValue(true);
      const lines = [
        JSON.stringify({ id: 'SBR-1', status: 'NOT_STARTED', createdAt: '2026-01-01T00:00:00Z' }),
        JSON.stringify({ id: 'SBR-1', status: 'TEST_PAYMENT_COMPLETED', updatedAt: '2026-01-01T00:05:00Z' })
      ].join('\n');
      readFileSync.mockReturnValue(lines);

      const records = listStripeBrowserRunRecords();
      expect(records.length).toBe(1);
      expect(records[0].id).toBe('SBR-1');
      expect(records[0].status).toBe('TEST_PAYMENT_COMPLETED');
    });
  });
});
