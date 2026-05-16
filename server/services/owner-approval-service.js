/**
 * PH EVO STUDIO — Owner Approval Service
 */

const VALID_SCOPES = ['deploy', 'commerce', 'mutation', 'self_implementation'];

export function validateOwnerApproval(approval, requiredScope) {
  if (!VALID_SCOPES.includes(requiredScope)) {
    return { valid: false, error: `Invalid scope: ${requiredScope}`, truthState: 'BLOCKED' };
  }

  if (!approval || typeof approval !== 'object') {
    return { valid: false, error: 'Missing approval', truthState: 'NEEDS_OWNER_APPROVAL' };
  }

  if (approval.granted !== true) {
    return { valid: false, error: 'Approval not granted', truthState: 'NEEDS_OWNER_APPROVAL' };
  }

  if (!approval.grantedAt || isNaN(new Date(approval.grantedAt).getTime())) {
    return { valid: false, error: 'Invalid grantedAt timestamp', truthState: 'NEEDS_OWNER_APPROVAL' };
  }

  if (!approval.receiptId) {
    return { valid: false, error: 'Missing receiptId', truthState: 'NEEDS_OWNER_APPROVAL' };
  }

  if (approval.scope !== requiredScope) {
    return { valid: false, error: `Scope mismatch: expected ${requiredScope}, got ${approval.scope}`, truthState: 'BLOCKED' };
  }

  return { valid: true, error: null, truthState: 'VERIFIED' };
}

export function buildOwnerApprovalBlock(scope) {
  return {
    granted: false,
    grantedAt: null,
    actor: 'studio_owner',
    scope,
    receiptId: null,
  };
}

export function createApprovalReceipt(scope, actor = 'studio_owner') {
  return {
    id: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    action: `owner_approval:${scope}`,
    actor,
    truthState: 'VERIFIED',
    createdAt: new Date().toISOString(),
  };
}
