import { describe, expect, it } from 'vitest';

import { executeAdapterTask } from '../src/core/evo-layer/execution/AdapterExecutor.js';
import { checkExecutionSafety, classifyExecutionRisk } from '../src/core/evo-layer/safety/SafetyGate.js';
import {
  evaluateEvoLlmTrainingCostGate,
  evaluateEvoProviderGate,
  getEvoTrainStatus,
} from '../src/core/evo-llm/index.js';
import { getEnterpriseArchitectureStatus } from '../src/core/architecture/EnterpriseArchitectureContract.js';
import { getQuadBrainStatus } from '../src/core/quadbrain/index.js';

function tempEnv(overrides = {}) {
  return {
    OPENAI_API_KEY: '',
    GEMINI_API_KEY: '',
    EVO_LLM_MAX_TRAINING_BUDGET_USD: '0',
    EVO_LLM_ALLOW_PROVIDER_TRAINING: 'false',
    ...overrides,
  };
}

describe('Master readiness execution contracts', () => {
  it('classifies normal proof commands as allowed', () => {
    const risk = classifyExecutionRisk({ task: 'npm run test' });
    const safety = checkExecutionSafety({ task: 'npm run test' });

    expect(risk.risk).toBe('LOW');
    expect(safety.allowed).toBe(true);
    expect(safety.category).toBe('proof_command');
  });

  it('returns runtime bridge receipts for IDE and MCP adapters', async () => {
    const cursor = await executeAdapterTask({ task: 'refactor dashboard', adapter: 'cursor' });
    const mcp = await executeAdapterTask({ task: 'open app cockpit', adapter: 'mcp' });

    expect(cursor.success).toBe(true);
    expect(cursor.adapterResult.truthState).toBe('ADAPTER_ROUTED_RUNTIME_BRIDGE_REQUIRED');
    expect(mcp.success).toBe(true);
    expect(mcp.adapterResult.truthState).toBe('ADAPTER_ROUTED_RUNTIME_BRIDGE_REQUIRED');
  });
});

describe('Master readiness Evo LLM gates', () => {
  it('reports provider training blockers when external gates are missing', () => {
    const gate = evaluateEvoProviderGate({ provider: 'openai', env: tempEnv() });

    expect(gate.allowed).toBe(false);
    expect(gate.truthState).toBe('PROVIDER_GATE_BLOCKED');
    expect(gate.blockedReasons.length).toBeGreaterThan(0);
  });

  it('allows provider training only when all gates are explicit', () => {
    const gate = evaluateEvoProviderGate({
      provider: 'openai',
      env: tempEnv({
        OPENAI_API_KEY: 'present-in-test',
        EVO_LLM_MAX_TRAINING_BUDGET_USD: '25',
        EVO_LLM_ALLOW_PROVIDER_TRAINING: 'true',
      }),
    });

    expect(gate.allowed).toBe(true);
    expect(gate.truthState).toBe('PROVIDER_GATE_ALLOWED');
  });

  it('keeps training status and cost gates explicit', () => {
    const status = getEvoTrainStatus();
    const costGate = evaluateEvoLlmTrainingCostGate({ provider: 'openai', examples: 100 });

    expect(status).toHaveProperty('truthState');
    expect(costGate.provider).toBe('openai');
    expect(costGate).toHaveProperty('allowed');
    expect(costGate).toHaveProperty('truthState');
  });
});

describe('Master readiness architecture contracts', () => {
  it('publishes enterprise and QuadBrain readiness contracts', () => {
    const architecture = getEnterpriseArchitectureStatus({ compact: true });
    const quadbrain = getQuadBrainStatus();

    expect(architecture.success).toBe(true);
    expect(architecture.truthLabel).toBe('ENTERPRISE_ARCHITECTURE_EXPANSION_READY');
    expect(quadbrain.truthLabel).toBe('QUADBRAIN_ENTERPRISE_OVERLAY_READY');
    expect(quadbrain.canon.brains).toHaveLength(4);
  });
});
