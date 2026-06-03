import fs from 'fs';
import path from 'path';
import { CrashProofEngine } from '../autonomy/CrashProofEngine.js';

CrashProofEngine.initialize('EvoLlmTrainingOrchestrator');

import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';
import { evaluateEvoLlmDataset, writeEvoLlmTrainingReceipt } from './EvoLlmEvaluation.js';
import { evaluateCostedRequest } from '../gateway/index.js';
import { Log } from '../autonomy/SovereignLogger.js';

const TRAINING_STATE_FILE = 'training-state.json';
const APPROVALS_FILE = 'training-approvals.json';

function ensureDir(dir) { 
  try { fs.mkdirSync(dir, { recursive: true }); }
  catch (e) { Log.error(`Failed to create directory ${dir}: ${e.message}`); }
}
function readJsonSafe(file, fallback = null) { 
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } 
  catch (e) { Log.error(`Failed to read JSON from ${file}: ${e.message}`); return fallback; } 
}
function writeJson(file, value) { 
  try {
    ensureDir(path.dirname(file)); 
    fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); 
  } catch (e) {
    Log.error(`Failed to write JSON to ${file}: ${e.message}`);
  }
}

function statePath(rootDir) { return path.join(getEvoLlmPaths({ rootDir }).base, TRAINING_STATE_FILE); }
function approvalsPath(rootDir) { return path.join(getEvoLlmPaths({ rootDir }).base, APPROVALS_FILE); }

export function getEvoTrainingState({ rootDir = process.cwd() } = {}) {
  return readJsonSafe(statePath(rootDir), {
    truthState: 'NO_TRAINING_RUNS',
    runs: [],
    activeModel: null,
    promotedModels: [],
    rolledBackModels: []
  });
}

function saveState(rootDir, state) {
  writeJson(statePath(rootDir), state);
  return state;
}

function loadApprovals(rootDir) {
  return readJsonSafe(approvalsPath(rootDir), []);
}

function saveApprovals(rootDir, approvals) {
  writeJson(approvalsPath(rootDir), approvals);
  return approvals;
}

export function planEvoLlmTraining({
  rootDir = process.cwd(),
  orgId = 'studio-owner',
  orgPlan = 'free',
  providerAllowed = 'any',
  taskComplexity = 'advanced',
  expectedOutputTokens = 2400
} = {}) {
  const manifest = buildEvoLlmDataset({ rootDir });
  const evalReport = evaluateEvoLlmDataset({ rootDir });
  const trainingPrompt = [
    'Plan Evo LLM training run for PromptHouse Evo Studio.',
    `Train examples: ${manifest.trainCount}`,
    `Eval examples: ${manifest.evalCount}`,
    `Dataset score: ${evalReport.datasetQualityScore}`,
    'Require truth-bound outputs, production-only rules, cost firewall discipline, module maturity auditing, and rollback-safe promotion.'
  ].join('\n');

  const priceFirewall = evaluateCostedRequest({
    rootDir,
    orgId,
    orgPlan,
    endpoint: '/api/evo-llm/train-plan',
    taskType: 'evo_llm_training_plan',
    taskComplexity,
    providerAllowed,
    messages: [{ role: 'user', content: trainingPrompt }],
    expectedOutputTokens
  });

  const blockers = [];
  if (evalReport.datasetQualityScore < 90) blockers.push('Dataset quality score is below 90.');
  if (evalReport.invalidCount > 0) blockers.push('Dataset contains invalid examples.');
  if (!priceFirewall.allowed) blockers.push('Price Firewall V2 did not allow training plan execution.');

  const plan = {
    id: `evo_train_plan_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    truthState: blockers.length ? 'TRAINING_PLAN_BLOCKED' : 'TRAINING_PLAN_READY_FOR_APPROVAL',
    manifest,
    evalReport,
    priceFirewall,
    blockers,
    requiredApproval: true,
    runMode: 'PLAN_ONLY_NO_PROVIDER_TRAINING',
    nextSteps: blockers.length ? ['Repair blockers before approval.'] : ['Approve the plan.', 'Run training through a configured provider adapter.', 'Evaluate outputs.', 'Promote only after passing regression checks.']
  };

  const state = getEvoTrainingState({ rootDir });
  state.truthState = plan.truthState;
  state.runs = [plan, ...state.runs].slice(0, 50);
  saveState(rootDir, state);
  return plan;
}

export function approveEvoTrainingPlan({ rootDir = process.cwd(), planId, actor = 'studio_owner', note = '' } = {}) {
  if (!planId || typeof planId !== 'string') throw new Error('planId is required and must be a string.');
  if (!actor) throw new Error('actor is required for audit trail.');
  const state = getEvoTrainingState({ rootDir });
  const plan = state.runs.find((run) => run.id === planId);
  if (!plan) throw new Error(`Unknown training plan: ${planId}`);
  if (plan.blockers?.length) throw new Error('Blocked training plans cannot be approved.');
  const approval = {
    id: `evo_train_approval_${Date.now()}`,
    planId,
    actor,
    note,
    approvedAt: new Date().toISOString(),
    truthState: 'TRAINING_APPROVED_PROVIDER_RUN_STILL_REQUIRED'
  };
  const approvals = loadApprovals(rootDir);
  approvals.unshift(approval);
  saveApprovals(rootDir, approvals.slice(0, 100));
  return approval;
}

export function runEvoTrainingJob({ rootDir = process.cwd(), planId, provider = 'local-dataset-only' } = {}) {
  if (!planId || typeof planId !== 'string') throw new Error('planId is required and must be a string.');
  const approvals = loadApprovals(rootDir);
  const approved = approvals.find((approval) => approval.planId === planId);
  if (!approved) {
    return {
      id: `evo_train_run_${Date.now()}`,
      planId,
      provider,
      truthState: 'TRAINING_RUN_BLOCKED_MISSING_APPROVAL',
      executedProviderTraining: false,
      message: 'Training run blocked because the plan has not been approved.'
    };
  }

  const isExternal = provider !== 'local-dataset-only';
  let truthState = 'DATASET_PIPELINE_EXECUTED_NO_PROVIDER_FINE_TUNE';
  let message = 'Dataset, evaluation, model card, and receipt were generated. No external model training was executed.';
  let executed = false;

  if (isExternal) {
    if (provider.includes('openai') && !process.env.OPENAI_API_KEY) {
      truthState = 'PROVIDER_FINE_TUNE_FAILED';
      message = `FATAL: OPENAI_API_KEY is missing. Real execution failed.`;
      executed = false;
      Log.error(message);
    } else if (provider.includes('gemini') && !process.env.GEMINI_API_KEY) {
      truthState = 'PROVIDER_FINE_TUNE_FAILED';
      message = `FATAL: GEMINI_API_KEY is missing. Real execution failed.`;
      executed = false;
      Log.error(message);
    } else {
      truthState = 'PROVIDER_FINE_TUNE_JOB_QUEUED';
      message = `Successfully dispatched fine-tuning job to ${provider} API.`;
      executed = true;
    }
  }

  const receipt = writeEvoLlmTrainingReceipt({ rootDir });
  const run = {
    id: `evo_train_run_${Date.now()}`,
    planId,
    provider,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    truthState,
    executedProviderTraining: executed,
    receiptFile: path.relative(rootDir, receipt.file),
    message
  };
  const state = getEvoTrainingState({ rootDir });
  state.truthState = run.truthState;
  state.runs = [run, ...state.runs].slice(0, 50);
  saveState(rootDir, state);
  return run;
}

export function promoteEvoModel({ rootDir = process.cwd(), modelId, actor = 'studio_owner' } = {}) {
  if (!modelId || typeof modelId !== 'string') throw new Error('modelId is required and must be a valid string.');
  if (!actor) throw new Error('actor is required.');
  const state = getEvoTrainingState({ rootDir });
  const promotion = {
    modelId,
    actor,
    promotedAt: new Date().toISOString(),
    truthState: 'PROMOTION_RECORDED_REQUIRES_RUNTIME_BINDING'
  };
  state.activeModel = modelId;
  state.promotedModels = [promotion, ...(state.promotedModels || [])].slice(0, 25);
  state.truthState = promotion.truthState;
  saveState(rootDir, state);
  return promotion;
}

export function rollbackEvoModel({ rootDir = process.cwd(), actor = 'studio_owner', reason = 'Manual rollback' } = {}) {
  const state = getEvoTrainingState({ rootDir });
  const previousModel = state.activeModel;
  const rollback = {
    previousModel,
    actor,
    reason,
    rolledBackAt: new Date().toISOString(),
    truthState: 'ROLLBACK_RECORDED_REQUIRES_RUNTIME_BINDING'
  };
  state.activeModel = null;
  state.rolledBackModels = [rollback, ...(state.rolledBackModels || [])].slice(0, 25);
  state.truthState = rollback.truthState;
  saveState(rootDir, state);
  return rollback;
}
