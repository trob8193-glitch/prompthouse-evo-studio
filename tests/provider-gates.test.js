import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TRUTH_STATES,
  normalizeTruthState,
  classifyCredentialState,
  classifyProviderAction,
  buildTruthResponse,
} from '../server/services/truth-labels.js';
import {
  REQUIRED_PROVIDER_KEYS,
  getProviderGateStatus,
  requireCredential,
  redactSecret,
} from '../server/services/provider-gates.js';

describe('Provider Gates', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('truth-labels', () => {
    it('exports all required states', () => {
      const required = [
        'BUILT', 'VERIFIED', 'BLOCKED', 'PROVEN', 'LOCAL_ONLY',
        'PROVIDER_GATED', 'NEEDS_CREDENTIALS', 'NEEDS_OWNER_APPROVAL',
        'ERROR', 'UNKNOWN',
      ];
      for (const state of required) {
        expect(TRUTH_STATES[state]).toBe(state);
      }
    });

    it('normalizes invalid values to UNKNOWN', () => {
      expect(normalizeTruthState(null)).toBe('UNKNOWN');
      expect(normalizeTruthState('')).toBe('UNKNOWN');
      expect(normalizeTruthState('banana')).toBe('UNKNOWN');
    });

    it('classifies missing env key as NEEDS_CREDENTIALS', () => {
      delete process.env.NEVER_EXISTS_KEY;
      expect(classifyCredentialState('NEVER_EXISTS_KEY')).toBe('NEEDS_CREDENTIALS');
    });

    it('classifies present env key as BUILT, not PROVEN', () => {
      process.env.TEST_KEY_PRESENT = 'sk-something';
      const state = classifyCredentialState('TEST_KEY_PRESENT');
      expect(state).toBe('BUILT');
      expect(state).not.toBe('PROVEN');
    });

    it('classifies local-only action without required keys', () => {
      const result = classifyProviderAction('localScan', []);
      expect(result.truthState).toBe('LOCAL_ONLY');
      expect(result.missingKeys).toHaveLength(0);
    });

    it('classifies action with missing keys as NEEDS_CREDENTIALS', () => {
      delete process.env.OPENAI_API_KEY;
      const result = classifyProviderAction('chatCompletion', ['OPENAI_API_KEY']);
      expect(result.truthState).toBe('NEEDS_CREDENTIALS');
      expect(result.missingKeys).toContain('OPENAI_API_KEY');
    });

    it('buildTruthResponse wraps payload with truthState', () => {
      const result = buildTruthResponse({ data: 'test', truthState: 'VERIFIED' });
      expect(result.truthState).toBe('VERIFIED');
      expect(result.truthTimestamp).toBeDefined();
      expect(result.data).toBe('test');
    });
  });

  describe('provider-gates', () => {
    it('exports all required provider keys', () => {
      expect(REQUIRED_PROVIDER_KEYS.openai).toBe('OPENAI_API_KEY');
      expect(REQUIRED_PROVIDER_KEYS.gemini).toBe('GEMINI_API_KEY');
      expect(REQUIRED_PROVIDER_KEYS.stripe).toBe('STRIPE_SECRET_KEY');
      expect(REQUIRED_PROVIDER_KEYS.vercel).toBe('VERCEL_TOKEN');
      expect(REQUIRED_PROVIDER_KEYS.auth).toBe('JWT_SECRET');
      expect(REQUIRED_PROVIDER_KEYS.masterKey).toBe('PH_EVO_MASTER_KEY');
    });

    it('redactSecret masks values correctly', () => {
      expect(redactSecret('')).toBeNull();
      expect(redactSecret('short')).toBe('****');
      expect(redactSecret('sk-1234567890abcdef')).toMatch(/^sk-1.*cdef$/);
      expect(redactSecret('sk-1234567890abcdef')).not.toBe('sk-1234567890abcdef');
    });

    it('getProviderGateStatus never returns raw secrets', () => {
      process.env.OPENAI_API_KEY = 'sk-test-1234567890abcdef';
      const gates = getProviderGateStatus();

      expect(gates.openai).toBeDefined();
      expect(gates.openai.configured).toBe(true);
      expect(gates.openai.truthState).toBe('BUILT');
      // Must not contain the actual key
      expect(gates.openai.redacted).not.toBe('sk-test-1234567890abcdef');
      expect(JSON.stringify(gates)).not.toContain('sk-test-1234567890abcdef');
    });

    it('getProviderGateStatus reports missing keys as NEEDS_CREDENTIALS', () => {
      delete process.env.STRIPE_SECRET_KEY;
      const gates = getProviderGateStatus();
      expect(gates.stripe.configured).toBe(false);
      expect(gates.stripe.truthState).toBe('NEEDS_CREDENTIALS');
    });

    it('requireCredential returns ok for present keys', () => {
      process.env.JWT_SECRET = 'my-jwt-secret';
      const result = requireCredential('JWT_SECRET');
      expect(result.ok).toBe(true);
      expect(result.truthState).toBe('BUILT');
    });

    it('requireCredential returns error for missing keys', () => {
      delete process.env.NEVER_EXISTS_KEY;
      const result = requireCredential('NEVER_EXISTS_KEY');
      expect(result.ok).toBe(false);
      expect(result.truthState).toBe('NEEDS_CREDENTIALS');
    });
  });
});
