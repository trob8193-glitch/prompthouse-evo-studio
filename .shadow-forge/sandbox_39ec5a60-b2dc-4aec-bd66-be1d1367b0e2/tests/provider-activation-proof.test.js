import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { buildProviderActivationProof } from '../server/services/provider-activation-proof.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

describe('provider activation proof', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reports credential blockers without live provider calls', () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    vi.stubEnv('VERCEL_TOKEN', '');

    const report = buildProviderActivationProof({ live: false, writeReceipts: false });

    expect(report.truthState).toBe(TRUTH_STATES.PROVIDER_GATED);
    expect(report.blockers).toHaveLength(4);
    expect(report.actions.every((action) => action.status === 'blocked')).toBe(true);
  });

  it('arms configured providers locally without claiming live execution', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai-local');
    vi.stubEnv('GEMINI_API_KEY', 'gemini-local');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_local');
    vi.stubEnv('VERCEL_TOKEN', 'vcp_local');

    const report = buildProviderActivationProof({ live: false, writeReceipts: false });

    expect(report.truthState).toBe(TRUTH_STATES.LOCAL_ONLY);
    expect(report.blockers).toHaveLength(0);
    expect(report.actions.every((action) => action.status === 'armed_local_only')).toBe(true);
  });

  it('requires owner approval before live provider activation proof', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai-local');
    vi.stubEnv('GEMINI_API_KEY', 'gemini-local');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_local');
    vi.stubEnv('VERCEL_TOKEN', 'vcp_local');

    const report = buildProviderActivationProof({ live: true, ownerApproval: { granted: false }, writeReceipts: false });

    expect(report.truthState).toBe(TRUTH_STATES.PROVIDER_GATED);
    expect(report.blockers.map((item) => item.truthState)).toContain(TRUTH_STATES.NEEDS_OWNER_APPROVAL);
  });
});
