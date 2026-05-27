/**
 * PH EVO STUDIO — OWNER APPROVAL CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Client service to manage and validate explicit owner approvals.
 * Pure logic. No default silent approval. No secrets stored.
 */

export const OWNER_APPROVAL_SCOPES = {
  DEPLOY: 'deploy',
  COMMERCE: 'commerce',
  MUTATION: 'mutation',
  SELF_IMPLEMENTATION: 'self_implementation'
};

/**
 * Generates a unique, non-guessable receipt ID for a given scope.
 * Format: OAR-[SCOPE]-[TIMESTAMP]-[RANDOM_HEX]
 * 
 * @param {string} scope - The approval scope.
 * @returns {string} The receipt ID.
 */
export function generateApprovalReceiptId(scope) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  const safeScope = String(scope).toUpperCase().replace(/[^A-Z_]/g, '');
  return `OAR-${safeScope}-${timestamp}-${randomHex}`;
}

/**
 * Creates an owner approval envelope for explicit actions.
 * MUST only be called when triggered by a direct user UI action.
 * 
 * @param {string} scope - Must be one of OWNER_APPROVAL_SCOPES.
 * @param {string} actor - The identifier of the approving actor (e.g., 'studio_owner').
 * @returns {object} The approval envelope.
 */
export function createOwnerApprovalEnvelope(scope, actor = 'studio_owner') {
  if (!Object.values(OWNER_APPROVAL_SCOPES).includes(scope)) {
    throw new Error(`Invalid owner approval scope: ${scope}`);
  }

  return {
    ownerApproval: {
      granted: true,
      grantedAt: new Date().toISOString(),
      actor,
      scope,
      receiptId: generateApprovalReceiptId(scope)
    }
  };
}

/**
 * Validates an owner approval envelope against strict requirements.
 * 
 * @param {object} envelope - The envelope to validate.
 * @param {string} expectedScope - The scope required for the action.
 * @returns {boolean} True if valid, false otherwise.
 * @throws {Error} Detailed error message if validation fails.
 */
export function validateOwnerApprovalEnvelope(envelope, expectedScope) {
  if (!envelope || !envelope.ownerApproval) {
    throw new Error('Missing ownerApproval object in envelope.');
  }

  const { granted, scope, receiptId, grantedAt } = envelope.ownerApproval;

  if (granted !== true) {
    throw new Error('Owner approval was not explicitly granted.');
  }

  if (scope !== expectedScope) {
    throw new Error(`Approval scope mismatch. Expected '${expectedScope}', but got '${scope}'.`);
  }

  if (!receiptId || typeof receiptId !== 'string') {
    throw new Error('Invalid or missing approval receiptId.');
  }

  if (!grantedAt || isNaN(new Date(grantedAt).getTime())) {
    throw new Error('Invalid or missing grantedAt timestamp.');
  }

  return true;
}
