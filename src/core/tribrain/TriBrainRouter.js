import {
  TRIBRAIN_BRAINS,
  TRIBRAIN_CAPABILITY_MATRIX,
  TRIBRAIN_RISK_LEVELS,
  createTriBrainResponseEnvelope,
} from './TriBrainAbilityContract.js';
import { evaluateTriBrainPermission } from './TriBrainPermissions.js';

const DEFAULT_BRAIN_SETTINGS = Object.freeze({
  [TRIBRAIN_BRAINS.STUDIO]: { enabled: true, localMode: true, available: true },
  [TRIBRAIN_BRAINS.CHATGPT_OPERATOR]: { enabled: true, localMode: false, available: false },
  [TRIBRAIN_BRAINS.IDE_AGENT]: { enabled: true, localMode: true, available: false },
});

function normalizeBrainSettings(settings = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_BRAIN_SETTINGS).map(([brain, defaults]) => [
      brain,
      { ...defaults, ...(settings[brain] || {}) },
    ])
  );
}

function supportsAbility(brain, abilityClass) {
  return Boolean(TRIBRAIN_CAPABILITY_MATRIX[brain]?.abilities?.includes(abilityClass));
}

function brainAvailable(brain, settings) {
  const state = settings[brain];
  return Boolean(state?.enabled && state?.available);
}

export class TriBrainRouter {
  constructor({ brainSettings = {}, fallbackPolicy = 'studio_brain_first' } = {}) {
    this.brainSettings = normalizeBrainSettings(brainSettings);
    this.fallbackPolicy = fallbackPolicy;
  }

  status() {
    return {
      generatedAt: new Date().toISOString(),
      fallbackPolicy: this.fallbackPolicy,
      brains: Object.fromEntries(
        Object.entries(this.brainSettings).map(([brain, state]) => [
          brain,
          { ...state, capability: TRIBRAIN_CAPABILITY_MATRIX[brain] },
        ])
      ),
    };
  }

  candidateBrains(command) {
    const requested = command.targetBrain && command.targetBrain !== 'auto' ? [command.targetBrain] : null;
    const preferred = requested || this.defaultOrderFor(command);
    return preferred.filter(brain => supportsAbility(brain, command.abilityClass));
  }

  defaultOrderFor(command) {
    if (command.riskLevel === TRIBRAIN_RISK_LEVELS.CRITICAL || command.requiresApproval) {
      return [TRIBRAIN_BRAINS.CHATGPT_OPERATOR, TRIBRAIN_BRAINS.STUDIO, TRIBRAIN_BRAINS.IDE_AGENT];
    }

    switch (command.abilityClass) {
      case 'implement':
      case 'verify':
        return [TRIBRAIN_BRAINS.IDE_AGENT, TRIBRAIN_BRAINS.STUDIO, TRIBRAIN_BRAINS.CHATGPT_OPERATOR];
      case 'report':
      case 'summarize':
        return [TRIBRAIN_BRAINS.CHATGPT_OPERATOR, TRIBRAIN_BRAINS.STUDIO, TRIBRAIN_BRAINS.IDE_AGENT];
      case 'audit':
        return [TRIBRAIN_BRAINS.STUDIO, TRIBRAIN_BRAINS.IDE_AGENT, TRIBRAIN_BRAINS.CHATGPT_OPERATOR];
      default:
        return [TRIBRAIN_BRAINS.STUDIO, TRIBRAIN_BRAINS.CHATGPT_OPERATOR, TRIBRAIN_BRAINS.IDE_AGENT];
    }
  }

  route(command, permissionContext = {}) {
    const permission = evaluateTriBrainPermission(command, permissionContext);
    if (!permission.allowed) {
      return createTriBrainResponseEnvelope({
        commandId: command.id,
        respondingBrain: TRIBRAIN_BRAINS.STUDIO,
        truthState: command.requiresApproval ? 'NEEDS_APPROVAL' : 'BLOCKED',
        status: 'blocked',
        summary: 'TriBrain command blocked by permission and approval policy.',
        findings: permission.reasons.map(reason => ({ severity: 'high', module: 'TriBrainPermissions', message: reason })),
        evidence: { requiredRole: permission.requiredRole, riskLevel: command.riskLevel },
        nextActions: ['Request approval or lower the command risk before execution.'],
        requiresUserDecision: command.requiresApproval,
      });
    }

    const candidates = this.candidateBrains(command);
    const selectedBrain = candidates.find(brain => brainAvailable(brain, this.brainSettings))
      || candidates.find(brain => this.brainSettings[brain]?.enabled)
      || TRIBRAIN_BRAINS.STUDIO;
    const selectedState = this.brainSettings[selectedBrain] || {};
    const online = brainAvailable(selectedBrain, this.brainSettings);

    return createTriBrainResponseEnvelope({
      commandId: command.id,
      respondingBrain: selectedBrain,
      truthState: online ? 'VERIFIED' : 'VERIFIED_WITH_WARNINGS',
      status: 'routed',
      summary: online
        ? `TriBrain routed command to ${selectedBrain}.`
        : `TriBrain routed to ${selectedBrain}, but availability is gated; local policy must handle execution.`,
      findings: online ? [] : [{ severity: 'medium', module: 'TriBrainRouter', message: `${selectedBrain} is enabled but not currently available.` }],
      evidence: { selectedBrain, selectedState, candidates, fallbackPolicy: this.fallbackPolicy },
      nextActions: online ? ['Execute through selected brain adapter and record proof.'] : ['Use Studio Brain fallback or queue until the selected brain is available.'],
      requiresUserDecision: false,
    });
  }
}

export function createTriBrainRouter(config = {}) {
  return new TriBrainRouter(config);
}
