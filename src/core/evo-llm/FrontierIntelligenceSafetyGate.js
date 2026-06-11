import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { sanitizeSignalPayload } from './EvoSignalLearningBridge.js';

const VERSION = '1.0.0';

const DEFAULT_REQUIRED_CHECKS = Object.freeze([
  'explicitApproval',
  'budgetLimit',
  'workspaceScope',
  'testPlan',
  'rollbackPlan',
  'receiptPlan',
  'noSecrets',
  'humanReviewForHighRisk'
]);

const HIGH_RISK_KEYWORDS = [
  'production deploy',
  'delete data',
  'billing change',
  'credential',
  'secret',
  'auth bypass',
  'permission change',
  'database migration',
  'user data',
  'payment',
  'external training',
  'provider fine tune',
  'autonomous code change'
];

const BLOCKED_PATTERNS = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /ghp_[A-Za-z0-9_]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /password\s*[:=]\s*\S+/gi,
  /api[_-]?key\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi,
  /secret\s*[:=]\s*\S+/gi
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 20);
}

function textOf(value) {
  if (value === null || value === undefined) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function hasSecretLikeText(value) {
  const text = textOf(value);
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
}

function includesRiskKeyword(value) {
  const text = textOf(value).toLowerCase();
  return HIGH_RISK_KEYWORDS.filter((keyword) => text.includes(keyword));
}

function gatePaths({ rootDir = process.cwd() } = {}) {
  const base = path.join(rootDir, '.prompthouse-data', 'frontier-intelligence-safety');
  return {
    base,
    decisions: path.join(base, 'decisions.jsonl'),
    receipts: path.join(base, 'receipts')
  };
}

function appendJsonl(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, 'utf8');
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function readJsonl(file, limit = 200) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(-limit).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

export function evaluateFrontierIntelligenceSafety({
  rootDir = process.cwd(),
  request = {},
  env = process.env
} = {}) {
  const paths = gatePaths({ rootDir });
  const sanitizedRequest = sanitizeSignalPayload(request);
  const summary = textOf(request.summary || request.intent || request.task || '');
  const riskKeywords = includesRiskKeyword(request);
  const highRisk = Boolean(request.highRisk || request.autonomous === true || request.externalProvider === true || riskKeywords.length);
  const approvalRef = request.approvalRef || env.PH_EVO_APPROVAL_REF || null;
  const budgetUsd = Number(request.budgetUsd ?? env.PH_EVO_FRONTIER_BUDGET_USD ?? 0);
  const maxBudgetUsd = Number(env.PH_EVO_MAX_FRONTIER_BUDGET_USD || 25);
  const workspaceScope = request.workspaceScope || request.scope || 'repo';
  const tests = Array.isArray(request.tests) ? request.tests : [];
  const rollbackPlan = request.rollbackPlan || null;
  const receiptPlan = request.receiptPlan || null;
  const explicitApproval = Boolean(approvalRef && String(approvalRef).length >= 8);
  const budgetOk = budgetUsd >= 0 && budgetUsd <= maxBudgetUsd;
  const scopeOk = ['repo', 'branch', 'workspace', 'sandbox'].includes(workspaceScope);
  const testPlanOk = tests.length > 0 || request.planOnly === true;
  const rollbackOk = Boolean(rollbackPlan) || request.planOnly === true;
  const receiptOk = Boolean(receiptPlan) || request.planOnly === true;
  const noSecrets = !hasSecretLikeText(request);
  const humanReviewOk = !highRisk || request.humanReviewRequired === true || request.planOnly === true;

  const checks = {
    explicitApproval,
    budgetOk,
    scopeOk,
    testPlanOk,
    rollbackOk,
    receiptOk,
    noSecrets,
    humanReviewOk
  };
  const blockedReasons = [
    !explicitApproval ? 'Missing explicit approval reference.' : null,
    !budgetOk ? 'Budget exceeds configured frontier budget limit.' : null,
    !scopeOk ? 'Workspace scope must be repo, branch, workspace, or sandbox.' : null,
    !testPlanOk ? 'A test plan is required before autonomous evolution.' : null,
    !rollbackOk ? 'A rollback plan is required before autonomous evolution.' : null,
    !receiptOk ? 'A receipt plan is required before autonomous evolution.' : null,
    !noSecrets ? 'Request contains secret-like text and was blocked.' : null,
    !humanReviewOk ? 'High-risk frontier or autonomous work requires human review.' : null
  ].filter(Boolean);
  const allowed = blockedReasons.length === 0;
  const decision = {
    id: `frontier_gate_${Date.now()}_${hash(JSON.stringify(sanitizedRequest))}`,
    createdAt: new Date().toISOString(),
    version: VERSION,
    truthState: allowed ? 'FRONTIER_INTELLIGENCE_ALLOWED' : 'FRONTIER_INTELLIGENCE_BLOCKED',
    allowed,
    highRisk,
    riskKeywords,
    providerClass: request.providerClass || 'frontier-or-local',
    mode: request.mode || 'plan',
    requiredChecks: DEFAULT_REQUIRED_CHECKS,
    checks,
    blockedReasons,
    sanitizedRequest
  };
  appendJsonl(paths.decisions, decision);
  return decision;
}

export function writeFrontierSafetyReceipt({ rootDir = process.cwd(), decision = {}, payload = {} } = {}) {
  const paths = gatePaths({ rootDir });
  ensureDir(paths.receipts);
  const receipt = {
    id: `frontier_safety_${Date.now()}_${hash(decision.id || JSON.stringify(payload))}`,
    createdAt: new Date().toISOString(),
    truthState: 'FRONTIER_SAFETY_RECEIPT_WRITTEN',
    decisionId: decision.id || null,
    allowed: decision.allowed === true,
    payload: sanitizeSignalPayload(payload)
  };
  const file = path.join(paths.receipts, `${receipt.id}.json`);
  writeJson(file, receipt);
  return { file, receipt };
}

export function getFrontierIntelligenceSafetyStatus({ rootDir = process.cwd(), limit = 50 } = {}) {
  const paths = gatePaths({ rootDir });
  const decisions = readJsonl(paths.decisions, limit);
  const allowedCount = decisions.filter((item) => item.allowed).length;
  const blockedCount = decisions.length - allowedCount;
  return {
    success: true,
    version: VERSION,
    truthState: blockedCount ? 'FRONTIER_SAFETY_HAS_BLOCKS' : decisions.length ? 'FRONTIER_SAFETY_READY' : 'FRONTIER_SAFETY_WAITING_FOR_DECISIONS',
    decisions: decisions.length,
    allowedCount,
    blockedCount,
    requiredChecks: DEFAULT_REQUIRED_CHECKS,
    files: {
      decisions: path.relative(rootDir, paths.decisions),
      receipts: path.relative(rootDir, paths.receipts)
    }
  };
}

export function getFrontierIntelligenceSafetyContract() {
  return {
    name: 'PromptHouse Frontier Intelligence Safety Gate',
    version: VERSION,
    purpose: 'Allow top-tier model routing and autonomous evolution only when approval, budget, scope, tests, rollback, receipt, secret-scrub, and high-risk review checks pass.',
    requiredChecks: DEFAULT_REQUIRED_CHECKS,
    policy: {
      safeByDefault: true,
      planOnlyAllowedWithoutExecution: true,
      secretLikeTextBlocked: true,
      highRiskNeedsHumanReview: true,
      testsRollbackAndReceiptsRequired: true
    },
    outputs: {
      decisions: '.prompthouse-data/frontier-intelligence-safety/decisions.jsonl',
      receipts: '.prompthouse-data/frontier-intelligence-safety/receipts/'
    }
  };
}
