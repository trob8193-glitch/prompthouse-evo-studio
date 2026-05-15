import { describe, it, expect, vi } from 'vitest';
import { classifyPreviewReceiptTruth, verifyPreviewDeploymentReceipt } from '../server/services/deployment-receipt-verifier.js';
import { TRUTH_STATES } from '../server/services/truth-labels.js';

describe('Deployment Receipt Verifier', () => {
  it('verifies success receipt with URL', () => {
    const receipt = {
      provider: 'vercel',
      action: 'preview_deploy',
      status: 'success',
      deploymentUrl: 'https://test.vercel.app',
      createdAt: '2026-05-15T00:00:00Z',
      requestHash: 'abc'
    };
    const truth = classifyPreviewReceiptTruth(receipt);
    expect(truth).toBe(TRUTH_STATES.VERIFIED);
  });

  it('fails verification if URL/ID missing', () => {
    const receipt = {
      provider: 'vercel',
      action: 'preview_deploy',
      status: 'success',
      createdAt: '2026-05-15T00:00:00Z'
    };
    const truth = classifyPreviewReceiptTruth(receipt);
    expect(truth).toBe(TRUTH_STATES.ERROR);
  });

  it('handles blocked receipts correctly', () => {
    const receipt = {
      status: 'blocked',
      truthState: 'PROVIDER_GATED'
    };
    const truth = classifyPreviewReceiptTruth(receipt);
    expect(truth).toBe('PROVIDER_GATED');
  });
});
