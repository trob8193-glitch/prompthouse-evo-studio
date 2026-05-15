import { describe, it, expect } from 'vitest';
import {
  createOwnerApprovalEnvelope,
  validateOwnerApprovalEnvelope,
  generateApprovalReceiptId,
  OWNER_APPROVAL_SCOPES
} from '../src/services/owner-approval-client.js';

describe('Owner Approval Client', () => {
  it('creates valid envelope for deploy', () => {
    const envelope = createOwnerApprovalEnvelope(OWNER_APPROVAL_SCOPES.DEPLOY);
    expect(envelope).toBeDefined();
    expect(envelope.ownerApproval).toBeDefined();
    expect(envelope.ownerApproval.granted).toBe(true);
    expect(envelope.ownerApproval.scope).toBe(OWNER_APPROVAL_SCOPES.DEPLOY);
    expect(envelope.ownerApproval.receiptId).toContain('OAR-DEPLOY-');
  });

  it('rejects wrong scope on creation', () => {
    expect(() => createOwnerApprovalEnvelope('invalid_scope')).toThrow(/Invalid owner approval scope/);
  });

  it('validates a correct envelope', () => {
    const envelope = createOwnerApprovalEnvelope(OWNER_APPROVAL_SCOPES.COMMERCE);
    expect(() => validateOwnerApprovalEnvelope(envelope, OWNER_APPROVAL_SCOPES.COMMERCE)).not.toThrow();
  });

  it('rejects envelope with wrong scope on validation', () => {
    const envelope = createOwnerApprovalEnvelope(OWNER_APPROVAL_SCOPES.COMMERCE);
    expect(() => validateOwnerApprovalEnvelope(envelope, OWNER_APPROVAL_SCOPES.DEPLOY)).toThrow(/Approval scope mismatch/);
  });

  it('rejects granted false', () => {
    const envelope = createOwnerApprovalEnvelope(OWNER_APPROVAL_SCOPES.COMMERCE);
    envelope.ownerApproval.granted = false;
    expect(() => validateOwnerApprovalEnvelope(envelope, OWNER_APPROVAL_SCOPES.COMMERCE)).toThrow(/not explicitly granted/);
  });

  it('generates unique receipt IDs', () => {
    const id1 = generateApprovalReceiptId(OWNER_APPROVAL_SCOPES.MUTATION);
    const id2 = generateApprovalReceiptId(OWNER_APPROVAL_SCOPES.MUTATION);
    expect(id1).not.toBe(id2);
  });
});
