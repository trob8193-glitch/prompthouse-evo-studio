import fs from 'fs';
import path from 'path';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';
import { evaluateEvoLlmDataset } from './EvoLlmEvaluation.js';

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

export function createEvoTrainPlan({ rootDir = process.cwd(), provider = 'local-dataset', objective = 'Improve Evo LLM studio reasoning from validated examples' } = {}) {
  const paths = getEvoLlmOrchestratorPaths({ rootDir });
  ensureDir(paths.plans);
  const manifest = buildEvoLlmDataset({ rootDir });
  const evalReport = evaluateEvoLlmDataset({ rootDir });
  const providerTraining = provider !== 'local-dataset';
  const plan = {
    id: `evo_train_plan_${Date.now()}`,
    createdAt: stamp(),
    objective,
    provider,
    risk: providerTraining ? 'HIGH' : 'LOW',
    truthState: providerTraining ? 'BLOCKED_PROVIDER_TRAINING_REQUIRES_APPROVAL_CREDENTIALS_BUDGET' : 'LOCAL_PIPELINE_PLAN_READY',
    dataset: manifest,
    evaluation: evalReport,
    gates: {
      datasetReady: manifest.validExamples > 0 && manifest.invalidExamples.length === 0,
      evalReady: evalReport.datasetQualityScore >= 90,
      ownerApprovalRequired: true,
      providerCredentialsRequired: providerTraining,
      budgetApprovalRequired: providerTraining
    },
    blockedReasons: providerTraining ? [
      'Provider fine-tuning is disabled until real credentials exist.',
      'Provider fine-tuning is disabled until budget policy is approved.',
      'Provider fine-tuning is disabled until explicit owner approval exists.'
    ] : []
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
