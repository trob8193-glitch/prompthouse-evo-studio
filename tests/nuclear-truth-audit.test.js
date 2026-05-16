import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { runNuclearTruthAudit } from '../src/core/audit/NuclearTruthAudit.js';

const tempDirs = [];

function createTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-nuclear-audit-'));
  tempDirs.push(dir);
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
  return dir;
}

afterEach(() => {
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup.
    }
  }
});

describe('runNuclearTruthAudit', () => {
  it('flags broken API wires and unresolved TODO debt', () => {
    const root = createTempProject();
    fs.writeFileSync(
      path.join(root, 'promptbridge-server.js'),
      "app.get('/api/health', () => {});\n",
      'utf8'
    );
    fs.writeFileSync(
      path.join(root, 'src', 'App.jsx'),
      `
      export function App() {
        // TODO: remove temp wire
        return <button>Unwired</button>;
      }
      fetch('/api/not-real', { method: 'POST' });
      `,
      'utf8'
    );

    const report = runNuclearTruthAudit(root);
    expect(report.summary.brokenWires).toBe(1);
    expect(report.truthState).toBe('blocked');
    expect(report.findings.some((item) => item.severity === 'critical')).toBe(true);
    expect(report.findings.some((item) => item.message.includes('TODO/FIXME'))).toBe(true);
  });

  it('recognizes dynamic backend route matches', () => {
    const root = createTempProject();
    fs.writeFileSync(
      path.join(root, 'promptbridge-server.js'),
      "app.delete('/api/items/:id', () => {});\n",
      'utf8'
    );
    fs.writeFileSync(
      path.join(root, 'src', 'client.jsx'),
      `
      export const call = async () => {
        return fetch('http://127.0.0.1:3001/api/items/abc123', { method: 'DELETE' });
      };
      `,
      'utf8'
    );

    const report = runNuclearTruthAudit(root);
    expect(report.summary.brokenWires).toBe(0);
  });
});
