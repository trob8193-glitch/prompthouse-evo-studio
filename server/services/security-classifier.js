/**
 * PH EVO STUDIO — Security Classifier Service
 * Classifies routes by security requirements: mutation, deploy, commerce, config, file write, provider.
 */

export const SECURITY_ACTION_TYPES = {
  READ_ONLY: 'READ_ONLY',
  MUTATION: 'MUTATION',
  DEPLOY_ACTION: 'DEPLOY_ACTION',
  COMMERCE_ACTION: 'COMMERCE_ACTION',
  CONFIG_WRITE: 'CONFIG_WRITE',
  FILE_WRITE: 'FILE_WRITE',
  PROVIDER_ACTION: 'PROVIDER_ACTION',
  SELF_IMPLEMENTATION_MUTATION: 'SELF_IMPLEMENTATION_MUTATION',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  OWNER_APPROVAL_REQUIRED: 'OWNER_APPROVAL_REQUIRED',
};

export function isMutationMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method?.toUpperCase());
}

export function isDeployAction(path) {
  return /\/(deploy|vercel-deploy|hosting)/i.test(path);
}

export function isCommerceAction(path) {
  return /\/(commerce|stripe|billing|checkout)/i.test(path);
}

export function isConfigWriteAction(path) {
  return /\/(config|keys)(\/|$)/i.test(path);
}

export function isFileWriteAction(path) {
  return /\/(files\/(write|save)|forge\/(save|write))/i.test(path);
}

export function isProviderAction(path) {
  return /\/(chat|evo-lm\/chat|agents\/invoke|ai\/)/i.test(path);
}

export function isSelfImplementationMutation(path, body = {}) {
  if (!/\/self-implementation\//i.test(path)) return false;
  return body?.applyFixes === true;
}

/**
 * Classifies a route by method, path, and optional request context.
 * Returns { classifications: string[] }.
 */
export function classifyRouteSecurity(method, path, context = {}) {
  const classifications = [];
  const body = context?.body || {};

  if (!isMutationMethod(method)) {
    classifications.push('READ_ONLY');
    return { classifications };
  }

  classifications.push('MUTATION');

  if (isDeployAction(path)) {
    classifications.push('DEPLOY_ACTION');
    classifications.push('OWNER_APPROVAL_REQUIRED');
  }

  if (isCommerceAction(path)) {
    classifications.push('COMMERCE_ACTION');
    classifications.push('OWNER_APPROVAL_REQUIRED');
  }

  if (isConfigWriteAction(path)) {
    classifications.push('CONFIG_WRITE');
    classifications.push('AUTH_REQUIRED');
  }

  if (isFileWriteAction(path)) {
    classifications.push('FILE_WRITE');
    classifications.push('AUTH_REQUIRED');
  }

  if (isProviderAction(path)) {
    classifications.push('PROVIDER_ACTION');
  }

  if (isSelfImplementationMutation(path, body)) {
    classifications.push('SELF_IMPLEMENTATION_MUTATION');
    classifications.push('OWNER_APPROVAL_REQUIRED');
  }

  return { classifications };
}

/**
 * Returns the full security envelope for a route.
 */
export function getRequiredSecurityForRoute(method, path, context = {}) {
  const { classifications } = classifyRouteSecurity(method, path, context);
  const isReadOnly = classifications.includes('READ_ONLY');
  const isMutation = classifications.includes('MUTATION');
  const requiresOwnerApproval = classifications.includes('OWNER_APPROVAL_REQUIRED');

  let approvalScope = null;
  if (classifications.includes('DEPLOY_ACTION')) approvalScope = 'deploy';
  else if (classifications.includes('COMMERCE_ACTION')) approvalScope = 'commerce';
  else if (classifications.includes('SELF_IMPLEMENTATION_MUTATION')) approvalScope = 'self_implementation';

  return {
    isReadOnly,
    isMutation,
    requiresOwnerApproval,
    approvalScope,
    classifications,
  };
}
