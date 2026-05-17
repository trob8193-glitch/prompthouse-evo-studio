import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import {
  createProviderReceipt,
  listProviderReceipts,
  hashPayload,
  receiptFilePath,
} from '../server/services/provider-receipts.js';

describe('Provider Receipts', () => {
  // Use a test-specific cleanup strategy
  const createdReceipts = [];

  afterEach(() => {
    // Clean up test receipts file if it was created by tests
    // We don't delete on setup to avoid race conditions
  });

  describe('hashPayload', () => {
    it('returns null for null/undefined', () => {
      expect(hashPayload(null)).toBeNull();
      expect(hashPayload(undefined)).toBeNull();
    });

    it('hashes string payloads deterministically', () => {
      const hash1 = hashPayload('test-payload');
      const hash2 = hashPayload('test-payload');
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBe(16);
    });

    it('hashes object payloads', () => {
      const hash = hashPayload({ key: 'value', nested: { a: 1 } });
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(16);
    });

    it('different payloads produce different hashes', () => {
      const hash1 = hashPayload('payload-a');
      const hash2 = hashPayload('payload-b');
      expect(hash1).not.toBe(hash2);
    });

    it('never exposes the raw payload in the hash', () => {
      const apiKey = 'sk-secret-1234567890';
      const hash = hashPayload(apiKey);
      expect(hash).not.toContain('sk-secret');
      expect(hash).not.toContain('1234567890');
    });
  });

  describe('createProviderReceipt', () => {
    it('creates a receipt with required fields', () => {
      const receipt = createProviderReceipt({
        provider: 'openai',
        action: 'chatCompletion',
        status: 'blocked',
        truthState: 'NEEDS_CREDENTIALS',
        message: 'Missing OPENAI_API_KEY',
      });

      expect(receipt.id).toMatch(/^rcpt_/);
      expect(receipt.provider).toBe('openai');
      expect(receipt.action).toBe('chatCompletion');
      expect(receipt.status).toBe('blocked');
      expect(receipt.truthState).toBe('NEEDS_CREDENTIALS');
      expect(receipt.createdAt).toBeDefined();
      expect(new Date(receipt.createdAt).getTime()).not.toBeNaN();
    });

    it('hashes request and response payloads', () => {
      const receipt = createProviderReceipt({
        provider: 'stripe',
        action: 'createCustomer',
        status: 'success',
        truthState: 'PROVEN',
        requestPayload: { email: 'test@example.com' },
        responsePayload: { id: 'cus_123' },
      });

      expect(receipt.requestHash).toBeDefined();
      expect(receipt.responseHash).toBeDefined();
      expect(receipt.requestHash).not.toContain('test@example.com');
      expect(receipt.responseHash).not.toContain('cus_123');
    });

    it('writes receipts to JSONL file', () => {
      createProviderReceipt({
        provider: 'local',
        action: 'test_write',
        status: 'local_only',
        truthState: 'LOCAL_ONLY',
      });

      expect(existsSync(receiptFilePath)).toBe(true);
      const content = readFileSync(receiptFilePath, 'utf8');
      expect(content).toContain('test_write');
    });

    it('blocked receipt has blocked status', () => {
      const receipt = createProviderReceipt({
        provider: 'vercel',
        action: 'deploy',
        status: 'blocked',
        truthState: 'NEEDS_CREDENTIALS',
        message: 'VERCEL_TOKEN not configured',
      });

      expect(receipt.status).toBe('blocked');
      expect(receipt.truthState).toBe('NEEDS_CREDENTIALS');
    });
  });

  describe('listProviderReceipts', () => {
    it('returns an array', () => {
      const receipts = listProviderReceipts();
      expect(Array.isArray(receipts)).toBe(true);
    });

    it('respects limit parameter', () => {
      // Create a few receipts
      for (let i = 0; i < 5; i++) {
        createProviderReceipt({
          provider: 'local',
          action: `limit_test_${i}`,
          status: 'local_only',
          truthState: 'LOCAL_ONLY',
        });
      }

      const receipts = listProviderReceipts(3);
      expect(receipts.length).toBeLessThanOrEqual(3);
    });

    it('returns most recent receipts first', () => {
      const r1 = createProviderReceipt({
        provider: 'local',
        action: 'order_test_first',
        status: 'local_only',
        truthState: 'LOCAL_ONLY',
      });

      const r2 = createProviderReceipt({
        provider: 'local',
        action: 'order_test_second',
        status: 'local_only',
        truthState: 'LOCAL_ONLY',
      });

      const receipts = listProviderReceipts(2);
      // Most recent should be first
      expect(receipts[0].action).toBe('order_test_second');
    });
  });
});
