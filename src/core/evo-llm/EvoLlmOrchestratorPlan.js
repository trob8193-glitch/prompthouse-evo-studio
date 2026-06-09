import fs from 'fs';
import path from 'path';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';
import { evaluateEvoLlmDataset } from './EvoLlmEvaluation.js';
import { evaluateEvoProviderGate } from './EvoLlmProviderAdapter.js';
import { evaluateEvoLlmTrainingCostGate } from './EvoLlmCostGate.js';

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function writeJson(file, value) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }
function readJsonSafe(file, fallback = null) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }
function stamp() { return new Date().toISOString(); }

export function getEvoLlmOrchestratorPaths({ rootDir = process.cwd() } = {}) {
  const base = path.join(getEvoLlmPaths({ rootDir }).base, 'orchestrator');
  return {
    base,
    plans: path.join(base, 'plans'),
    approvals: path.join(base, 'approvals'),
    runs: path.join(base, 'runs'),
    versions: path.join(base, 'versions'),
    activeVersion: path.join(base, 'active-version.json'),
    status: path.join(base, 'status.json')
  };
}

export function createEvoTrainPlan({
  rootDir = process.cwd(),
  provider = 'local-dataset',
  objective = 'Improve Evo LLM studio reasoning from validated examples',
  model = null
} = {}) {
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  ensureDir(paths.plans);
  const manifest = buildEvoLlmDataset({ rootDir });
  const evalReport = evaluateEvoLlmDataset({ rootDir });
  const providerTraining = provider !== 'local-dataset';
  const providerGate = evaluateEvoProviderGate({ provider, model });
  const costGate = evaluateEvoLlmTrainingCostGate({
    provider,
    examples: manifest.trainCount + manifest.evalCount
  });
  const datasetReady = manifest.validExamples > 0 && manifest.invalidExamples.length === 0;
  const evalReady = evalReport.datasetQualityScore >= 90;
  const blockedReasons = [
    !datasetReady ? 'Dataset must contain at least one valid example and no invalid examples.' : null,
    !evalReady ? 'Dataset evaluation score must be at least 90 before training.' : null,
    providerTraining && !providerGate.allowed ? providerGate.blockedReasons : null,
    providerTraining && !costGate.allowed ? 'Cost firewall blocked provider training.' : null
  ].flat().filter(Boolean);
  const truthState = blockedReasons.length
    ? (providerTraining ? 'PROVIDER_TRAINING_PLAN_BLOCKED' : 'LOCAL_PIPELINE_PLAN_BLOCKED')
    : (providerTraining ? 'PROVIDER_TRAINING_PLAN_READY_FOR_APPROVAL' : 'LOCAL_PIPELINE_PLAN_READY');
  const plan = {
    id: `evo_train_plan_${Date.now()}`,
    createdAt: stamp(),
    objective,
    provider,
    model: providerTraining ? providerGate.model : null,
    risk: providerTraining ? 'HIGH' : 'LOW',
    truthState,
    dataset: manifest,
    evaluation: evalReport,
    gates: {
      datasetReady,
      evalReady,
      ownerApprovalRequired: true,
      providerCredentialsRequired: providerTraining,
      budgetApprovalRequired: providerTraining,
      providerGate,
      costGate
    },
    blockedReasons,
    nextActions: blockedReasons.length
      ? ['Resolve blockedReasons before approval or provider execution.']
      : providerTraining
        ? ['Approve with scope=provider-training.', 'Run the provider fine-tune job.', 'Sync the provider run until fine_tuned_model exists.', 'Promote trained weights only after the provider reports completion.']
        : ['Approve with scope=dataset-only.', 'Run the local dataset pipeline.', 'Promote the validated dataset/model-card package.']
  };
  const file = path.join(paths.plans, `${plan.id}.json`);
  writeJson(file, plan);
  writeJson(paths.status, { updatedAt: stamp(), lastPlanId: plan.id, truthState: plan.truthState, provider, risk: plan.risk });
  return { file, plan };
}

export function approveEvoTrainPlan({ rootDir = process.cwd(), planId, actor = 'studio_owner', scope = 'dataset-only' } = {}) {
  if (!planId) throw new Error('planId is required for approval.');
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const plan = readJsonSafe(path.join(paths.plans, `${planId}.json`), null);
  if (!plan) throw new Error(`Unknown Evo train plan: ${planId}`);
  if (plan.provider !== 'local-dataset' && scope !== 'provider-training') throw new Error('Provider training requires scope=provider-training.');
  ensureDir(paths.approvals);
  const approval = {
    id: `evo_train_approval_${Date.now()}`,
    planId,
    actor,
    scope,
    approvedAt: stamp(),
    truthState: plan.provider === 'local-dataset' ? 'LOCAL_DATASET_APPROVED' : 'PROVIDER_TRAINING_APPROVED_PENDING_CREDENTIAL_AND_BUDGET_CHECKS'
  };
  const file = path.join(paths.approvals, `${approval.id}.json`);
  writeJson(file, approval);
  writeJson(paths.status, { updatedAt: stamp(), lastPlanId: planId, lastApprovalId: approval.id, truthState: approval.truthState, provider: plan.provider, risk: plan.risk });
  return { file, approval };
}

export function getEvoTrainStatus({ rootDir = process.cwd() } = {}) {
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  const status = readJsonSafe(paths.status, { truthState: 'NO_TRAINING_PLAN_CREATED', updatedAt: null });
  const activeVersion = readJsonSafe(paths.activeVersion, null);
  return { ...status, activeVersion };
}
