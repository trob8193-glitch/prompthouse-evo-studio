import { TRIBRAIN_ABILITY_CLASSES, TRIBRAIN_RISK_LEVELS, TRIBRAIN_ROLE_LEVELS } from './TriBrainAbilityContract.js';

const ROLE_RANK = Object.freeze({
  [TRIBRAIN_ROLE_LEVELS.VIEWER]: 1,
  [TRIBRAIN_ROLE_LEVELS.BUILDER]: 2,
  [TRIBRAIN_ROLE_LEVELS.DEVELOPER]: 3,
  [TRIBRAIN_ROLE_LEVELS.ADMIN]: 4,
  [TRIBRAIN_ROLE_LEVELS.OWNER]: 5,
  [TRIBRAIN_ROLE_LEVELS.SYSTEM_DAEMON]: 3,
});

const ROLE_ABILITIES = Object.freeze({
  [TRIBRAIN_ROLE_LEVELS.VIEWER]: [
    TRIBRAIN_ABILITY_CLASSES.SUMMARIZE,
    TRIBRAIN_ABILITY_CLASSES.REPORT,
    TRIBRAIN_ABILITY_CLASSES.REMEMBER,
  ],
  [TRIBRAIN_ROLE_LEVELS.BUILDER]: [
    TRIBRAIN_ABILITY_CLASSES.SUMMARIZE,
    TRIBRAIN_ABILITY_CLASSES.AUDIT,
    TRIBRAIN_ABILITY_CLASSES.PLAN,
    TRIBRAIN_ABILITY_CLASSES.REPORT,
    TRIBRAIN_ABILITY_CLASSES.REMEMBER,
    TRIBRAIN_ABILITY_CLASSES.ESCALATE,
  ],
  [TRIBRAIN_ROLE_LEVELS.DEVELOPER]: [
    TRIBRAIN_ABILITY_CLASSES.SUMMARIZE,
    TRIBRAIN_ABILITY_CLASSES.AUDIT,
    TRIBRAIN_ABILITY_CLASSES.PLAN,
    TRIBRAIN_ABILITY_CLASSES.IMPLEMENT,
    TRIBRAIN_ABILITY_CLASSES.VERIFY,
    TRIBRAIN_ABILITY_CLASSES.REPORT,
    TRIBRAIN_ABILITY_CLASSES.REMEMBER,
    TRIBRAIN_ABILITY_CLASSES.ESCALATE,
  ],
  [TRIBRAIN_ROLE_LEVELS.ADMIN]: Object.values(TRIBRAIN_ABILITY_CLASSES),
  [TRIBRAIN_ROLE_LEVELS.OWNER]: Object.values(TRIBRAIN_ABILITY_CLASSES),
  [TRIBRAIN_ROLE_LEVELS.SYSTEM_DAEMON]: [
    TRIBRAIN_ABILITY_CLASSES.SUMMARIZE,
    TRIBRAIN_ABILITY_CLASSES.AUDIT,
    TRIBRAIN_ABILITY_CLASSES.PLAN,
    TRIBRAIN_ABILITY_CLASSES.VERIFY,
    TRIBRAIN_ABILITY_CLASSES.REPORT,
    TRIBRAIN_ABILITY_CLASSES.ESCALATE,
  ],
});

const RISK_REQUIREMENTS = Object.freeze({
  [TRIBRAIN_RISK_LEVELS.LOW]: TRIBRAIN_ROLE_LEVELS.VIEWER,
  [TRIBRAIN_RISK_LEVELS.MEDIUM]: TRIBRAIN_ROLE_LEVELS.DEVELOPER,
  [TRIBRAIN_RISK_LEVELS.HIGH]: TRIBRAIN_ROLE_LEVELS.ADMIN,
  [TRIBRAIN_RISK_LEVELS.CRITICAL]: TRIBRAIN_ROLE_LEVELS.OWNER,
});

export function normalizeTriBrainRole(role = TRIBRAIN_ROLE_LEVELS.VIEWER) {
  const normalized = String(role || '').trim().toLowerCase();
  return Object.values(TRIBRAIN_ROLE_LEVELS).includes(normalized) ? normalized : TRIBRAIN_ROLE_LEVELS.VIEWER;
}

export function createTriBrainPermissionContext(input = {}) {
  return {
    tenantId: input.tenantId || 'tenant_default',
    userId: input.userId || 'anonymous',
    role: normalizeTriBrainRole(input.role),
    projectIds: Array.isArray(input.projectIds) ? input.projectIds : [],
    approvals: Array.isArray(input.approvals) ? input.approvals : [],
    featureToggles: input.featureToggles || {},
  };
}

export function canUseAbility(role, abilityClass) {
  const normalized = normalizeTriBrainRole(role);
  return Boolean(ROLE_ABILITIES[normalized]?.includes(abilityClass));
}

export function roleMeetsMinimum(role, requiredRole) {
  const current = ROLE_RANK[normalizeTriBrainRole(role)] || 0;
  const required = ROLE_RANK[normalizeTriBrainRole(requiredRole)] || 0;
  return current >= required;
}

export function hasApproval(context, command) {
  if (!command?.requiresApproval) return true;
  return context.approvals.some(approval => (
    approval?.commandId === command.id &&
    approval?.status === 'approved' &&
    approval?.receiptId
  ));
}

export function evaluateTriBrainPermission(command, contextInput = {}) {
  const context = createTriBrainPermissionContext(contextInput);
  const requiredRole = RISK_REQUIREMENTS[command.riskLevel] || TRIBRAIN_ROLE_LEVELS.OWNER;
  const reasons = [];

  if (!canUseAbility(context.role, command.abilityClass)) {
    reasons.push(`Role '${context.role}' cannot use ability '${command.abilityClass}'.`);
  }

  if (!roleMeetsMinimum(context.role, requiredRole)) {
    reasons.push(`Risk '${command.riskLevel}' requires role '${requiredRole}' or higher.`);
  }

  if (command.requiresApproval && !hasApproval(context, command)) {
    reasons.push('Command requires explicit approval before execution.');
  }

  if (command.payload?.projectId && context.projectIds.length > 0 && !context.projectIds.includes(command.payload.projectId)) {
    reasons.push(`User is not assigned to project '${command.payload.projectId}'.`);
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    requiredRole,
    context,
  };
}
