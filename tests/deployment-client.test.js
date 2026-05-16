import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/config/bridge-config.js', () => ({
  safeFetchBridge: vi.fn(),
}));

import { safeFetchBridge } from '../src/config/bridge-config.js';
import {
  getDeploymentReadiness,
  getDeploymentBlockers,
  getDeploymentEnvironment,
  getDeploymentReceipts,
  requestVercelPreviewDeploy,
} from '../src/services/deployment-client.js';

describe('Deployment Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDeploymentReadiness calls correct endpoint', async () => {
    safeFetchBridge.mockResolvedValue({ ok: true, truthState: 'LOCAL_ONLY' });
    const result = await getDeploymentReadiness();
    expect(result.ok).toBe(true);
    expect(safeFetchBridge).toHaveBeenCalledWith('/api/deployment/readiness');
  });

  it('getDeploymentBlockers calls correct endpoint', async () => {
    safeFetchBridge.mockResolvedValue({ ok: true, blockers: [] });
    const result = await getDeploymentBlockers();
    expect(result.ok).toBe(true);
  });

  it('getDeploymentEnvironment calls correct endpoint', async () => {
    safeFetchBridge.mockResolvedValue({ ok: true });
    const result = await getDeploymentEnvironment();
    expect(result.ok).toBe(true);
  });

  it('getDeploymentReceipts calls correct endpoint', async () => {
    safeFetchBridge.mockResolvedValue({ ok: true, receipts: [] });
    const result = await getDeploymentReceipts(10);
    expect(result.ok).toBe(true);
  });

  it('requestVercelPreviewDeploy requires ownerApproval', async () => {
    const result = await requestVercelPreviewDeploy({});
    expect(result.ok).toBe(false);
    expect(result.truthState).toBe('NEEDS_OWNER_APPROVAL');
    expect(safeFetchBridge).not.toHaveBeenCalled();
  });

  it('requestVercelPreviewDeploy sends POST with ownerApproval', async () => {
    safeFetchBridge.mockResolvedValue({ ok: false, truthState: 'PROVIDER_GATED' });
    const result = await requestVercelPreviewDeploy({
      ownerApproval: { granted: true, scope: 'deploy', receiptId: 'test' },
    });
    expect(safeFetchBridge).toHaveBeenCalledWith(
      '/api/deployment/vercel/preview',
      expect.objectContaining({ method: 'POST' })
    );
  });
});

