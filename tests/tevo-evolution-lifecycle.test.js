import { describe, expect, it } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { rollbackToBaseline, learnFromCycle, getEvolutionEvidenceMemory } from '../src/core/evolution/EvolutionLifecycleEngine.js';

describe('TEVO evidence-driven evolution lifecycle', () => {
  it('restores a reversible snapshot and preserves the baseline hash', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tevo-evo-'));
    const target = path.join(root, 'target.txt');
    fs.writeFileSync(target, 'baseline');
    const snapshot = path.join(root, 'snapshot.txt');
    fs.copyFileSync(target, snapshot);

    fs.writeFileSync(target, 'candidate');

    const result = rollbackToBaseline({
      rootDir: root,
      runId: 'test-run',
      baseline: {
        targetFile: 'target.txt',
        targetHash: '9c9a2e5c0f7f8f8f4f1a2d7b8d8c4c7d8b0c4b5f0d4f0b5f7f2f8c2d9e7a5b1',
        snapshotPath: snapshot
      }
    });

    expect(result.rolledBack).toBe(false);
    expect(fs.readFileSync(target, 'utf8')).toBe('baseline');
  });

  it('records provenance and creates a regression defense', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tevo-memory-'));
    const run = { id: 'run-1', truthState: 'REGRESSION_ROLLED_BACK' };
    const baseline = {
      targetFile: 'src/App.jsx',
      targetHash: 'baseline-hash',
      proof: { passed: true, commandCount: 1 }
    };
    const verification = {
      candidateHash: 'candidate-hash',
      proof: { passed: false, commandCount: 1 },
      comparison: { regression: true, promotionEligible: false }
    };

    const lesson = learnFromCycle({
      rootDir: root,
      run,
      baseline,
      verification,
      lesson: 'Regression becomes a future defense.'
    });

    const memory = getEvolutionEvidenceMemory(root);
    expect(lesson.provenance.runId).toBe('run-1');
    expect(memory.lessons).toHaveLength(1);
    expect(memory.regressionDefenses).toHaveLength(1);
  });
});
