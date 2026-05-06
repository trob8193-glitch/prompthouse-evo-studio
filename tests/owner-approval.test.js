import { describe, expect, it } from 'vitest';
import {
  createOwnerApprovalEnvelope,
  getApprovalBlockReason,
  hasExplicitOwnerApproval,
} from '../src/owner-approval.js';

describe('owner approval envelope', () => {
  it('creates a complete deploy approval envelope', () => {
    const approval = createOwnerApprovalEnvelope({
      granted: true,
      actor: 'studio_owner',
      scope: 'deploy',
      receiptId: 'deploy_receipt_001',
      grantedAt: '2026-05-03T15:44:00.000Z',
    });

    expect(approval.granted).toBe(true);
    expect(hasExplicitOwnerApproval(approval, 'deploy')).toBe(true);
  });

  it('rejects incomplete or wrong-scope approval', () => {
    const incomplete = createOwnerApprovalEnvelope({});
    const wrongScope = createOwnerApprovalEnvelope({
      granted: true,
      actor: 'studio_owner',
      scope: 'commerce',
      receiptId: 'commerce_receipt_001',
      grantedAt: '2026-05-03T15:44:00.000Z',
    });

    expect(hasExplicitOwnerApproval(incomplete, 'deploy')).toBe(false);
    expect(hasExplicitOwnerApproval(wrongScope, 'deploy')).toBe(false);
    expect(getApprovalBlockReason('deploy')).toContain('deploy');
  });
});
