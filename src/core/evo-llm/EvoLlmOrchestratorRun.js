import fs from 'fs';
import path from 'path';
import { writeEvoLlmTrainingReceipt } from './EvoLlmEvaluation.js';
import { getEvoLlmOrchestratorPaths } from './EvoLlmOrchestratorPlan.js';

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function writeJson(file, value) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }
function readJsonSafe(file, fallback = null) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }
function stamp() { return new Date().toISOString(); }

function findApproval(paths, planId) {
  if (!fs.existsSync(paths.approvals)) return null;
  return fs.readdirSync(paths.approvals)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJsonSafe(path.join(paths.approvals, file), null))
    .filter(Boolean)
    .find((approval) => approval.planId === planId) || null;
}

export function runEvoTrainPlan({ rootDir = process.cwd(), planId } = {}) {
  if (!planId) throw new Error('planId is required to run a training plan.');
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const plan = readJsonSafe(path.join(paths.plans, `${planId}.json`), null);
  if (!plan) throw new Error(`Unknown Evo train plan: ${planId}`);
  const approval = findApproval(paths, planId);
  ensureDir(paths.runs);

  if (plan.provider !== 'local-dataset') {
    const run = {
      id: `evo_train_run_${Date.now()}`,
      planId,
      provider: plan.provider,
      createdAt: stamp(),
      truthState: 'BLOCKED_PROVIDER_TRAINING_NOT_EXECUTED',
      blockedReasons: [
        ...plan.blockedReasons,
        approval ? 'Approval exists, but credential and budget checks are still required.' : 'Missing explicit owner approval.'
      ]
    };
    const file = path.join(paths.runs, `${run.id}.json`);
    writeJson(file, run);
    writeJson(paths.status, { updatedAt: stamp(), lastPlanId: planId, lastRunId: run.id, truthState: run.truthState, provider: plan.provider, risk: plan.risk });
    return { file, run };
  }

  if (!approval) throw new Error('Local dataset training plan requires explicit approval before run.');
  const receipt = writeEvoLlmTrainingReceipt({ rootDir });
  const run = {
    id: `evo_train_run_${Date.now()}`,
    planId,
    provider: plan.provider,
    createdAt: stamp(),
    truthState: 'LOCAL_DATASET_PIPELINE_EXECUTED_NO_MODEL_WEIGHTS_TRAINED',
    receiptFile: path.relative(rootDir, receipt.file),
    outputs: receipt.receipt
  };
  const file = path.join(paths.runs, `${run.id}.json`);
  writeJson(file, run);
  writeJson(paths.status, { updatedAt: stamp(), lastPlanId: planId, lastRunId: run.id, truthState: run.truthState, provider: plan.provider, risk: plan.risk });
  return { file, run };
}

export function promoteEvoModelVersion({ rootDir = process.cwd(), runId, actor = 'studio_owner' } = {}) {
  if (!runId) throw new Error('runId is required to promote a version.');
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const run = readJsonSafe(path.join(paths.runs, `${runId}.json`), null);
  if (!run) throw new Error(`Unknown Evo training run: ${runId}`);
  if (run.truthState !== 'LOCAL_DATASET_PIPELINE_EXECUTED_NO_MODEL_WEIGHTS_TRAINED') throw new Error('Only completed local dataset pipeline runs can be promoted.');
  ensureDir(paths.versions);
  const version = {
    id: `evo_llm_version_${Date.now()}`,
    runId,
    promotedAt: stamp(),
    promotedBy: actor,
    truthState: 'DATASET_VERSION_PROMOTED_NOT_MODEL_WEIGHTS',
    note: 'This promotes a validated dataset/model-card package, not external model weights.'
  };
  const file = path.join(paths.versions, `${version.id}.json`);
  writeJson(file, version);
  writeJson(paths.activeVersion, version);
  writeJson(paths.status, { updatedAt: stamp(), lastRunId: runId, activeVersionId: version.id, truthState: version.truthState });
  return { file, version };
}

export function rollbackEvoModelVersion({ rootDir = process.cwd(), actor = 'studio_owner', reason = 'Manual rollback' } = {}) {
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const current = readJsonSafe(paths.activeVersion, null);
  const rollback = {
    id: `evo_llm_rollback_${Date.now()}`,
    rolledBackAt: stamp(),
    actor,
    reason,
    previousActiveVersion: current,
    truthState: 'ACTIVE_DATASET_VERSION_ROLLED_BACK'
  };
  ensureDir(paths.versions);
  const file = path.join(paths.versions, `${rollback.id}.json`);
  writeJson(file, rollback);
  if (fs.existsSync(paths.activeVersion)) fs.unlinkSync(paths.activeVersion);
  writeJson(paths.status, { updatedAt: stamp(), truthState: rollback.truthState, lastRollbackId: rollback.id });
  return { file, rollback };
}
