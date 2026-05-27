import { describe, expect, it } from 'vitest';
import {
  TRIBRAIN_ABILITY_CLASSES,
  TRIBRAIN_BRAINS,
  TRIBRAIN_RISK_LEVELS,
  createTriBrainCommandEnvelope,
  createTriBrainSystem,
  validateTriBrainCommand,
} from './index.js';

describe('TriBrain contract core', () => {
  it('creates valid proof-required command envelopes', () => {
    const command = createTriBrainCommandEnvelope({
      sourceBrain: TRIBRAIN_BRAINS.STUDIO,
      intent: 'RUN_PLATFORM_AUDIT',
      abilityClass: TRIBRAIN_ABILITY_CLASSES.AUDIT,
      riskLevel: TRIBRAIN_RISK_LEVELS.LOW,
    });

    expect(command.proofRequired).toBe(true);
    expect(validateTriBrainCommand(command).valid).toBe(true);
  });

  it('routes low-risk audits to the studio brain when available', () => {
    const system = createTriBrainSystem({
      brainSettings: {
        [TRIBRAIN_BRAINS.STUDIO]: { enabled: true, available: true, localMode: true },
        [TRIBRAIN_BRAINS.CHATGPT_OPERATOR]: { enabled: true, available: false, localMode: false },
        [TRIBRAIN_BRAINS.IDE_AGENT]: { enabled: true, available: false, localMode: true },
      },
    });

    const response = system.plan({
      sourceBrain: TRIBRAIN_BRAINS.STUDIO,
      intent: 'RUN_PLATFORM_AUDIT',
      abilityClass: TRIBRAIN_ABILITY_CLASSES.AUDIT,
      riskLevel: TRIBRAIN_RISK_LEVELS.LOW,
      payload: { projectId: 'studio-core' },
    }, {
      role: 'builder',
      userId: 'test-user',
      tenantId: 'tenant-test',
      projectIds: ['studio-core'],
    });

    expect(response.status).toBe('completed');
    expect(response.evidence.selectedBrain).toBe(TRIBRAIN_BRAINS.STUDIO);
  });

  it('blocks critical production actions without owner approval', () => {
    const system = createTriBrainSystem();
    const response = system.plan({
      sourceBrain: TRIBRAIN_BRAINS.STUDIO,
      intent: 'DEPLOY_PRODUCTION',
      abilityClass: TRIBRAIN_ABILITY_CLASSES.IMPLEMENT,
      riskLevel: TRIBRAIN_RISK_LEVELS.CRITICAL,
      payload: { projectId: 'studio-core' },
    }, {
      role: 'developer',
      userId: 'test-user',
      tenantId: 'tenant-test',
      projectIds: ['studio-core'],
    });

    expect(['BLOCKED', 'NEEDS_APPROVAL']).toContain(response.truthState);
    expect(response.requiresUserDecision).toBe(true);
  });
});
