import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EvoIntelligenceTetherCore } from '../evo-llm/EvoIntelligenceTetherCore.js';
import { evaluateFrontierIntelligenceSafety, writeFrontierSafetyReceipt } from '../evo-llm/FrontierIntelligenceSafetyGate.js';
import { ingestEvoWorkMemory } from '../evo-llm/EvoWorkMemoryEngine.js';

const VERSION = '1.2.0';

const MOBILE_CHANNELS = Object.freeze([
  'android-webview',
  'mobile-browser',
  'pwa-shell',
  'offline-cache',
  'push-intent',
  'voice-command',
  'camera-intent',
  'gps-context',
  'nfc-qr-intent',
  'studio-remote-control',
  'omnibot-autonomous-console'
]);

const REQUIRED_MOBILE_PROOF = Object.freeze([
  'mobile-contract-loaded',
  'offline-fallback-present',
  'auth-scope-checked',
  'dangerous-action-gated',
  'frontier-safety-decision-written',
  'tether-plan-written',
  'autonomous-runner-plan-written',
  'work-memory-lesson-written',
  'receipt-written',
  'operator-visible-status'
]);

const ALLOWED_SAFE_INTENTS = Object.freeze([
  'status',
  'proof',
  'safe-plan',
  'receipt',
  'tether-status',
  'tether-cycle-plan',
  'audit-plan',
  'mobile-session',
  'autonomous-execution-plan',
  'autonomous-runner-status',
  'omnibot-master-proof'
]);

const AUTONOMOUS_PROOF_COMMANDS = Object.freeze([
  'node scripts/evo_autonomous_runner.mjs --status',
  'node scripts/evo_autonomous_runner.mjs --contract',
  'node scripts/evo_autonomous_runner.mjs',
  'PH_EVO_APPROVAL_REF=<your-approval-ref> node scripts/evo_autonomous_runner.mjs --execute',
  'node scripts/audit_intelligence_stack.mjs',
  'npm run build',
  'npm run verify:studio'
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function mobilePaths({ rootDir = process.cwd() } = {}) {
  const base = path.join(rootDir, '.prompthouse-data', 'omnibot-mobile');
  return {
    base,
    sessions: path.join(base, 'sessions.jsonl'),
    receipts: path.join(base, 'receipts'),
    status: path.join(base, 'status.json'),
    intentPlans: path.join(base, 'intent-plans')
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

function normalizeIntent(intent = {}) {
  const action = String(intent.action || intent.intent || 'status').toLowerCase().replace(/\s+/g, '-');
  const safeAction = ALLOWED_SAFE_INTENTS.includes(action) ? action : 'safe-plan';
  const autonomyRequested = safeAction.includes('autonomous') || safeAction.includes('runner') || safeAction.includes('master-proof');
  return {
    id: intent.id || `omnibot_mobile_intent_${Date.now()}_${hash(JSON.stringify(intent))}`,
    createdAt: new Date().toISOString(),
    action: safeAction,
    requestedAction: action,
    device: String(intent.device || 'mobile-operator'),
    operator: String(intent.operator || 'studio-owner'),
    channel: MOBILE_CHANNELS.includes(intent.channel) ? intent.channel : 'mobile-browser',
    summary: String(intent.summary || `Mobile requested ${safeAction}.`).slice(0, 1200),
    scope: String(intent.scope || 'sandbox'),
    tests: Array.isArray(intent.tests) && intent.tests.length ? intent.tests.slice(0, 10) : ['npm run build', 'npm run verify:studio', 'node scripts/audit_intelligence_stack.mjs'],
    payload: intent.payload || {},
    executeCommands: false,
    dangerousActionsBlocked: true,
    autonomousExecutionRequested: autonomyRequested,
    autonomousProofCommands: autonomyRequested ? AUTONOMOUS_PROOF_COMMANDS : [],
    proofRequired: REQUIRED_MOBILE_PROOF
  };
}

export function getOmnibotMobileContract() {
  return {
    name: 'PromptHouse Omnibot Mobile Control Layer',
    version: VERSION,
    purpose: 'Expose a safe mobile-first cockpit for Omnibot actions, studio status, offline fallbacks, mobile intents, tether planning, autonomous execution proof planning, and proof-gated remote control.',
    channels: MOBILE_CHANNELS,
    safeIntents: ALLOWED_SAFE_INTENTS,
    proofRequired: REQUIRED_MOBILE_PROOF,
    autonomousProofCommands: AUTONOMOUS_PROOF_COMMANDS,
    policy: {
      mobileFirst: true,
      offlineFallbackRequired: true,
      noDangerousActionWithoutGate: true,
      rawCredentialsNeverStored: true,
      receiptsRequired: true,
      operatorStatusVisible: true,
      autonomousExecutionRequiresLocalProof: true,
      mobileCanRequestPlansButCannotBypassSafety: true,
      mobileNeverExecutesShellDirectly: true
    }
  };
}

export function getOmnibotMobileStatus({ rootDir = process.cwd(), limit = 25, wsBridge = null } = {}) {
  const paths = mobilePaths({ rootDir });
  const sessions = readJsonl(paths.sessions, limit);
  const autonomousHeartbeat = path.join(rootDir, 'src', 'core', 'evo-llm', 'AutonomousExecutionHeartbeat.js');
  
  const connectedDevices = wsBridge ? wsBridge.getConnectedDevices().length : 0;
  let truthState = 'OMNIBOT_MOBILE_WAITING_FOR_SESSION';
  if (connectedDevices > 0) {
    truthState = 'OMNIBOT_MOBILE_CONNECTED';
  } else if (sessions.length > 0) {
    truthState = 'OMNIBOT_MOBILE_READY_OFFLINE';
  }

  const status = {
    success: true,
    version: VERSION,
    truthState,
    connectedDevices,
    channels: ['wss_realtime', ...MOBILE_CHANNELS],
    safeIntents: ALLOWED_SAFE_INTENTS,
    proofRequired: REQUIRED_MOBILE_PROOF,
    autonomousExecution: {
      runner: 'scripts/evo_autonomous_runner.mjs',
      heartbeatPresent: fs.existsSync(autonomousHeartbeat),
      executeRequiresLocalApproval: true,
      proofCommands: AUTONOMOUS_PROOF_COMMANDS
    },
    sessionCount: sessions.length,
    latestSession: sessions.at(-1) || null,
    files: {
      sessions: path.relative(rootDir, paths.sessions),
      receipts: path.relative(rootDir, paths.receipts),
      status: path.relative(rootDir, paths.status),
      intentPlans: path.relative(rootDir, paths.intentPlans)
    }
  };
  writeJson(paths.status, status);
  return status;
}

export function registerOmnibotMobileSession({ rootDir = process.cwd(), session = {} } = {}) {
  const paths = mobilePaths({ rootDir });
  const normalized = {
    id: session.id || `omnibot_mobile_${Date.now()}_${hash(JSON.stringify(session))}`,
    createdAt: new Date().toISOString(),
    device: String(session.device || 'mobile-operator'),
    channel: MOBILE_CHANNELS.includes(session.channel) ? session.channel : 'mobile-browser',
    operator: String(session.operator || 'studio-owner'),
    mode: String(session.mode || 'status-control'),
    allowedIntents: Array.isArray(session.allowedIntents) ? session.allowedIntents.slice(0, 24) : ALLOWED_SAFE_INTENTS,
    dangerousActionsBlocked: true,
    offlineFallback: true,
    proofRequired: REQUIRED_MOBILE_PROOF
  };
  appendJsonl(paths.sessions, normalized);
  const status = getOmnibotMobileStatus({ rootDir });
  const receipt = writeOmnibotMobileReceipt({ rootDir, type: 'omnibot_mobile_session_receipt', payload: normalized });
  return { success: true, session: normalized, status, receipt };
}

export function planOmnibotMobileIntent({ rootDir = process.cwd(), intent = {} } = {}) {
  const paths = mobilePaths({ rootDir });
  const normalized = normalizeIntent(intent);
  const tether = new EvoIntelligenceTetherCore(rootDir);
  const safetyDecision = evaluateFrontierIntelligenceSafety({
    rootDir,
    request: {
      summary: `Omnibot Mobile requested ${normalized.action}: ${normalized.summary}`,
      autonomous: normalized.autonomousExecutionRequested || normalized.action.includes('tether') || normalized.action.includes('audit'),
      mode: 'plan',
      planOnly: true,
      workspaceScope: normalized.scope,
      tests: normalized.tests,
      rollbackPlan: 'Mobile intent is plan-only. Discard plan or revert branch if verification fails.',
      receiptPlan: 'Write mobile, safety, tether, autonomous-runner, work-memory, and audit receipts before promotion.',
      humanReviewRequired: true,
      payload: normalized
    }
  });
  const safetyReceipt = writeFrontierSafetyReceipt({ rootDir, decision: safetyDecision, payload: normalized });
  const tetherPlan = tether.createSafeEvolutionPlan({
    sourceData: { mobileIntent: normalized },
    intent: `omnibot-mobile-${normalized.action}`,
    tests: normalized.tests,
    scope: normalized.scope
  });
  const memory = ingestEvoWorkMemory({
    rootDir,
    item: {
      sourceType: 'operator-note',
      module: 'omnibot-mobile',
      intent: 'improve_learning_loop',
      summary: `Omnibot Mobile planned safe intent ${normalized.action}: ${normalized.summary}`,
      payload: { normalized, safetyDecision, tetherPlan },
      allowedForTraining: true,
      tags: ['omnibot-mobile', 'safe-intent', 'tether', normalized.action]
    }
  });
  const plan = {
    id: normalized.id,
    createdAt: new Date().toISOString(),
    truthState: safetyDecision.allowed ? 'OMNIBOT_MOBILE_INTENT_PLAN_READY' : 'OMNIBOT_MOBILE_INTENT_BLOCKED',
    intent: normalized,
    safetyDecision,
    safetyReceipt,
    tetherPlan,
    memory,
    autonomousExecutionPlan: normalized.autonomousExecutionRequested ? {
      runner: 'scripts/evo_autonomous_runner.mjs',
      executeDefault: false,
      localApprovalRequired: 'PH_EVO_APPROVAL_REF=<your-approval-ref>',
      safeStatusCommand: 'node scripts/evo_autonomous_runner.mjs --status',
      safeContractCommand: 'node scripts/evo_autonomous_runner.mjs --contract',
      planCommand: 'node scripts/evo_autonomous_runner.mjs',
      executeCommand: 'PH_EVO_APPROVAL_REF=<your-approval-ref> node scripts/evo_autonomous_runner.mjs --execute',
      proofCommands: AUTONOMOUS_PROOF_COMMANDS
    } : null,
    localProofCommands: normalized.tests,
    executeCommands: false,
    nextCommands: [
      'node scripts/omnibot_mobile.mjs --status',
      'node scripts/frontier_safety_gate.mjs --status',
      'node scripts/evo_autonomous_runner.mjs --status',
      'node scripts/evo_app_intelligence.mjs --cycle-test',
      'node scripts/audit_intelligence_stack.mjs',
      ...normalized.tests
    ]
  };
  ensureDir(paths.intentPlans);
  const planFile = path.join(paths.intentPlans, `${plan.id}.json`);
  writeJson(planFile, plan);
  const receipt = writeOmnibotMobileReceipt({ rootDir, type: 'omnibot_mobile_intent_plan_receipt', payload: { planFile: path.relative(rootDir, planFile), plan } });
  return { success: safetyDecision.allowed, plan, planFile: path.relative(rootDir, planFile), receipt };
}

export function writeOmnibotMobileReceipt({ rootDir = process.cwd(), type = 'omnibot_mobile_receipt', payload = {} } = {}) {
  const paths = mobilePaths({ rootDir });
  ensureDir(paths.receipts);
  const receipt = {
    id: `omnibot_mobile_receipt_${Date.now()}_${hash(JSON.stringify(payload))}`,
    type,
    createdAt: new Date().toISOString(),
    truthState: 'OMNIBOT_MOBILE_RECEIPT_WRITTEN',
    payload
  };
  const file = path.join(paths.receipts, `${receipt.id}.json`);
  writeJson(file, receipt);
  return { file: path.relative(rootDir, file), receipt };
}
