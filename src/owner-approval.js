/**
 * Owner Approval Logic
 * Used to verify the human has authorized irreversible actions.
 */

export function createOwnerApprovalEnvelope(data) {
  return {
    granted: data.granted || false,
    actor: data.actor || null,
    scope: data.scope || null,
    receiptId: data.receiptId || null,
    grantedAt: data.grantedAt || null,
  };
}

export function hasExplicitOwnerApproval(envelope, expectedScope) {
  if (!envelope || !envelope.granted) return false;
  if (envelope.actor !== 'studio_owner') return false;
  if (envelope.scope !== expectedScope) return false;
  return true;
}

export function getApprovalBlockReason(scope) {
  return `Missing explicit owner approval for scope: ${scope}`;
}
