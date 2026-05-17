export const RIFT_TRUTH_LABELS = Object.freeze({
  REAL: 'REAL',
  SIMULATED: 'SIMULATED',
  GENERATED: 'GENERATED',
  INFERRED: 'INFERRED',
  BLOCKED: 'BLOCKED',
  REAL_USER_INPUT: 'REAL_USER_INPUT',
  GENERATED_AVATAR: 'GENERATED_AVATAR',
  INFERRED_STYLE: 'INFERRED_STYLE',
  BLOCKED_NO_CONSENT: 'BLOCKED_NO_CONSENT',
  SIMULATED_TIMELINE: 'SIMULATED_TIMELINE',
  GENERATED_ENTITY: 'GENERATED_ENTITY',
  SIMULATED_AGENT: 'SIMULATED_AGENT',
  GENERATED_AI_OUTPUT: 'GENERATED_AI_OUTPUT'
});

export const RIFT_EVENT_TYPES = Object.freeze({
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_PAUSED: 'SESSION_PAUSED',
  SESSION_ENDED: 'SESSION_ENDED',
  PERMISSION_PROBED: 'PERMISSION_PROBED',
  SENSOR_CAPTURED: 'SENSOR_CAPTURED',
  SYMBOL_RECORDED: 'SYMBOL_RECORDED',
  PATTERN_INFERRED: 'PATTERN_INFERRED',
  ALTERNATE_SELF_GENERATED: 'ALTERNATE_SELF_GENERATED',
  TIMELINE_BRANCH_CREATED: 'TIMELINE_BRANCH_CREATED',
  NPC_EVENT_GENERATED: 'NPC_EVENT_GENERATED',
  EVOPULSE_ENVELOPE_BUILT: 'EVOPULSE_ENVELOPE_BUILT',
  BLOCKED_BOUNDARY: 'BLOCKED_BOUNDARY'
});

export function truthLabel(label, reason, evidence = {}) {
  if (!Object.values(RIFT_TRUTH_LABELS).includes(label)) {
    throw new Error('Unsupported Rift truth label.');
  }

  return Object.freeze({
    label,
    reason: String(reason || 'Reason unavailable.'),
    evidence,
    labeledAt: new Date().toISOString()
  });
}

export const real = (reason, evidence = {}) => truthLabel(RIFT_TRUTH_LABELS.REAL, reason, evidence);
export const inferred = (reason, evidence = {}) => truthLabel(RIFT_TRUTH_LABELS.INFERRED, reason, evidence);
export const simulated = (reason, evidence = {}) => truthLabel(RIFT_TRUTH_LABELS.SIMULATED, reason, evidence);
export const generated = (reason, evidence = {}) => truthLabel(RIFT_TRUTH_LABELS.GENERATED, reason, evidence);
export const blocked = (reason, evidence = {}) => truthLabel(RIFT_TRUTH_LABELS.BLOCKED, reason, evidence);
export const blockedNoConsent = (scope, evidence = {}) => truthLabel(RIFT_TRUTH_LABELS.BLOCKED_NO_CONSENT, `${scope} requires explicit consent.`, evidence);
