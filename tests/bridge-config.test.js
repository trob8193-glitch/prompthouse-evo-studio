import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildBridgeUrl, safeFetchBridge, BRIDGE_URL } from '../src/config/bridge-config.js';

describe('Bridge Config', () => {
  it('BRIDGE_URL is a string with http protocol', () => {
    expect(typeof BRIDGE_URL).toBe('string');
    expect(BRIDGE_URL).toMatch(/^https?:\/\//);
  });

  it('BRIDGE_URL has a local fallback', () => {
    // In test env, VITE_BRIDGE_URL is not set, so it should fall back
    expect(BRIDGE_URL).toContain('127.0.0.1');
  });

  describe('buildBridgeUrl', () => {
    it('joins paths with leading slash', () => {
      const url = buildBridgeUrl('/api/status');
      expect(url).toBe(`${BRIDGE_URL}/api/status`);
    });

    it('adds leading slash if missing', () => {
      const url = buildBridgeUrl('api/metrics');
      expect(url).toBe(`${BRIDGE_URL}/api/metrics`);
    });

    it('handles empty path', () => {
      const url = buildBridgeUrl('');
      expect(url).toBe(`${BRIDGE_URL}/`);
    });

    it('handles root path', () => {
      const url = buildBridgeUrl('/');
      expect(url).toBe(`${BRIDGE_URL}/`);
    });
  });

  describe('safeFetchBridge', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns structured error when fetch fails', async () => {
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const result = await safeFetchBridge('/api/test');

      expect(result).toEqual({
        ok: false,
        status: null,
        data: null,
        error: 'Network error',
        truthState: 'DISCONNECTED',
      });
    });

    it('returns structured error on timeout', async () => {
      globalThis.fetch = vi.fn(() => {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        return Promise.reject(err);
      });

      const result = await safeFetchBridge('/api/test', { timeout: 100 });

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Request timed out');
      expect(result.truthState).toBe('DISCONNECTED');
    });

    it('returns structured success on ok response', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: { get: (h) => h === 'content-type' ? 'application/json' : null },
          json: () => Promise.resolve({ status: 'healthy', truth_label: 'REAL' }),
        })
      );

      const result = await safeFetchBridge('/status');

      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ status: 'healthy', truth_label: 'REAL' });
      expect(result.truthState).toBe('REAL');
      expect(result.error).toBeNull();
    });

    it('returns structured error on non-ok response', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          headers: { get: (h) => h === 'content-type' ? 'application/json' : null },
          json: () => Promise.resolve({ error: 'Internal Server Error' }),
        })
      );

      const result = await safeFetchBridge('/api/broken');

      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
      expect(result.error).toBe('Internal Server Error');
    });
  });
});
