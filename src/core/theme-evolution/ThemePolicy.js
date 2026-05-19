export const THEME_TRUTH_STATES = Object.freeze({
  IDLE: 'IDLE',
  SUGGESTED: 'SUGGESTED',
  PREVIEW_READY: 'PREVIEW_READY',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  APPROVED: 'APPROVED',
  APPLIED: 'APPLIED',
  ROLLED_BACK: 'ROLLED_BACK',
  BLOCKED: 'BLOCKED'
});

export const DEFAULT_THEME_POLICY = Object.freeze({
  allowAutoApply: false,
  requireApproval: true,
  requireAccessibilityCheck: true,
  requirePerformanceCheck: true,
  minimumContrastRatio: 4.5,
  maxMotionIntensity: 0.75,
  blockedTargets: [
    'payment-confirm-button',
    'delete-confirm-button',
    'production-deploy-button',
    'secret-input',
    'auth-warning',
    'security-warning',
    'legal-notice',
    'cost-estimate-label',
    'proof-truth-label'
  ],
  allowedScopes: [
    'dashboard',
    'proof-console',
    'cost-firewall',
    'self-evolution',
    'forge-labs',
    'global'
  ]
});

export function normalizeThemePolicy(policy = {}) {
  return {
    ...DEFAULT_THEME_POLICY,
    ...policy,
    blockedTargets: policy.blockedTargets || DEFAULT_THEME_POLICY.blockedTargets,
    allowedScopes: policy.allowedScopes || DEFAULT_THEME_POLICY.allowedScopes
  };
}

export function assertThemeChangeAllowed(change = {}, policyInput = {}) {
  const policy = normalizeThemePolicy(policyInput);
  const scope = change.scope || 'dashboard';
  if (!policy.allowedScopes.includes(scope)) {
    return { allowed: false, reasons: [`Theme scope is not allowed: ${scope}`] };
  }
  const targets = change.targets || [];
  const blocked = targets.filter(target => policy.blockedTargets.includes(target));
  if (blocked.length) {
    return { allowed: false, reasons: blocked.map(target => `Blocked sensitive visual target: ${target}`) };
  }
  const motion = Number(change.motionIntensity ?? 0.35);
  if (motion > policy.maxMotionIntensity) {
    return { allowed: false, reasons: [`Motion intensity ${motion} exceeds max ${policy.maxMotionIntensity}`] };
  }
  return { allowed: true, reasons: [] };
}

export function requiresThemeApproval(policyInput = {}) {
  const policy = normalizeThemePolicy(policyInput);
  return Boolean(policy.requireApproval || !policy.allowAutoApply);
}
