import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runVercelPreviewDeploy, validatePreviewDeployInput } from '../server/services/vercel-preview-runner.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 'dpl_test_123', url: 'ph-evo-proof.vercel.app', inspectorUrl: 'https://vercel.com/inspect' })
  })
}));

// Mock vercel-readiness
vi.mock('../server/services/vercel-readiness.js', () => ({
  classifyVercelTokenStatus: vi.fn().mockReturnValue({ configured: true, redactedToken: 'vcp_te...st' })
}));

describe('Vercel Preview Runner', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('blocks without owner approval', async () => {
    const res = await runVercelPreviewDeploy({});
    expect(res.ok).toBe(false);
    expect(res.truthState).toBe(TRUTH_STATES.NEEDS_OWNER_APPROVAL);
  });

  it('blocks without VERCEL_TOKEN', async () => {
    const { classifyVercelTokenStatus } = await import('../server/services/vercel-readiness.js');
    classifyVercelTokenStatus.mockReturnValue({ configured: false, blockedReason: 'Token missing' });
    
    const res = await runVercelPreviewDeploy({ ownerApproval: { granted: true, scope: 'deploy' } });
    expect(res.ok).toBe(false);
    expect(res.blockedReason).toBe('Token missing');
  });

  it('succeeds with mock Vercel response', async () => {
    const { classifyVercelTokenStatus } = await import('../server/services/vercel-readiness.js');
    classifyVercelTokenStatus.mockReturnValue({ configured: true });
    vi.stubEnv('VERCEL_TOKEN', 'vcp_test');

    const res = await runVercelPreviewDeploy({ ownerApproval: { granted: true, scope: 'deploy' } });
    expect(res.ok).toBe(true);
    expect(res.deploymentUrl).toBe('https://ph-evo-proof.vercel.app');
    expect(res.receiptId).toBeDefined();
  });
});
