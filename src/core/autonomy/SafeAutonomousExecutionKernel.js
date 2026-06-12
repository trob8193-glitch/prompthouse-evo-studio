import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { evaluateFrontierIntelligenceSafety, writeFrontierSafetyReceipt } from '../evo-llm/FrontierIntelligenceSafetyGate.js';

const VERSION = '1.0.0';

const REQUIRED_STAGES = Object.freeze([
  'observe',
  'plan',
  'safety_gate',
  'prepare_patch',
  'verify',
  'repair_or_hold',
  'receipt',
  'promote_or_rollback'
]);

const DEFAULT_PROOF_COMMANDS = Object.freeze([
  'npm run build',
  'npm run verify:studio',
  'npm run maturity:check',
  'node scripts/audit_intelligence_stack.mjs'
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function paths({ rootDir = process.cwd() } = {}) {
  const base = path.join(rootDir, '.prompthouse-data', 'safe-autonomous-execution');
  return {
    base,
    plans: path.join(base, 'plans.jsonl'),
    receipts: path.join(base, 'receipts'),
    status: path.join(base, 'status.json')
  };
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function appendJsonl(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, 'utf8');
}

function readJsonl(file, limit = 100) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(-limit).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

export function getSafeAutonomousExecutionContract() {
  return {
    name: 'PromptHouse Safe Autonomous Execution Kernel',
    version: VERSION,
    purpose: 'Coordinate autonomous evolution as a proof-gated loop that plans, gates, verifies, receipts, and promotes only after local proof succeeds.',
    stages: REQUIRED_STAGES,
    defaultProofCommands: DEFAULT_PROOF_COMMANDS,
    policy: {
      arbitraryCommandsBlocked: true,
      safetyGateRequired: true,
      rollbackRequired: true,
      localVerificationRequired: true,
      receiptsRequired: true,
      promotionWithoutProofBlocked: true
    }
  };
}

export function createSafeAutonomousExecutionPlan({ rootDir = process.cwd(), request = {} } = {}) {
  const safeRequest = {
    mode: 'safe-autonomous-execution-plan',
    planOnly: true,
    highRisk: true,
    autonomous: true,
    summary: request.summary || 'Create safe autonomous execution plan.',
    approvalRef: request.approvalRef || process.env.PH_EVO_APPROVAL_REF || 'local-approval-required',
    workspaceScope: request.workspaceScope || 'repo',
    tests: Array.isArray(request.tests) && request.tests.length ? request.tests : [...DEFAULT_PROOF_COMMANDS],
    rollbackPlan: request.rollbackPlan || 'Revert branch or restore prior commit before promotion.',
    receiptPlan: request.receiptPlan || 'Write safety, execution, verification, and promotion receipts.',
    humanReviewRequired: request.humanReviewRequired !== false
  };
  const decision = evaluateFrontierIntelligenceSafety({ rootDir, request: safeRequest });
  const safetyReceipt = writeFrontierSafetyReceipt({ rootDir, decision, payload: safeRequest });
  const plan = {
    id: `safe_auto_exec_${Date.now()}_${hash(JSON.stringify(safeRequest))}`,
    createdAt: new Date().toISOString(),
    truthState: decision.allowed ? 'SAFE_AUTONOMOUS_EXECUTION_PLAN_READY' : 'SAFE_AUTONOMOUS_EXECUTION_BLOCKED',
    allowed: decision.allowed,
    stages: REQUIRED_STAGES.map((stage, index) => ({ index: index + 1, stage, status: stage === 'safety_gate' ? decision.truthState : 'planned' })),
    proofCommands: safeRequest.tests,
    rollbackPlan: safeRequest.rollbackPlan,
    receiptPlan: safeRequest.receiptPlan,
    promotionGate: {
      requiresAllProofCommandsPassed: true,
      requiresReceipts: true,
      requiresHumanReviewForHighRisk: true,
      blockedUntilLocalProof: true
    },
    decision,
    safetyReceipt
  };
  const store = paths({ rootDir });
  appendJsonl(store.plans, plan);
  writeJson(store.status, getSafeAutonomousExecutionStatus({ rootDir }));
  return plan;
}

export function writeSafeAutonomousExecutionReceipt({ rootDir = process.cwd(), type = 'safe_autonomous_execution_receipt', payload = {} } = {}) {
  const store = paths({ rootDir });
  ensureDir(store.receipts);
  const receipt = {
    id: `safe_auto_exec_receipt_${Date.now()}_${hash(JSON.stringify(payload))}`,
    type,
    createdAt: new Date().toISOString(),
    truthState: 'SAFE_AUTONOMOUS_EXECUTION_RECEIPT_WRITTEN',
    payload
  };
  const file = path.join(store.receipts, `${receipt.id}.json`);
  writeJson(file, receipt);
  return { file: path.relative(rootDir, file), receipt };
}

export function getSafeAutonomousExecutionStatus({ rootDir = process.cwd(), limit = 25 } = {}) {
  const store = paths({ rootDir });
  const plans = readJsonl(store.plans, limit);
  const ready = plans.filter((plan) => plan.allowed).length;
  const blocked = plans.length - ready;
  return {
    success: true,
    version: VERSION,
    truthState: ready ? 'SAFE_AUTONOMOUS_EXECUTION_READY_FOR_LOCAL_PROOF' : plans.length ? 'SAFE_AUTONOMOUS_EXECUTION_HAS_BLOCKS' : 'SAFE_AUTONOMOUS_EXECUTION_WAITING_FOR_PLAN',
    planCount: plans.length,
    readyCount: ready,
    blockedCount: blocked,
    stages: REQUIRED_STAGES,
    defaultProofCommands: DEFAULT_PROOF_COMMANDS,
    files: {
      plans: path.relative(rootDir, store.plans),
      receipts: path.relative(rootDir, store.receipts),
      status: path.relative(rootDir, store.status)
    }
  };
}
