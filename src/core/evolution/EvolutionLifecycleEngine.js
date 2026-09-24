import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { runProofCommands } from './ProofRunner.js';

const DATA_DIR = (rootDir) => path.join(rootDir, '.prompthouse-data', 'evolution');
const MEMORY_FILE = (rootDir) => path.join(DATA_DIR(rootDir), 'evidence_memory.json');
const SNAPSHOT_DIR = (rootDir, runId) => path.join(DATA_DIR(rootDir), 'snapshots', runId);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function loadMemory(rootDir) {
  const file = MEMORY_FILE(rootDir);
  if (!fs.existsSync(file)) {
    return {
      schemaVersion: 1,
      lessons: [],
      regressionDefenses: [],
      promotionHistory: []
    };
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return { schemaVersion: 1, lessons: [], regressionDefenses: [], promotionHistory: [] }; }
}

function saveMemory(rootDir, memory) {
  ensureDir(DATA_DIR(rootDir));
  fs.writeFileSync(MEMORY_FILE(rootDir), JSON.stringify(memory, null, 2), 'utf8');
}

function gitHead(rootDir) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: rootDir, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function resolveTarget(rootDir, targetFile) {
  const root = path.resolve(rootDir);
  const absolute = path.resolve(rootDir, targetFile);
  if (!absolute.startsWith(root + path.sep)) throw new Error('Target file escapes workspace');
  return absolute;
}

function fileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return sha256(fs.readFileSync(filePath));
}

export async function captureBaseline({ rootDir, runId, targetFile, commands = ['npm run build'] }) {
  const startedAt = new Date().toISOString();
  const absolute = resolveTarget(rootDir, targetFile);

  const snapshotDir = SNAPSHOT_DIR(rootDir, runId);
  ensureDir(snapshotDir);
  const snapshotPath = path.join(snapshotDir, 'target.before');
  if (fs.existsSync(absolute)) fs.copyFileSync(absolute, snapshotPath);

  const proof = await runProofCommands({
    workspaceDir: rootDir,
    commands,
    receiptDir: path.join(snapshotDir, 'baseline-proof')
  });

  return {
    phase: 'BASELINE',
    runId,
    capturedAt: startedAt,
    gitHead: gitHead(rootDir),
    targetFile,
    targetHash: fileHash(absolute),
    snapshotPath: fs.existsSync(snapshotPath) ? snapshotPath : null,
    proof: normalizeProof(proof)
  };
}

function normalizeProof(proof) {
  return {
    passed: proof?.passed === true,
    commandCount: Array.isArray(proof?.results) ? proof.results.length : Number(proof?.commandCount || 0),
    results: Array.isArray(proof?.results) ? proof.results.map(r => ({
      command: r.command || r.cmd || null,
      passed: r.passed === true,
      exitCode: r.exitCode ?? r.code ?? null
    })) : []
  };
}

export async function verifyPromotion({ rootDir, runId, baseline, targetFile, commands = ['npm run build'] }) {
  const startedAt = new Date().toISOString();
  const absolute = resolveTarget(rootDir, targetFile);
  const snapshotDir = SNAPSHOT_DIR(rootDir, runId);

  const proof = await runProofCommands({
    workspaceDir: rootDir,
    commands,
    receiptDir: path.join(snapshotDir, 'promotion-proof')
  });

  const afterHash = fileHash(absolute);
  const unchanged = baseline.targetHash === afterHash;
  const buildPassed = proof?.passed === true;
  const baselinePassed = baseline?.proof?.passed === true;

  const comparison = {
    baselinePassed,
    candidatePassed: buildPassed,
    changed: !unchanged,
    improved: buildPassed && baselinePassed && !unchanged,
    regression: baselinePassed && !buildPassed,
    promotionEligible: baselinePassed && buildPassed && !unchanged,
    basis: 'comparison_of_real_verification_receipts_and_target_hashes'
  };

  return {
    phase: 'PROMOTION_CHECK',
    runId,
    verifiedAt: startedAt,
    gitHead: gitHead(rootDir),
    targetFile,
    baselineHash: baseline.targetHash,
    candidateHash: afterHash,
    proof: normalizeProof(proof),
    comparison
  };
}

export function rollbackToBaseline({ rootDir, runId, baseline }) {
  const absolute = resolveTarget(rootDir, baseline.targetFile);
  if (!baseline.snapshotPath || !fs.existsSync(baseline.snapshotPath)) {
    return { rolledBack: false, reason: 'No snapshot available' };
  }
  fs.copyFileSync(baseline.snapshotPath, absolute);
  return {
    rolledBack: fileHash(absolute) === baseline.targetHash,
    targetFile: baseline.targetFile,
    restoredHash: fileHash(absolute)
  };
}

export function learnFromCycle({ rootDir, run, baseline, verification, lesson }) {
  const memory = loadMemory(rootDir);
  const record = {
    id: crypto.randomUUID(),
    runId: run.id,
    recordedAt: new Date().toISOString(),
    provenance: {
      source: 'tevo_evolution_cycle',
      runId: run.id,
      targetFile: baseline.targetFile,
      baselineHash: baseline.targetHash,
      candidateHash: verification?.candidateHash || null,
      baselineProof: baseline.proof,
      candidateProof: verification?.proof || null
    },
    outcome: verification?.comparison || { regression: run.truthState === 'ERROR' },
    lesson
  };

  memory.lessons = [...memory.lessons, record].slice(-500);

  if (record.outcome.regression) {
    memory.regressionDefenses = [...memory.regressionDefenses, {
      id: crypto.randomUUID(),
      createdAt: record.recordedAt,
      signature: sha256(JSON.stringify({
        targetFile: baseline.targetFile,
        candidateHash: verification?.candidateHash,
        proof: verification?.proof
      })),
      defense: 'Require baseline/promotion proof and rollback before accepting this class of change.',
      provenanceId: record.id
    }].slice(-500);
  }

  if (record.outcome.promotionEligible) {
    memory.promotionHistory = [...memory.promotionHistory, {
      runId: run.id,
      promotedAt: record.recordedAt,
      targetFile: baseline.targetFile,
      baselineHash: baseline.targetHash,
      promotedHash: verification.candidateHash
    }].slice(-500);
  }

  saveMemory(rootDir, memory);
  return record;
}

export function getEvolutionEvidenceMemory(rootDir) {
  return loadMemory(rootDir);
}
