/**
 * PH EVO STUDIO — SECURITY CLASSIFIER
 * ═══════════════════════════════════════════════════════════════
 * Classifies route security requirements by HTTP method, path,
 * and body content. Pure functions — no mutation, no side effects.
 */

export const SECURITY_ACTION_TYPES = Object.freeze({
  READ_ONLY: 'READ_ONLY',
  MUTATION: 'MUTATION',
  PROVIDER_ACTION: 'PROVIDER_ACTION',
  DEPLOY_ACTION: 'DEPLOY_ACTION',
  COMMERCE_ACTION: 'COMMERCE_ACTION',
  FILE_WRITE: 'FILE_WRITE',
  CONFIG_WRITE: 'CONFIG_WRITE',
  SELF_IMPLEMENTATION_MUTATION: 'SELF_IMPLEMENTATION_MUTATION',
  OWNER_APPROVAL_REQUIRED: 'OWNER_APPROVAL_REQUIRED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  MASTER_KEY_ALLOWED: 'MASTER_KEY_ALLOWED',
  LOCAL_DEV_ALLOWED: 'LOCAL_DEV_ALLOWED',
  BLOCKED_WITHOUT_CREDENTIALS: 'BLOCKED_WITHOUT_CREDENTIALS',
});

const S = SECURITY_ACTION_TYPES;

/* ── pattern matchers ────────────────────────────────────────── */

const DEPLOY_PATTERNS = [/deploy/, /vercel/];
const COMMERCE_PATTERNS = [/commerce/, /stripe/, /checkout/, /billing/];
const CONFIG_WRITE_PATTERNS = [/config\/keys/, /keys\/create/, /nightforge\/settings/];
const FILE_WRITE_PATTERNS = [/files\/write/, /forge\/save/, /foundry\/generate/];
const SELF_IMPL_PATTERNS = [/self-implementation/, /foundry\/initiate-self-mutation/];
const PROVIDER_PATTERNS = [/chat$/, /evo-lm\/chat/, /evo-lm\/compressed/, /bridge\/invoke/, /v1\/prompts/, /v1\/apps/, /v1\/themes/, /v1\/code/];

function matchesAny(path, patterns) {
  const p = (path || '').toLowerCase();
  return patterns.some((rx) => rx.test(p));
}

/* ── public API ──────────────────────────────────────────────── */

export function isMutationMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes((method || '').toUpperCase());
}

export function isProviderAction(path) {
  return matchesAny(path, PROVIDER_PATTERNS);
}

export function isDeployAction(path) {
  return matchesAny(path, DEPLOY_PATTERNS);
}

export function isCommerceAction(path) {
  return matchesAny(path, COMMERCE_PATTERNS);
}

export function isSelfImplementationMutation(path, body) {
  if (!matchesAny(path, SELF_IMPL_PATTERNS)) return false;
  // verify-only mode (applyFixes falsy) is NOT a self-implementation mutation
  if (body && body.applyFixes === true) return true;
  return false;
}

export function isFileWriteAction(path) {
  return matchesAny(path, FILE_WRITE_PATTERNS);
}

export function isConfigWriteAction(path) {
  return matchesAny(path, CONFIG_WRITE_PATTERNS);
}

/**
 * Classifies a single route and returns its security requirements.
 */
export function classifyRouteSecurity(method, path, metadata = {}) {
  const m = (method || '').toUpperCase();
  const classifications = new Set();

  // Base classification
  if (!isMutationMethod(m)) {
    classifications.add(S.READ_ONLY);
    classifications.add(S.LOCAL_DEV_ALLOWED);
    return { method: m, path, classifications: [...classifications] };
  }

  classifications.add(S.MUTATION);

  if (isDeployAction(path)) {
    classifications.add(S.DEPLOY_ACTION);
    classifications.add(S.OWNER_APPROVAL_REQUIRED);
    classifications.add(S.BLOCKED_WITHOUT_CREDENTIALS);
  }

  if (isCommerceAction(path)) {
    classifications.add(S.COMMERCE_ACTION);
    classifications.add(S.OWNER_APPROVAL_REQUIRED);
    classifications.add(S.BLOCKED_WITHOUT_CREDENTIALS);
  }

  if (isConfigWriteAction(path)) {
    classifications.add(S.CONFIG_WRITE);
    classifications.add(S.AUTH_REQUIRED);
    classifications.add(S.MASTER_KEY_ALLOWED);
  }

  if (isFileWriteAction(path)) {
    classifications.add(S.FILE_WRITE);
    classifications.add(S.AUTH_REQUIRED);
    classifications.add(S.MASTER_KEY_ALLOWED);
  }

  if (isSelfImplementationMutation(path, metadata.body)) {
    classifications.add(S.SELF_IMPLEMENTATION_MUTATION);
    classifications.add(S.OWNER_APPROVAL_REQUIRED);
  }

  if (isProviderAction(path)) {
    classifications.add(S.PROVIDER_ACTION);
    classifications.add(S.BLOCKED_WITHOUT_CREDENTIALS);
  }

  // All mutations at least allow auth or master key
  if (classifications.has(S.MUTATION) && !classifications.has(S.READ_ONLY)) {
    classifications.add(S.AUTH_REQUIRED);
    classifications.add(S.MASTER_KEY_ALLOWED);
    classifications.add(S.LOCAL_DEV_ALLOWED);
  }

  return { method: m, path, classifications: [...classifications] };
}

/**
 * Returns the full security envelope for a route.
 */
export function getRequiredSecurityForRoute(method, path, body) {
  const result = classifyRouteSecurity(method, path, { body });
  const cs = new Set(result.classifications);

  return {
    ...result,
    isReadOnly: cs.has(S.READ_ONLY),
    isMutation: cs.has(S.MUTATION),
    requiresOwnerApproval: cs.has(S.OWNER_APPROVAL_REQUIRED),
    requiresAuth: cs.has(S.AUTH_REQUIRED),
    requiresCredentials: cs.has(S.BLOCKED_WITHOUT_CREDENTIALS),
    approvalScope: cs.has(S.DEPLOY_ACTION)
      ? 'deploy'
      : cs.has(S.COMMERCE_ACTION)
        ? 'commerce'
        : cs.has(S.SELF_IMPLEMENTATION_MUTATION)
          ? 'self_implementation'
          : null,
  };
}
