import { describe, it, expect } from 'vitest';
import { BRIDGE_URL, buildBridgeUrl, safeFetchBridge } from '../src/config/bridge-config.js';

describe('bridge-config', () => {
  it('exports a BRIDGE_URL string', () => {
    expect(typeof BRIDGE_URL).toBe('string');
    expect(BRIDGE_URL).toContain('http');
  });

  it('buildBridgeUrl joins paths correctly', () => {
    const url = buildBridgeUrl('/api/status');
    expect(url).toBe(`${BRIDGE_URL}/api/status`);
  });

  it('buildBridgeUrl handles missing leading slash', () => {
    const url = buildBridgeUrl('api/health');
    expect(url).toBe(`${BRIDGE_URL}/api/health`);
  });

  it('buildBridgeUrl handles empty path', () => {
    const url = buildBridgeUrl('');
    expect(url).toBe(`${BRIDGE_URL}/`);
  });

  it('safeFetchBridge returns structured error when bridge is offline', async () => {
    const result = await safeFetchBridge('/nonexistent-route', { timeout: 500 });
    expect(result).toHaveProperty('ok');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('truthState');
    if (!result.ok) {
      expect(result.truthState).toBe('DISCONNECTED');
    }
  });
});
