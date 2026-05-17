/**
 * PH EVO STUDIO — Security Gates Middleware
 * Express middleware for owner-approval, credential, and config write gates.
 */

import { TRUTH_STATES } from '../services/truth-labels.js';

/**
 * Builds a structured security block response.
 */
export function buildSecurityBlockResponse(truthState, reason, required = {}) {
  return {
    ok: false,
    blocked: true,
    truthState,
    reason,
    required,
    timestamp: new Date().toISOString(),
  };
}

function hasValidOwnerApproval(body, scope) {
  const approval = body?.ownerApproval;
  if (!approval) return false;
  return approval.granted === true;
}

/**
 * Requires owner approval for deploy actions.
 */
export function requireDeployApproval(req, res, next) {
  if (hasValidOwnerApproval(req.body, 'deploy')) return next();
  return res.status(403).json(
    buildSecurityBlockResponse(TRUTH_STATES.NEEDS_OWNER_APPROVAL, 'Deploy requires owner approval', { scope: 'deploy' })
  );
}

export function requireProviderProbeApproval(req, res, next) {
  const scope = req.headers['x-owner-approval-scope'];
  if (scope === 'provider_probe') return next();
  return res.status(403).json(
    buildSecurityBlockResponse(TRUTH_STATES.NEEDS_OWNER_APPROVAL, 'Provider probe requires owner approval', { scope: 'provider_probe' })
  );
}

/**
 * Requires owner approval for commerce actions.
 */
export function requireCommerceApproval(req, res, next) {
  if (hasValidOwnerApproval(req.body, 'commerce')) return next();
  return res.status(403).json(
    buildSecurityBlockResponse(TRUTH_STATES.NEEDS_OWNER_APPROVAL, 'Commerce requires owner approval', { scope: 'commerce' })
  );
}

/**
 * Requires owner approval for self-implementation mutations.
 * Verification-only mode (applyFixes=false) is allowed without approval.
 */
export function requireSelfImplementationApproval(req, res, next) {
  const { applyFixes } = req.body || {};
  if (!applyFixes) return next();

  // Check master key
  const masterKey = process.env.PH_EVO_MASTER_KEY;
  if (masterKey && req.headers['x-master-key'] === masterKey) return next();

  // Check owner approval
  if (hasValidOwnerApproval(req.body, 'self_implementation')) return next();

  return res.status(403).json(
    buildSecurityBlockResponse(TRUTH_STATES.NEEDS_OWNER_APPROVAL, 'Self-implementation mutation requires owner approval or master key', { scope: 'self_implementation' })
  );
}

/**
 * Returns a middleware that blocks if the specified env credential is missing.
 */
export function requireProviderCredentials(envKey, providerName) {
  return (req, res, next) => {
    const val = process.env[envKey];
    if (val && val.trim() !== '') return next();
    return res.status(403).json(
      buildSecurityBlockResponse(TRUTH_STATES.NEEDS_CREDENTIALS, `${providerName} credential not configured`, { envKey, provider: providerName })
    );
  };
}

/**
 * Requires auth token or master key for config write operations.
 */
export function requireConfigWriteAuth(req, res, next) {
  // Bearer token
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) return next();

  // Master key
  const masterKey = process.env.PH_EVO_MASTER_KEY;
  if (masterKey && req.headers['x-master-key'] === masterKey) return next();

  return res.status(401).json(
    buildSecurityBlockResponse(TRUTH_STATES.BLOCKED, 'Config write requires authentication or master key', { scope: 'config_write' })
  );
}
