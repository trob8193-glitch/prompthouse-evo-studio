import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  getEvoTrainingState,
  planEvoLlmTraining,
  approveEvoTrainingPlan,
  runEvoTrainingJob,
  promoteEvoModel,
  rollbackEvoModel
} from '../src/core/evo-llm/EvoLlmTrainingOrchestrator.js';

vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn(),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    },
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn()
  };
});
vi.mock('../src/core/autonomy/SovereignLogger.js', () => ({
  Log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
}));
vi.mock('../src/core/evo-llm/EvoLlmDataset.js', () => ({
  buildEvoLlmDataset: vi.fn(() => ({ trainCount: 10, evalCount: 5 }))
}));
vi.mock('../src/core/evo-llm/EvoLlmEvaluation.js', () => ({
  evaluateEvoLlmDataset: vi.fn(() => ({ datasetQualityScore: 95, invalidCount: 0 })),
  writeEvoLlmTrainingReceipt: vi.fn(() => ({ file: '/mock/receipt.json' }))
}));
vi.mock('../src/gateway/index.js', () => ({
  evaluateCostedRequest: vi.fn(() => ({ allowed: true, estimatedCost: 0.05 }))
}));
vi.mock('../src/core/autonomy/CrashProofEngine.js', () => ({
  CrashProofEngine: { initialize: vi.fn(), runSafe: vi.fn() }
}));

describe('EvoLlmTrainingOrchestrator', () => {
  const rootDir = '/mock/root';
  let memoryFS = {};

  beforeEach(() => {
    memoryFS = {};
    vi.clearAllMocks();
    
    fs.existsSync.mockImplementation((file) => !!memoryFS[file]);
    fs.readFileSync.mockImplementation((file) => {
      if (!memoryFS[file]) throw new Error('File not found');
      return memoryFS[file];
    });
    fs.writeFileSync.mockImplementation((file, data) => {
      memoryFS[file] = data;
    });
    fs.mkdirSync.mockImplementation(() => {});
  });

  it('getEvoTrainingState returns default state when no file exists', () => {
    const state = getEvoTrainingState({ rootDir });
    expect(state.truthState).toBe('NO_TRAINING_RUNS');
    expect(state.runs).toEqual([]);
    expect(state.activeModel).toBeNull();
  });

  it('planEvoLlmTraining generates a plan and saves state', () => {
    const plan = planEvoLlmTraining({ rootDir });
    expect(plan.truthState).toBe('TRAINING_PLAN_READY_FOR_APPROVAL');
    expect(plan.blockers.length).toBe(0);
    expect(plan.manifest.trainCount).toBe(10);
    
    const state = getEvoTrainingState({ rootDir });
    expect(state.runs.length).toBe(1);
    expect(state.runs[0].id).toBe(plan.id);
  });

  it('approveEvoTrainingPlan requires valid planId', () => {
    expect(() => approveEvoTrainingPlan({ rootDir, planId: null })).toThrow('planId is required and must be a string.');
  });

  it('approveEvoTrainingPlan successfully approves a ready plan', () => {
    const plan = planEvoLlmTraining({ rootDir });
    const approval = approveEvoTrainingPlan({ rootDir, planId: plan.id });
    
    expect(approval.planId).toBe(plan.id);
    expect(approval.truthState).toBe('TRAINING_APPROVED_PROVIDER_RUN_STILL_REQUIRED');
  });

  it('runEvoTrainingJob fails if plan is not approved', () => {
    const plan = planEvoLlmTraining({ rootDir });
    const run = runEvoTrainingJob({ rootDir, planId: plan.id });
    
    expect(run.truthState).toBe('TRAINING_RUN_BLOCKED_MISSING_APPROVAL');
  });

  it('runEvoTrainingJob succeeds for local provider', () => {
    const plan = planEvoLlmTraining({ rootDir });
    approveEvoTrainingPlan({ rootDir, planId: plan.id });
    
    const run = runEvoTrainingJob({ rootDir, planId: plan.id, provider: 'local-dataset-only' });
    expect(run.truthState).toBe('DATASET_PIPELINE_EXECUTED_NO_PROVIDER_FINE_TUNE');
    expect(run.executedProviderTraining).toBe(false);
  });

  it('runEvoTrainingJob enforces OPENAI_API_KEY for openai provider', () => {
    const plan = planEvoLlmTraining({ rootDir });
    approveEvoTrainingPlan({ rootDir, planId: plan.id });
    
    const originalEnv = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    
    const run = runEvoTrainingJob({ rootDir, planId: plan.id, provider: 'openai-gpt-4o-mini' });
    expect(run.truthState).toBe('PROVIDER_FINE_TUNE_FAILED');
    expect(run.executedProviderTraining).toBe(false);
    expect(run.message).toContain('FATAL: OPENAI_API_KEY is missing');
    
    process.env.OPENAI_API_KEY = originalEnv;
  });

  it('promoteEvoModel and rollbackEvoModel work correctly', () => {
    const modelId = 'model_v1';
    const promotion = promoteEvoModel({ rootDir, modelId });
    expect(promotion.truthState).toBe('PROMOTION_RECORDED_REQUIRES_RUNTIME_BINDING');
    
    let state = getEvoTrainingState({ rootDir });
    expect(state.activeModel).toBe(modelId);
    expect(state.promotedModels.length).toBe(1);
    
    const rollback = rollbackEvoModel({ rootDir });
    expect(rollback.previousModel).toBe(modelId);
    
    state = getEvoTrainingState({ rootDir });
    expect(state.activeModel).toBeNull();
    expect(state.rolledBackModels.length).toBe(1);
  });
});
