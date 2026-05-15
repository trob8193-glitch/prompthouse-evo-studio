/**
 * PH EVO STUDIO — OWNER APPROVAL SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Validates owner-approval envelopes for sensitive operations.
 * No silent approval. No default granted.
 */
import { createProviderReceipt } from './provider-receipts.js';
import { TRUTH_STATES } from './truth-labels.js';

const VALID_SCOPES = new Set(['deploy', 'commerce', 'mutation', 'self_implementation']);

/**
 * Validates an owner approval envelope.
 * Returns { valid, error, truthState }.
 */
export function validateOwnerApproval(ownerApproval, scope) {
  if (!ownerApproval || typeof ownerApproval !== 'object') {
    return {
      valid: false,
      error: 'Missing owner approval envelope.',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
    };
  }

  if (ownerApproval.granted !== true) {
    return {
      valid: false,
      error: 'Owner approval not granted.',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
    };
  }

  if (!scope || !VALID_SCOPES.has(scope)) {
    return {
      valid: false,
      error: `Invalid approval scope: "${scope}". Valid scopes: ${[...VALID_SCOPES].join(', ')}`,
      truthState: TRUTH_STATES.BLOCKED,
    };
  }

  if (ownerApproval.scope !== scope) {
    return {
      valid: false,
      error: `Approval scope mismatch. Expected "${scope}", got "${ownerApproval.scope}".`,
      truthState: TRUTH_STATES.BLOCKED,
    };
  }

  if (!ownerApproval.receiptId || typeof ownerApproval.receiptId !== 'string') {
    return {
      valid: false,
      error: 'Missing approval receiptId.',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
    };
  }

  if (!ownerApproval.grantedAt) {
    return {
      valid: false,
      error: 'Missing grantedAt timestamp.',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
    };
  }

  const parsedDate = new Date(ownerApproval.grantedAt);
  if (isNaN(parsedDate.getTime())) {
    return {
      valid: false,
      error: 'Invalid grantedAt date.',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
    };
  }

  return {
    valid: true,
    error: null,
    truthState: TRUTH_STATES.VERIFIED,
  };
}

/**
 * Builds a template approval block for a given scope.
 */
export function buildOwnerApprovalBlock(scope) {
  return {
    granted: false,
    grantedAt: null,
    actor: 'studio_owner',
    scope: scope || 'mutation',
    receiptId: null,
    _instructions: 'Set granted to true, fill in grantedAt and receiptId to approve.',
  };
}

/**
 * Creates a receipt for an approval action.
 */
export function createApprovalReceipt(scope, actor = 'studio_owner') {
  return createProviderReceipt({
    provider: 'local',
    action: `owner_approval:${scope}`,
    status: 'success',
    truthState: TRUTH_STATES.VERIFIED,
    message: `Owner approval granted for scope: ${scope}`,
    metadata: { scope, actor, grantedAt: new Date().toISOString() },
  });
}
