import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  approveEvoTrainPlan,
  createEvoTrainPlan,
  promoteEvoModelVersion,
  runEvoTrainPlan,
  syncEvoTrainRun
} from '../src/core/evo-llm/index.js';

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ph-evo-provider-'));
}

function withProviderEnv(fn) {
  const previous = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    EVO_LLM_ALLOW_PROVIDER_TRAINING: process.env.EVO_LLM_ALLOW_PROVIDER_TRAINING,
    EVO_LLM_MAX_TRAINING_BUDGET_USD: process.env.EVO_LLM_MAX_TRAINING_BUDGET_USD,
    EVO_LLM_BASE_MODEL: process.env.EVO_LLM_BASE_MODEL,
  };
  process.env.OPENAI_API_KEY = 'sk-test-provider-training';
  process.env.EVO_LLM_ALLOW_PROVIDER_TRAINING = 'true';
  process.env.EVO_LLM_MAX_TRAINING_BUDGET_USD = '25';
  process.env.EVO_LLM_BASE_MODEL = 'gpt-4o-mini-2024-07-18';
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    });
}

describe('Evo LLM provider training', () => {
  const created = [];

  afterEach(() => {
    for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  it('keeps provider plans blocked until gates are configured', () => {
    const rootDir = tempRoot();
    created.push(rootDir);
    const previous = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      EVO_LLM_ALLOW_PROVIDER_TRAINING: process.env.EVO_LLM_ALLOW_PROVIDER_TRAINING,
      EVO_LLM_MAX_TRAINING_BUDGET_USD: process.env.EVO_LLM_MAX_TRAINING_BUDGET_USD,
    };
    delete process.env.OPENAI_API_KEY;
    delete process.env.EVO_LLM_ALLOW_PROVIDER_TRAINING;
    delete process.env.EVO_LLM_MAX_TRAINING_BUDGET_USD;

    const { plan } = createEvoTrainPlan({ rootDir, provider: 'openai' });

    expect(plan.truthState).toBe('PROVIDER_TRAINING_PLAN_BLOCKED');
    expect(plan.blockedReasons.length).toBeGreaterThan(0);
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('submits provider fine-tune jobs and promotes only after trained weights are synced', async () => {
    const rootDir = tempRoot();
    created.push(rootDir);

    await withProviderEnv(async () => {
      const { plan } = createEvoTrainPlan({ rootDir, provider: 'openai' });
      expect(plan.truthState).toBe('PROVIDER_TRAINING_PLAN_READY_FOR_APPROVAL');

      approveEvoTrainPlan({ rootDir, planId: plan.id, scope: 'provider-training' });

      let uploadCount = 0;
      const fetchImpl = async (url, options = {}) => {
        const target = String(url);
        if (target.endsWith('/v1/files')) {
          uploadCount += 1;
          return { ok: true, status: 200, json: async () => ({ id: `file_${uploadCount}` }) };
        }
        if (target.endsWith('/v1/fine_tuning/jobs') && options.method === 'POST') {
          return { ok: true, status: 200, json: async () => ({ id: 'ftjob_1', status: 'queued', fine_tuned_model: null }) };
        }
        if (target.endsWith('/v1/fine_tuning/jobs/ftjob_1')) {
          return { ok: true, status: 200, json: async () => ({ id: 'ftjob_1', status: 'succeeded', fine_tuned_model: 'ft:gpt-4o-mini:studio:evo:abc' }) };
        }
        throw new Error(`Unexpected fetch: ${target}`);
      };

      const runResult = await runEvoTrainPlan({ rootDir, planId: plan.id, fetchImpl });
      expect(runResult.run.truthState).toBe('PROVIDER_FINE_TUNE_JOB_SUBMITTED');
      expect(runResult.run.providerJobId).toBe('ftjob_1');

      expect(() => promoteEvoModelVersion({ rootDir, runId: runResult.run.id })).toThrow(/trained weights/);

      const synced = await syncEvoTrainRun({ rootDir, runId: runResult.run.id, fetchImpl });
      expect(synced.run.truthState).toBe('PROVIDER_FINE_TUNED_WEIGHTS_READY');
      expect(synced.run.fineTunedModel).toBe('ft:gpt-4o-mini:studio:evo:abc');

      const promoted = promoteEvoModelVersion({ rootDir, runId: synced.run.id });
      expect(promoted.version.truthState).toBe('PROVIDER_TRAINED_WEIGHTS_PROMOTED');
      expect(promoted.version.modelId).toBe('ft:gpt-4o-mini:studio:evo:abc');
    });
  });
});
