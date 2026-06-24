export const TRIBRAIN_NAME = 'PH Evo Studio TriBrain';

export const TRIBRAIN_BRAINS = Object.freeze({
  STUDIO: 'studio_brain',
  CHATGPT_OPERATOR: 'chatgpt_operator_brain',
  IDE_AGENT: 'ide_agent_brain',
});

export const TRIBRAIN_ABILITY_CLASSES = Object.freeze({
  SUMMARIZE: 'summarize',
  AUDIT: 'audit',
  PLAN: 'plan',
  IMPLEMENT: 'implement',
  VERIFY: 'verify',
  REPORT: 'report',
  REMEMBER: 'remember',
  ESCALATE: 'escalate',
});

export const TRIBRAIN_RISK_LEVELS = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

export const TRIBRAIN_TRUTH_STATES = Object.freeze({
  KNOWN: 'KNOWN',
  VERIFIED: 'VERIFIED',
  VERIFIED_WITH_WARNINGS: 'VERIFIED_WITH_WARNINGS',
  INFERRED: 'INFERRED',
  BLOCKED: 'BLOCKED',
  NEEDS_APPROVAL: 'NEEDS_APPROVAL',
  RECOMMENDED: 'RECOMMENDED',
});

export const TRIBRAIN_COMMAND_MODES = Object.freeze({
  READ_ONLY: 'read_only',
  PROPOSAL_ONLY: 'proposal_only',
  APPROVAL_GATED: 'approval_gated',
  LOCAL_EXECUTION: 'local_execution',
});

export const TRIBRAIN_ROLE_LEVELS = Object.freeze({
  VIEWER: 'viewer',
  BUILDER: 'builder',
  DEVELOPER: 'developer',
  ADMIN: 'admin',
  OWNER: 'owner',
  SYSTEM_DAEMON: 'system_daemon',
});

export const TRIBRAIN_CAPABILITY_MATRIX = Object.freeze({
  [TRIBRAIN_BRAINS.STUDIO]: {
    abilities: Object.values(TRIBRAIN_ABILITY_CLASSES),
    localCapable: true,
    canExecute: true,
    canApprove: false,
    defaultMode: TRIBRAIN_COMMAND_MODES.APPROVAL_GATED,
    authority: 'Native studio intelligence, memory, daemon orchestration, local fallback, and final response formation.',
  },
  [TRIBRAIN_BRAINS.CHATGPT_OPERATOR]: {
    abilities: Object.values(TRIBRAIN_ABILITY_CLASSES),
    localCapable: false,
    canExecute: false,
    canApprove: true,
    defaultMode: TRIBRAIN_COMMAND_MODES.PROPOSAL_ONLY,
    authority: 'External ChatGPT cockpit, review surface, approval console, and report generator through Studio Gateway actions.',
  },
  [TRIBRAIN_BRAINS.IDE_AGENT]: {
    abilities: Object.values(TRIBRAIN_ABILITY_CLASSES),
    localCapable: true,
    canExecute: true,
    canApprove: false,
    defaultMode: TRIBRAIN_COMMAND_MODES.LOCAL_EXECUTION,
    authority: 'IDE and desktop execution brain for repo inspection, patch proposals, tests, builds, browser validation, and local proof artifacts.',
  },
});

const DANGEROUS_INTENTS = Object.freeze([
  'MERGE_TO_MAIN',
  'DEPLOY_PRODUCTION',
  'CHANGE_SECRETS',
  'DELETE_FILES',
  'DISABLE_AUDITS',
  'DISABLE_TESTS',
  'REWRITE_CORE_ARCHITECTURE',
  'APPLY_PATCH',
  'INSTALL_DEPENDENCIES',
  'MODIFY_DATABASE_RULES',
]);

export function isDangerousIntent(intent = '') {
  const normalized = String(intent).trim().toUpperCase();
  return DANGEROUS_INTENTS.some(item => normalized.includes(item));
}

export function inferRiskLevel(intent = '', payload = {}) {
  const text = `${intent} ${JSON.stringify(payload || {})}`.toUpperCase();
  if (/DEPLOY_PRODUCTION|CHANGE_SECRETS|DELETE_FILES|DISABLE_AUDITS|DISABLE_TESTS|MERGE_TO_MAIN/.test(text)) {
    return TRIBRAIN_RISK_LEVELS.CRITICAL;
  }
  if (/APPLY_PATCH|INSTALL_DEPENDENCIES|MODIFY_DATABASE_RULES|REWRITE_CORE_ARCHITECTURE|PROVIDER|AUTH|BILLING|STRIPE/.test(text)) {
    return TRIBRAIN_RISK_LEVELS.HIGH;
  }
  if (/CREATE_PR|CREATE_BRANCH|RUN_TESTS|RUN_BUILD|LOCAL_EXECUTION|REPAIR/.test(text)) {
    return TRIBRAIN_RISK_LEVELS.MEDIUM;
  }
  return TRIBRAIN_RISK_LEVELS.LOW;
}

export function createTriBrainCommandEnvelope(input = {}) {
  const abilityClass = input.abilityClass || TRIBRAIN_ABILITY_CLASSES.PLAN;
  const intent = String(input.intent || 'PLAN_STUDIO_WORK').trim();
  const riskLevel = input.riskLevel || inferRiskLevel(intent, input.payload);
  const requiresApproval = Boolean(
    (input.requiresApproval ?? isDangerousIntent(intent)) ||
    riskLevel === TRIBRAIN_RISK_LEVELS.HIGH ||
    riskLevel === TRIBRAIN_RISK_LEVELS.CRITICAL
  );

  return {
    id: input.id || `tribrain_cmd_${Date.now()}`,
    tenantId: input.tenantId || 'tenant_default',
    userId: input.userId || 'system',
    sourceBrain: input.sourceBrain || TRIBRAIN_BRAINS.STUDIO,
    targetBrain: input.targetBrain || 'auto',
    intent,
    abilityClass,
    riskLevel,
    requiresApproval,
    localAllowed: Boolean(input.localAllowed ?? true),
    fallbackAllowed: Boolean(input.fallbackAllowed ?? true),
    mode: input.mode || TRIBRAIN_COMMAND_MODES.READ_ONLY,
    payload: input.payload || {},
    proofRequired: Boolean(input.proofRequired ?? true),
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export function createTriBrainResponseEnvelope(input = {}) {
  return {
    commandId: input.commandId || null,
    respondingBrain: input.respondingBrain || TRIBRAIN_BRAINS.STUDIO,
    truthState: input.truthState || TRIBRAIN_TRUTH_STATES.INFERRED,
    status: input.status || 'completed',
    summary: input.summary || '',
    findings: Array.isArray(input.findings) ? input.findings : [],
    evidence: input.evidence || {},
    nextActions: Array.isArray(input.nextActions) ? input.nextActions : [],
    requiresUserDecision: Boolean(input.requiresUserDecision),
    generatedAt: input.generatedAt || new Date().toISOString(),
  };
}

export function validateTriBrainCommand(command = {}) {
  const errors = [];
  if (!command.id) errors.push('Missing command id.');
  if (!Object.values(TRIBRAIN_ABILITY_CLASSES).includes(command.abilityClass)) errors.push(`Invalid ability class: ${command.abilityClass}`);
  if (!Object.values(TRIBRAIN_RISK_LEVELS).includes(command.riskLevel)) errors.push(`Invalid risk level: ${command.riskLevel}`);
  if (!Object.values(TRIBRAIN_BRAINS).includes(command.sourceBrain)) errors.push(`Invalid source brain: ${command.sourceBrain}`);
  if (command.targetBrain !== 'auto' && !Object.values(TRIBRAIN_BRAINS).includes(command.targetBrain)) errors.push(`Invalid target brain: ${command.targetBrain}`);
  if (command.proofRequired !== true) errors.push('TriBrain commands must require proof by default.');
  return { valid: errors.length === 0, errors };
}
