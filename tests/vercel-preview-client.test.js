import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestVercelPreviewDeploy, getLatestPreviewDeploymentReceipt } from '../src/services/vercel-preview-client.js';

vi.mock('../src/config/bridge-config.js', () => ({
  safeFetchBridge: vi.fn()
}));

describe('Vercel Preview Client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('requestVercelPreviewDeploy requires ownerApproval', async () => {
    const res = await requestVercelPreviewDeploy(null);
    expect(res.ok).toBe(false);
    expect(res.truthState).toBe('NEEDS_OWNER_APPROVAL');
  });

  it('getLatestPreviewDeploymentReceipt calls bridge', async () => {
    const { safeFetchBridge } = await import('../src/config/bridge-config.js');
    safeFetchBridge.mockResolvedValue({ ok: true, data: { id: 'DR-123' } });

    const res = await getLatestPreviewDeploymentReceipt();
    expect(res.ok).toBe(true);
    expect(safeFetchBridge).toHaveBeenCalledWith('/api/deployment/preview/latest');
  });
});
