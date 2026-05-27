#!/usr/bin/env node
import {
  TRIBRAIN_ABILITY_CLASSES,
  TRIBRAIN_BRAINS,
  TRIBRAIN_RISK_LEVELS,
  createTriBrainSystem,
} from '../src/core/tribrain/index.js';

const args = new Set(process.argv.slice(2));
const system = createTriBrainSystem({
  brainSettings: {
    [TRIBRAIN_BRAINS.STUDIO]: { enabled: true, available: true, localMode: true },
    [TRIBRAIN_BRAINS.CHATGPT_OPERATOR]: { enabled: true, available: args.has('--chatgpt-online'), localMode: false },
    [TRIBRAIN_BRAINS.IDE_AGENT]: { enabled: true, available: args.has('--ide-online'), localMode: true },
  },
});

const status = system.status();
const plan = system.plan(
  {
    sourceBrain: TRIBRAIN_BRAINS.STUDIO,
    targetBrain: 'auto',
    intent: args.has('--dangerous') ? 'DEPLOY_PRODUCTION' : 'RUN_PLATFORM_AUDIT',
    abilityClass: args.has('--dangerous') ? TRIBRAIN_ABILITY_CLASSES.IMPLEMENT : TRIBRAIN_ABILITY_CLASSES.AUDIT,
    riskLevel: args.has('--dangerous') ? TRIBRAIN_RISK_LEVELS.CRITICAL : TRIBRAIN_RISK_LEVELS.LOW,
    payload: { projectId: 'studio-core' },
  },
  {
    tenantId: 'tenant_default',
    userId: 'tribrain_check',
    role: args.has('--owner') ? 'owner' : 'builder',
    projectIds: ['studio-core'],
    approvals: [],
  },
);

const result = {
  generatedAt: new Date().toISOString(),
  truthLabel: plan.truthState === 'BLOCKED' || plan.truthState === 'NEEDS_APPROVAL'
    ? 'TRIBRAIN_CONTRACT_BLOCKED_BY_POLICY'
    : 'TRIBRAIN_CONTRACT_READY',
  status,
  sampleRoute: plan,
};

console.log(JSON.stringify(result, null, 2));

if (args.has('--strict') && result.truthLabel !== 'TRIBRAIN_CONTRACT_READY') {
  process.exitCode = 1;
}
