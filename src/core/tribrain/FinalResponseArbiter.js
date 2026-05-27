import { TRIBRAIN_TRUTH_STATES, createTriBrainResponseEnvelope } from './TriBrainAbilityContract.js';

const TRUTH_PRIORITY = Object.freeze({
  [TRIBRAIN_TRUTH_STATES.VERIFIED]: 6,
  [TRIBRAIN_TRUTH_STATES.VERIFIED_WITH_WARNINGS]: 5,
  [TRIBRAIN_TRUTH_STATES.KNOWN]: 4,
  [TRIBRAIN_TRUTH_STATES.RECOMMENDED]: 3,
  [TRIBRAIN_TRUTH_STATES.INFERRED]: 2,
  [TRIBRAIN_TRUTH_STATES.NEEDS_APPROVAL]: 1,
  [TRIBRAIN_TRUTH_STATES.BLOCKED]: 0,
});

function truthRank(state) {
  return TRUTH_PRIORITY[state] ?? 0;
}

function hasEvidence(response) {
  return Boolean(response?.evidence && Object.keys(response.evidence).length > 0);
}

function flattenFindings(responses = []) {
  return responses.flatMap(response => (response.findings || []).map(finding => ({
    ...finding,
    sourceBrain: response.respondingBrain,
  })));
}

function collectNextActions(responses = []) {
  const seen = new Set();
  const actions = [];
  for (const response of responses) {
    for (const action of response.nextActions || []) {
      const key = String(action).trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      actions.push(key);
    }
  }
  return actions;
}

export class FinalResponseArbiter {
  constructor({ requireEvidenceForVerified = true } = {}) {
    this.requireEvidenceForVerified = requireEvidenceForVerified;
  }

  arbitrate({ command, responses = [], permissionContext = {} } = {}) {
    const normalized = responses.map(response => createTriBrainResponseEnvelope(response));
    const blocked = normalized.filter(response => response.status === 'blocked' || response.truthState === TRIBRAIN_TRUTH_STATES.BLOCKED);
    const needsApproval = normalized.filter(response => response.truthState === TRIBRAIN_TRUTH_STATES.NEEDS_APPROVAL || response.requiresUserDecision);

    if (blocked.length > 0) {
      return createTriBrainResponseEnvelope({
        commandId: command?.id || null,
        respondingBrain: 'final_response_arbiter',
        truthState: TRIBRAIN_TRUTH_STATES.BLOCKED,
        status: 'blocked',
        summary: 'TriBrain final response blocked because at least one required brain or gate blocked the action.',
        findings: flattenFindings(blocked),
        evidence: { blockedCount: blocked.length, userId: permissionContext.userId, tenantId: permissionContext.tenantId },
        nextActions: collectNextActions(blocked),
        requiresUserDecision: true,
      });
    }

    if (needsApproval.length > 0) {
      return createTriBrainResponseEnvelope({
        commandId: command?.id || null,
        respondingBrain: 'final_response_arbiter',
        truthState: TRIBRAIN_TRUTH_STATES.NEEDS_APPROVAL,
        status: 'needs_approval',
        summary: 'TriBrain final response requires approval before implementation or execution.',
        findings: flattenFindings(needsApproval),
        evidence: { approvalRequired: true, userId: permissionContext.userId, tenantId: permissionContext.tenantId },
        nextActions: collectNextActions(needsApproval),
        requiresUserDecision: true,
      });
    }

    const ordered = [...normalized].sort((a, b) => truthRank(b.truthState) - truthRank(a.truthState));
    const best = ordered[0] || createTriBrainResponseEnvelope({
      respondingBrain: 'final_response_arbiter',
      truthState: TRIBRAIN_TRUTH_STATES.INFERRED,
      status: 'empty',
      summary: 'No TriBrain responses were provided.',
    });

    const verifiedButNoEvidence = this.requireEvidenceForVerified
      && [TRIBRAIN_TRUTH_STATES.VERIFIED, TRIBRAIN_TRUTH_STATES.VERIFIED_WITH_WARNINGS].includes(best.truthState)
      && !hasEvidence(best);

    const truthState = verifiedButNoEvidence ? TRIBRAIN_TRUTH_STATES.INFERRED : best.truthState;
    const evidenceWarning = verifiedButNoEvidence
      ? [{ severity: 'medium', module: 'FinalResponseArbiter', message: 'Verified claim was downgraded because no evidence object was provided.' }]
      : [];

    return createTriBrainResponseEnvelope({
      commandId: command?.id || best.commandId || null,
      respondingBrain: 'final_response_arbiter',
      truthState,
      status: 'completed',
      summary: best.summary || 'TriBrain response formed from available brain outputs.',
      findings: [...evidenceWarning, ...flattenFindings(normalized)],
      evidence: {
        selectedBrain: best.respondingBrain,
        contributingBrains: normalized.map(response => response.respondingBrain),
        responseCount: normalized.length,
        selectedEvidence: best.evidence || {},
      },
      nextActions: collectNextActions(normalized),
      requiresUserDecision: false,
    });
  }
}

export function createFinalResponseArbiter(config = {}) {
  return new FinalResponseArbiter(config);
}
