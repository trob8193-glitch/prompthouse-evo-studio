import fs from 'fs';
import path from 'path';
import { TRUTH_STATES } from './EvolutionPolicy.js';

const DEFAULT_ROOT = () => path.join(process.cwd(), '.prompthouse-data', 'evolution', 'receipts');

function receiptPath(runId, rootDir = DEFAULT_ROOT()) {
  return path.join(rootDir, `${runId}.json`);
}

export function createEvolutionReceipt({ runId = `evo_${Date.now()}`, objective = 'Self-evolution cycle', rootDir = DEFAULT_ROOT() } = {}) {
  fs.mkdirSync(rootDir, { recursive: true });
  const now = new Date().toISOString();
  const receipt = {
    id: runId,
    objective,
    truthState: TRUTH_STATES.NOT_STARTED,
    createdAt: now,
    updatedAt: now,
    beforeSnapshot: null,
    afterSnapshot: null,
    proposal: null,
    proof: null,
    comparison: null,
    rollback: null,
    approval: null,
    merge: null,
    blockedReasons: [],
    changedFiles: [],
    costSummary: null,
  };
  fs.writeFileSync(receiptPath(runId, rootDir), JSON.stringify(receipt, null, 2), 'utf8');
  return receipt;
}

export function updateEvolutionReceipt(runId, patch = {}, rootDir = DEFAULT_ROOT()) {
  const current = readEvolutionReceipt(runId, rootDir);
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  fs.mkdirSync(rootDir, { recursive: true });
  fs.writeFileSync(receiptPath(runId, rootDir), JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export function readEvolutionReceipt(runId, rootDir = DEFAULT_ROOT()) {
  const file = receiptPath(runId, rootDir);
  if (!fs.existsSync(file)) throw new Error(`Evolution receipt not found: ${runId}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function listEvolutionReceipts({ limit = 50, rootDir = DEFAULT_ROOT() } = {}) {
  if (!fs.existsSync(rootDir)) return [];
  return fs.readdirSync(rootDir)
    .filter(name => name.endsWith('.json'))
    .map(name => {
      try { return JSON.parse(fs.readFileSync(path.join(rootDir, name), 'utf8')); } catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
    .slice(0, limit);
}
