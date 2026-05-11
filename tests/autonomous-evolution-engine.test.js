import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  appendFailureMemory,
  appendRealityReceipt,
  buildCapabilityGraph,
  buildEvolutionReplayTheater,
  buildNightforgeChallengeSnapshot,
  buildRecoveryPlan,
  enforceEvolutionBudget,
  loadRealityReceipts,
  readFailureMemory,
  runPatchTournament
} from '../src/core/evolution/autonomous-evolution-engine.js';

const tempDirs = [];

function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), 'ph-evo-autonomy-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  }
});

describe('autonomous evolution engine', () => {
  it('builds a capability graph from the real workspace', () => {
    const graph = buildCapabilityGraph({ workspaceRoot: process.cwd() });

    expect(graph.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(graph.summary.modules).toBeGreaterThan(0);
    expect(graph.summary.routes).toBeGreaterThan(0);
  });

  it('enforces budget constraints on patch size', () => {
    const original = ['line1', 'line2', 'line3'].join('\n');
    const candidate = new Array(400).fill('x').join('\n');
    const result = enforceEvolutionBudget({
      originalCode: original,
      candidateCode: candidate,
      budget: { maxChangedLines: 20, maxCharDelta: 120 }
    });

    expect(result.success).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('runs a patch tournament and selects the strongest live candidate', async () => {
    const tournament = await runPatchTournament({
      originalCode: 'const value = 1;\n',
      candidates: [
        { id: 'a', label: 'A', source: 'test', code: 'const value = 1;\n' },
        { id: 'b', label: 'B', source: 'test', code: 'const value = 2;\n' }
      ],
      evaluateCandidate: async (candidate) => ({
        success: candidate.id === 'b',
        audit: { passed: candidate.id === 'b' },
        syntaxRun: { success: true }
      })
    });

    expect(tournament.winner?.id).toBe('b');
    expect(tournament.ranking[0].id).toBe('b');
  });

  it('records failure memory and builds a recovery plan from repeated stages', () => {
    const dir = makeTempDir();
    const file = join(dir, 'failure-memory.jsonl');

    appendFailureMemory(file, { filePath: 'src/App.jsx', stage: 'merge', error: 'merge failed' });
    appendFailureMemory(file, { filePath: 'src/App.jsx', stage: 'merge', error: 'merge failed again' });
    appendFailureMemory(file, { filePath: 'src/App.jsx', stage: 'auto_test_build', error: 'test failed' });

    const failures = readFailureMemory(file, { filePathFilter: 'src/App.jsx', limit: 10 });
    const plan = buildRecoveryPlan(failures);

    expect(failures).toHaveLength(3);
    expect(plan.topStage).toBe('merge');
    expect(plan.repeatedFailureCount).toBe(2);
  });

  it('stores reality receipts and replays receipt theater', () => {
    const dir = makeTempDir();
    const file = join(dir, 'reality-receipts.jsonl');
    appendRealityReceipt(file, { type: 'boss_fight', status: 'verified', detail: 'all passed' });
    appendRealityReceipt(file, { type: 'boss_fight', status: 'blocked', detail: 'build failed' });

    const receipts = loadRealityReceipts(file, 10);
    const replay = buildEvolutionReplayTheater([
      { id: 'run1', status: 'verified', stages: [{ id: 'proposal' }, { id: 'merge' }] },
      { id: 'run2', status: 'blocked', stages: [{ id: 'proposal' }, { id: 'live_run' }] }
    ]);

    expect(receipts).toHaveLength(2);
    expect(replay.total).toBe(2);
    expect(replay.statusMix.verified).toBe(1);
    expect(replay.statusMix.blocked).toBe(1);
  });

  it('derives a real nightforge challenge target from live metrics', () => {
    const snapshot = buildNightforgeChallengeSnapshot({
      nightforgeState: { totalCycles: 10, successfulCycles: 5 },
      nightforgeMetrics: { cyclesToday: 1, externalCallsToday: 10, cacheHitsToday: 2 },
      receipts: [{ status: 'verified' }]
    });

    expect(snapshot.activeChallenge).toBeTruthy();
    expect(snapshot.kpi.stability).toBe(50);
    expect(snapshot.kpi.cyclesToday).toBe(1);
  });
});

