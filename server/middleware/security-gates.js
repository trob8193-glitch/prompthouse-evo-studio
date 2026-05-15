/**
 * PH EVO STUDIO — SECURITY GATE MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════
 * Express-compatible middleware for mutation, deploy, commerce,
 * self-implementation, config-write, file-write, and provider
 * credential gates.
 *
 * DOES NOT replace existing auth middleware — wraps and extends.
 */
import { validateOwnerApproval } from '../services/owner-approval-service.js';
import { requireCredential, redactSecret } from '../services/provider-gates.js';
import { createProviderReceipt } from '../services/provider-receipts.js';
import { TRUTH_STATES } from '../services/truth-labels.js';
import {
  classifyRouteSecurity,
  isDeployAction,
  isCommerceAction,
  isSelfImplementationMutation,
  SECURITY_ACTION_TYPES as S,
} from '../services/security-classifier.js';

/* ── Shared block response builder ───────────────────────────── */

export function buildSecurityBlockResponse(truthState, reason, required = {}) {
  return {
    ok: false,
    blocked: true,
    truthState,
    reason,
    required,
  };
}

/* ── Individual gate middleware factories ─────────────────────── */

/**
 * Requires owner approval for deploy actions.
 * Integrates with Phase 3 owner-approval-service.
 */
export function requireDeployApproval(req, res, next) {
  const approval = req.body?.ownerApproval;
  const result = validateOwnerApproval(approval, 'deploy');
  if (!result.valid) {
    try { createProviderReceipt({
      provider: 'vercel',
      action: 'deploy_blocked',
      status: 'blocked',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      message: result.error,
    }); } catch (_) { /* receipt write is best-effort */ }
    return res.status(403).json(buildSecurityBlockResponse(
      TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      result.error,
      { scope: 'deploy', ownerApproval: true }
    ));
  }
  return next();
}

/**
 * Requires owner approval for commerce actions.
 */
export function requireCommerceApproval(req, res, next) {
  const approval = req.body?.ownerApproval;
  const result = validateOwnerApproval(approval, 'commerce');
  if (!result.valid) {
    try { createProviderReceipt({
      provider: 'stripe',
      action: 'commerce_blocked',
      status: 'blocked',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      message: result.error,
    }); } catch (_) { /* receipt write is best-effort */ }
    return res.status(403).json(buildSecurityBlockResponse(
      TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      result.error,
      { scope: 'commerce', ownerApproval: true }
    ));
  }
  return next();
}

/**
 * Requires owner approval for self-implementation mutations
 * (applyFixes === true). Verification-only mode passes through.
 */
export function requireSelfImplementationApproval(req, res, next) {
  const { applyFixes } = req.body || {};
  // Verification-only mode is allowed
  if (!applyFixes) return next();

  // Check for master key as alternative
  const headerKey = String(req.headers['x-master-key'] || '');
  const configured = String(process.env.PH_EVO_MASTER_KEY || '');
  if (configured && headerKey && headerKey === configured) return next();

  // Require owner approval
  const approval = req.body?.ownerApproval;
  const result = validateOwnerApproval(approval, 'self_implementation');
  if (!result.valid) {
    return res.status(403).json(buildSecurityBlockResponse(
      TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      result.error || 'Self-implementation mutation requires owner approval or master key.',
      { scope: 'self_implementation', ownerApproval: true, masterKeyAllowed: true }
    ));
  }
  return next();
}

/**
 * Requires provider credentials for a specific env key.
 * Returns NEEDS_CREDENTIALS with redacted info if missing.
 */
export function requireProviderCredentials(envKey, providerName) {
  return (req, res, next) => {
    const check = requireCredential(envKey);
    if (!check.ok) {
      try { createProviderReceipt({
        provider: providerName || 'unknown',
        action: `credential_check:${envKey}`,
        status: 'blocked',
        truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
        message: check.error,
      }); } catch (_) { /* receipt write is best-effort */ }
      return res.status(403).json(buildSecurityBlockResponse(
        TRUTH_STATES.NEEDS_CREDENTIALS,
        check.error,
        { envKey, configured: false }
      ));
    }
    return next();
  };
}

/**
 * Requires auth or master key for config writes.
 * Wraps the existing logic pattern.
 */
export function requireConfigWriteAuth(req, res, next) {
  // Check master key first
  const headerKey = String(req.headers['x-master-key'] || '');
  const configured = String(process.env.PH_EVO_MASTER_KEY || '');
  if (configured && headerKey && headerKey === configured) return next();

  // Check bearer token
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token) {
    return res.status(401).json(buildSecurityBlockResponse(
      TRUTH_STATES.BLOCKED,
      'Config write requires auth token or master key.',
      { authRequired: true, masterKeyAllowed: true }
    ));
  }
  return next();
}

/**
 * Requires auth or master key for file writes.
 * Same pattern as config write.
 */
export function requireFileWriteAuth(req, res, next) {
  return requireConfigWriteAuth(req, res, next);
}

/**
 * Requires auth for mutation routes (generic).
 * Passes if auth mutations not enforced.
 */
export function requireMutationAuth(req, res, next) {
  const requireAuth = process.env.REQUIRE_AUTH_MUTATIONS !== 'false';
  if (!requireAuth) return next();

  const headerKey = String(req.headers['x-master-key'] || '');
  const configured = String(process.env.PH_EVO_MASTER_KEY || '');
  if (configured && headerKey && headerKey === configured) return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token) {
    return res.status(401).json(buildSecurityBlockResponse(
      TRUTH_STATES.BLOCKED,
      'Mutation requires auth token or master key.',
      { authRequired: true, masterKeyAllowed: true }
    ));
  }
  return next();
}

/**
 * Dynamic security gate that classifies the route and applies
 * appropriate checks. Can be used as a catch-all middleware.
 */
export function securityGateForRoute(req, res, next) {
  const result = classifyRouteSecurity(req.method, req.path, { body: req.body });
  const cs = new Set(result.classifications);

  // Read-only routes always pass
  if (cs.has(S.READ_ONLY)) return next();

  // Attach classification for downstream use
  req._securityClassification = result;

  return next();
}
