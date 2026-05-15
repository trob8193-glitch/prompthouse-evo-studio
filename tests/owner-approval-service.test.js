import { describe, it, expect } from 'vitest';
import {
  validateOwnerApproval,
  buildOwnerApprovalBlock,
  createApprovalReceipt,
} from '../server/services/owner-approval-service.js';

describe('Owner Approval Service', () => {
  const validApproval = {
    granted: true,
    grantedAt: new Date().toISOString(),
    actor: 'studio_owner',
    scope: 'deploy',
    receiptId: 'rcpt_test_123',
  };

  describe('validateOwnerApproval', () => {
    it('accepts valid approval envelope', () => {
      const result = validateOwnerApproval(validApproval, 'deploy');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
      expect(result.truthState).toBe('VERIFIED');
    });

    it('rejects missing approval', () => {
      const result = validateOwnerApproval(null, 'deploy');
      expect(result.valid).toBe(false);
      expect(result.truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('rejects granted: false', () => {
      const result = validateOwnerApproval({ ...validApproval, granted: false }, 'deploy');
      expect(result.valid).toBe(false);
      expect(result.truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('rejects scope mismatch', () => {
      const result = validateOwnerApproval({ ...validApproval, scope: 'commerce' }, 'deploy');
      expect(result.valid).toBe(false);
      expect(result.truthState).toBe('BLOCKED');
    });

    it('rejects invalid scope', () => {
      const result = validateOwnerApproval(validApproval, 'invalid_scope');
      expect(result.valid).toBe(false);
      expect(result.truthState).toBe('BLOCKED');
    });

    it('rejects missing receiptId', () => {
      const result = validateOwnerApproval({ ...validApproval, receiptId: null }, 'deploy');
      expect(result.valid).toBe(false);
      expect(result.truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('rejects missing grantedAt', () => {
      const result = validateOwnerApproval({ ...validApproval, grantedAt: null }, 'deploy');
      expect(result.valid).toBe(false);
      expect(result.truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('rejects invalid grantedAt date', () => {
      const result = validateOwnerApproval({ ...validApproval, grantedAt: 'not-a-date' }, 'deploy');
      expect(result.valid).toBe(false);
      expect(result.truthState).toBe('NEEDS_OWNER_APPROVAL');
    });

    it('has no default granted true', () => {
      const result = validateOwnerApproval({}, 'deploy');
      expect(result.valid).toBe(false);
    });

    it('validates all valid scopes', () => {
      const scopes = ['deploy', 'commerce', 'mutation', 'self_implementation'];
      for (const scope of scopes) {
        const approval = { ...validApproval, scope };
        const result = validateOwnerApproval(approval, scope);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('buildOwnerApprovalBlock', () => {
    it('builds a template with granted: false', () => {
      const block = buildOwnerApprovalBlock('deploy');
      expect(block.granted).toBe(false);
      expect(block.scope).toBe('deploy');
      expect(block.actor).toBe('studio_owner');
      expect(block.receiptId).toBeNull();
    });
  });

  describe('createApprovalReceipt', () => {
    it('creates a receipt for approval', () => {
      const receipt = createApprovalReceipt('deploy', 'studio_owner');
      expect(receipt.id).toMatch(/^rcpt_/);
      expect(receipt.action).toContain('owner_approval');
      expect(receipt.action).toContain('deploy');
      expect(receipt.truthState).toBe('VERIFIED');
    });
  });
});
