import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import { selectAutonomousObjective } from '../src/core/evolution/AutonomousObjectiveSelector.js';

function tempRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ph-selector-'));
}

function write(rootDir, relPath, content) {
  const file = path.join(rootDir, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

describe('autonomous objective selector breadth', () => {
  const created = [];

  afterEach(() => {
    for (const dir of created.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
  });

  it('detects missing AI self-training runtime routes', () => {
    const rootDir = tempRoot();
    created.push(rootDir);
    write(rootDir, 'scripts/ai_self_train.mjs', 'fetch("/api/training-capture"); fetch("/api/evo-runtime/activate");');
    write(rootDir, 'server/routes/studio-core.routes.js', 'app.get("/status", handler);');

    const selected = selectAutonomousObjective({ rootDir });
    expect(selected.category).toBe('training_runtime');
  });

  it('can prioritize quarantined source cleanup as a broader integrity objective', () => {
    const rootDir = tempRoot();
    created.push(rootDir);
    fs.mkdirSync(path.join(rootDir, '_quarantine'), { recursive: true });

    const selected = selectAutonomousObjective({ rootDir, focusAreas: ['source_integrity'] });
    expect(selected.category).toBe('source_integrity');
  });
});
