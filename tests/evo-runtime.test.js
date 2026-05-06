import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Evo runtime foundry modules', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('syncs models from the bridge payload shape', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        models: [
          { id: 'local-evo-router', status: 'available' },
          { id: 'local-evo-lm-latest', status: 'trained_local' },
        ],
      }),
    })));

    const { fetchModelsFromServer, getAllModels } = await import('../src/core/foundry/evo_lm_model_family.js');
    await fetchModelsFromServer();

    expect(getAllModels().map((model) => model.id)).toContain('local-evo-lm-latest');
  });

  it('persists datasets and forwards them to the bridge', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true }),
    })));

    const { synthesize, loadExistingDatasets } = await import('../src/core/foundry/dataset_forge.js');
    const examples = await synthesize(2, {
      rangeA: { min: 1, max: 2 },
      rangeB: { min: 3, max: 4 },
      labels: ['accept'],
    });

    expect(examples).toHaveLength(2);
    expect(loadExistingDatasets().length).toBeGreaterThanOrEqual(2);
  });

  it('normalizes model output for preference tuning', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        output: {
          text: 'Activate local Evo LM runtime',
        },
      }),
    })));

    const { submitFeedback, getPreferences } = await import('../src/core/foundry/preference_tuning.js');
    const tuned = await submitFeedback('Activate local Evo LM runtime', 'Activate');

    expect(tuned.alignmentScore).toBeGreaterThanOrEqual(0);
    expect(getPreferences()['Activate local Evo LM runtime'].output).toContain('Activate');
  });

  it('uses the local train and infer routes', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => ({
      ok: true,
      json: async () => {
        if (String(url).includes('/train')) {
          return { success: true, status: 'trained_local' };
        }
        if (String(url).includes('/infer')) {
          return { success: true, output: 'local-evo-lm-latest inference: test' };
        }
        return { success: true, models: [] };
      },
    })));

    const { default: FreeFoundryMode } = await import('../src/core/foundry/free_foundry_mode.js');
    const trainResult = await FreeFoundryMode.train({ modelId: 'local-evo-lm-latest', datasetSize: 1 });
    const inferResult = await FreeFoundryMode.infer({ modelId: 'local-evo-lm-latest', input: 'test' });

    expect(trainResult.success).toBe(true);
    expect(inferResult.output).toContain('inference');
  });
});
