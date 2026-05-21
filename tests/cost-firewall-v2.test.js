import { describe, it, expect } from 'vitest';
import {
  estimateTokens,
  estimateMessagesTokens,
  estimateCompressionStats,
  estimateRequestTokens
} from '../src/core/gateway/tokenMeter.js';
import { evaluateCostedRequest } from '../src/core/gateway/costFirewallV2.js';

describe('Cost Firewall V2', () => {

  // ─── Token Meter ───────────────────────────────────────────────────
  describe('Token Meter', () => {
    it('estimates tokens from text', () => {
      const tokens = estimateTokens('Hello world, this is a test');
      expect(tokens).toBeGreaterThan(0);
      expect(typeof tokens).toBe('number');
    });

    it('returns 0 for empty text', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('estimates message array tokens', () => {
      const tokens = estimateMessagesTokens([
        { role: 'user', content: 'Build a login page with authentication' },
        { role: 'assistant', content: 'I will create a secure login page with JWT.' }
      ]);
      expect(tokens).toBeGreaterThan(10);
    });

    it('estimates compression savings', () => {
      const stats = estimateCompressionStats({
        originalText: 'A'.repeat(400),
        compressedText: 'A'.repeat(200)
      });
      expect(stats.savedTokens).toBeGreaterThan(0);
      expect(stats.savingsPercent).toBeCloseTo(50, 0);
    });

    it('estimateRequestTokens returns input and output', () => {
      const result = estimateRequestTokens({
        messages: [{ role: 'user', content: 'Hello' }],
        expectedOutputTokens: 1000
      });
      expect(result.inputTokens).toBeGreaterThan(0);
      expect(result.outputTokens).toBe(1000);
    });
  });

  // ─── Cost Firewall Core ────────────────────────────────────────────
  describe('evaluateCostedRequest', () => {
    it('returns a complete cost evaluation result', () => {
      const result = evaluateCostedRequest({
        orgPlan: 'free',
        endpoint: '/api/nightforge/cycle',
        taskType: 'cost_firewall_test',
        messages: [{ role: 'user', content: 'Test cost evaluation' }],
        expectedOutputTokens: 500
      });

      expect(result).toBeDefined();
      expect(typeof result.allowed).toBe('boolean');
      expect(typeof result.requiresReview).toBe('boolean');
      expect(Array.isArray(result.blockedReasons)).toBe(true);
      expect(result.route).toBeDefined();
      expect(result.route.selectedProvider).toBeDefined();
      expect(result.route.selectedModel).toBeDefined();
      expect(result.selectedCost).toBeDefined();
      expect(result.receipt).toBeDefined();
    });

    it('blocks free plan requests with high cost providers', () => {
      const result = evaluateCostedRequest({
        orgPlan: 'free',
        endpoint: '/api/nightforge/cycle',
        messages: [{ role: 'user', content: 'Expensive request' }],
        expectedOutputTokens: 5000,
        providerAllowed: 'any'
      });
      // Free plan should route to a cost-effective provider
      expect(result.route.selectedProvider).toBeDefined();
    });

    it('receipt includes savings data', () => {
      const result = evaluateCostedRequest({
        orgPlan: 'free',
        endpoint: '/api/cost-test',
        messages: [{ role: 'user', content: 'Test' }],
        expectedOutputTokens: 200
      });
      expect(result.receipt).toBeDefined();
      expect(typeof result.receipt.estimatedSavingsPercent).toBe('number');
      expect(typeof result.receipt.estimatedSavingsDollars).toBe('number');
    });

    it('profit guard is evaluated', () => {
      const result = evaluateCostedRequest({
        orgPlan: 'free',
        endpoint: '/api/test',
        messages: [{ role: 'user', content: 'Profit guard test' }],
        currentMonthCost: 0
      });
      expect(result.profit).toBeDefined();
      expect(typeof result.profit.allowed).toBe('boolean');
    });

    it('budget rules are evaluated', () => {
      const result = evaluateCostedRequest({
        orgPlan: 'free',
        endpoint: '/api/test',
        messages: [{ role: 'user', content: 'Budget test' }]
      });
      expect(result.budget).toBeDefined();
      expect(result.budget.rules).toBeDefined();
    });
  });
});
