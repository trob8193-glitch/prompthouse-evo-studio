import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import registerStudioCoreRoutes from '../server/routes/studio-core.routes.js';
import {
  activateEvoRuntime,
  captureTrainingEvent,
  getEvoRuntimeStatus,
  ingestTrainingExamples
} from '../server/services/evo-training-runtime.js';

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ph-training-runtime-'));
}

function createMockApp() {
  const routes = new Map();
  return {
    get(route, handler) { routes.set(`GET ${route}`, handler); },
    post(route, handler) { routes.set(`POST ${route}`, handler); },
    delete(route, handler) { routes.set(`DELETE ${route}`, handler); },
    has(method, route) { return routes.has(`${method} ${route}`); },
  };
}

describe('Evo training runtime bridge', () => {
  const created = [];

  afterEach(() => {
    for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  it('ingests flexible examples into Evo LLM training data', () => {
    const rootDir = tempRoot();
    created.push(rootDir);

    const result = ingestTrainingExamples({
      rootDir,
      source: 'test-suite',
      examples: [
        { input: 'Audit a route', output: 'Run route drift proof and report blockers.' },
        { title: 'Provider training', content: 'Never claim trained weights until provider returns fine_tuned_model.' },
      ],
    });

    expect(result.truthState).toBe('TRAINING_INGESTED');
    expect(result.ingested).toBe(2);
    expect(result.manifest.validExamples).toBeGreaterThanOrEqual(2);
  });

  it('records training captures and activates local Evo runtime', () => {
    const rootDir = tempRoot();
    created.push(rootDir);

    const capture = captureTrainingEvent({
      rootDir,
      capture: {
        id: 'capture_one',
        summary: 'Route gap found',
        next_pass_excerpt: 'Wire missing route',
        checklist: 'test, build, route proof',
      },
    });
    expect(capture.truthState).toBe('TRAINING_CAPTURE_RECORDED');
    expect(capture.ingest.ingested).toBe(1);

    const activated = activateEvoRuntime({ rootDir, source: 'test', runId: 'run_one' });
    expect(activated.truthState).toBe('EVO_RUNTIME_LOCAL_ACTIVE');

    const status = getEvoRuntimeStatus({ rootDir });
    expect(status.active).toBe(true);
    expect(status.training.total).toBeGreaterThan(0);
  });

  it('registers self-training and Evo runtime bridge routes', () => {
    const app = createMockApp();
    registerStudioCoreRoutes(app);

    expect(app.has('POST', '/api/training/ingest')).toBe(true);
    expect(app.has('POST', '/api/training-capture')).toBe(true);
    expect(app.has('GET', '/api/training/stats')).toBe(true);
    expect(app.has('GET', '/api/evo-runtime/status')).toBe(true);
    expect(app.has('POST', '/api/evo-runtime/activate')).toBe(true);
  });
});
