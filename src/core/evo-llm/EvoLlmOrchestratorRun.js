import fs from 'fs';
import path from 'path';
import { writeEvoLlmTrainingReceipt } from './EvoLlmEvaluation.js';
import { getEvoLlmOrchestratorPaths } from './EvoLlmOrchestratorPlan.js';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { evaluateEvoProviderGate, fetchProviderFineTuneJob, submitProviderFineTuneJob } from './EvoLlmProviderAdapter.js';
import { evaluateEvoLlmTrainingCostGate } from './EvoLlmCostGate.js';

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

function persistRun(paths, rootDir, plan, run) {
  const file = path.join(paths.runs, `${run.id}.json`);
  writeJson(file, run);
  writeJson(paths.status, {
    updatedAt: stamp(),
    lastPlanId: plan?.id || run.planId,
    lastRunId: run.id,
    truthState: run.truthState,
    provider: run.provider,
    risk: plan?.risk || run.risk || 'UNKNOWN'
  });
  return { file, run };
}

function providerBlockers({ plan, approval, providerGate, costGate }) {
  return [
    ...(plan.blockedReasons || []),
    approval ? null : 'Missing explicit owner approval.',
    !providerGate.allowed ? providerGate.blockedReasons : null,
    !costGate.allowed ? 'Cost firewall blocked provider training.' : null
  ].flat().filter(Boolean);
}

export async function runEvoTrainPlan({
  rootDir = process.cwd(),
  planId,
  providerApiKey = null,
  maxTrainingBudgetUsd = null,
  allowProviderTraining = null,
  fetchImpl = globalThis.fetch
} = {}) {
  if (!planId) throw new Error('planId is required to run a training plan.');
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const plan = readJsonSafe(path.join(paths.plans, `${planId}.json`), null);
  if (!plan) throw new Error(`Unknown Evo train plan: ${planId}`);
  const approval = findApproval(paths, planId);
  ensureDir(paths.runs);

  if (plan.provider !== 'local-dataset') {
    const providerGate = evaluateEvoProviderGate({
      provider: plan.provider,
      model: plan.model,
      providerApiKey,
      maxTrainingBudgetUsd,
      allowProviderTraining
    });
    const costGate = evaluateEvoLlmTrainingCostGate({
      provider: plan.provider,
      examples: Number(plan.dataset?.trainCount || 0) + Number(plan.dataset?.evalCount || 0)
    });
    const blockedReasons = providerBlockers({ plan, approval, providerGate, costGate });
    if (blockedReasons.length) {
      const run = {
        id: `evo_train_run_${Date.now()}`,
        planId,
        provider: plan.provider,
        model: plan.model || providerGate.model,
        createdAt: stamp(),
        truthState: 'BLOCKED_PROVIDER_TRAINING_NOT_EXECUTED',
        executedProviderTraining: false,
        providerGate,
        costGate,
        blockedReasons
      };
      return persistRun(paths, rootDir, plan, run);
    }

    const receipt = writeEvoLlmTrainingReceipt({ rootDir });
    const evoPaths = getEvoLlmPaths({ rootDir });
    try {
      const providerResult = await submitProviderFineTuneJob({
        provider: plan.provider,
        apiKey: providerApiKey || process.env.OPENAI_API_KEY,
        model: plan.model || providerGate.model,
        trainJsonl: evoPaths.trainJsonl,
        evalJsonl: evoPaths.evalJsonl,
        suffix: 'prompthouse-evo',
        fetchImpl
      });
      const run = {
        id: `evo_train_run_${Date.now()}`,
        planId,
        provider: plan.provider,
        model: providerResult.model || plan.model || providerGate.model,
        createdAt: stamp(),
        truthState: providerResult.truthState,
        executedProviderTraining: true,
        providerJobId: providerResult.providerJobId,
        providerStatus: providerResult.status,
        fineTunedModel: providerResult.fineTunedModel,
        trainingFileId: providerResult.trainingFileId,
        validationFileId: providerResult.validationFileId,
        receiptFile: path.relative(rootDir, receipt.file),
        outputs: receipt.receipt
      };
      return persistRun(paths, rootDir, plan, run);
    } catch (error) {
      const run = {
        id: `evo_train_run_${Date.now()}`,
        planId,
        provider: plan.provider,
        model: plan.model || providerGate.model,
        createdAt: stamp(),
        truthState: 'PROVIDER_FINE_TUNE_SUBMISSION_FAILED',
        executedProviderTraining: false,
        receiptFile: path.relative(rootDir, receipt.file),
        error: error.message || String(error)
      };
      return persistRun(paths, rootDir, plan, run);
    }
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
  return persistRun(paths, rootDir, plan, run);
}

export async function syncEvoTrainRun({ rootDir = process.cwd(), runId, fetchImpl = globalThis.fetch } = {}) {
  if (!runId) throw new Error('runId is required to sync a training run.');
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const runFile = path.join(paths.runs, `${runId}.json`);
  const run = readJsonSafe(runFile, null);
  if (!run) throw new Error(`Unknown Evo training run: ${runId}`);
  if (!run.providerJobId || run.provider === 'local-dataset') {
    return { file: runFile, run: { ...run, truthState: run.truthState || 'LOCAL_RUN_NO_PROVIDER_SYNC_REQUIRED' } };
  }
  const providerResult = await fetchProviderFineTuneJob({
    provider: run.provider,
    providerJobId: run.providerJobId,
    fetchImpl
  });
  const next = {
    ...run,
    syncedAt: stamp(),
    providerStatus: providerResult.status,
    fineTunedModel: providerResult.fineTunedModel || run.fineTunedModel || null,
    truthState: providerResult.fineTunedModel ? 'PROVIDER_FINE_TUNED_WEIGHTS_READY' : 'PROVIDER_FINE_TUNE_JOB_PENDING'
  };
  writeJson(runFile, next);
  writeJson(paths.status, {
    updatedAt: stamp(),
    lastRunId: next.id,
    truthState: next.truthState,
    provider: next.provider,
    activeProviderJobId: next.providerJobId
  });
  return { file: runFile, run: next };
}

export function promoteEvoModelVersion({ rootDir = process.cwd(), runId, actor = 'studio_owner' } = {}) {
  if (!runId) throw new Error('runId is required to promote a version.');
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const run = readJsonSafe(path.join(paths.runs, `${runId}.json`), null);
  if (!run) throw new Error(`Unknown Evo training run: ${runId}`);
  const localDatasetRun = run.truthState === 'LOCAL_DATASET_PIPELINE_EXECUTED_NO_MODEL_WEIGHTS_TRAINED';
  const providerWeightsRun = run.truthState === 'PROVIDER_FINE_TUNED_WEIGHTS_READY' && Boolean(run.fineTunedModel);
  if (!localDatasetRun && !providerWeightsRun) {
    throw new Error('Only completed local dataset runs or provider runs with trained weights can be promoted.');
  }
  ensureDir(paths.versions);
  const version = {
    id: `evo_llm_version_${Date.now()}`,
    runId,
    promotedAt: stamp(),
    promotedBy: actor,
    provider: run.provider,
    modelId: run.fineTunedModel || null,
    truthState: providerWeightsRun ? 'PROVIDER_TRAINED_WEIGHTS_PROMOTED' : 'DATASET_VERSION_PROMOTED_NOT_MODEL_WEIGHTS',
    note: providerWeightsRun
      ? 'This promotes provider-trained fine-tuned model weights reported by the provider.'
      : 'This promotes a validated dataset/model-card package, not external model weights.'
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
