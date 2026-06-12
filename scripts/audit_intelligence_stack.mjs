import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const rootDir = process.cwd();
const receiptDir = path.join(rootDir, '.prompthouse-data', 'intelligence-wiring');

const targets = {
  signalFabric: 'src/core/signals/EvoSignalFabric.js',
  signalBridge: 'src/core/evo-llm/EvoSignalLearningBridge.js',
  appBridge: 'src/core/evo-llm/EvoAppIntelligenceBridge.js',
  workMemory: 'src/core/evo-llm/EvoWorkMemoryEngine.js',
  frontierSafety: 'src/core/evo-llm/FrontierIntelligenceSafetyGate.js',
  tetherCore: 'src/core/evo-llm/EvoIntelligenceTetherCore.js',
  safeAutonomy: 'src/core/autonomy/SafeAutonomousExecutionKernel.js',
  omnibotMobile: 'src/core/omnibot/OmnibotMobileCore.js',
  frontierSafetyCli: 'scripts/frontier_safety_gate.mjs',
  safeAutonomyCli: 'scripts/safe_autonomous_execution.mjs',
  omnibotMobileCli: 'scripts/omnibot_mobile.mjs',
  evoIndex: 'src/core/evo-llm/index.js',
  signalInstaller: 'scripts/install_evo_signal_fabric_routes.mjs',
  appInstaller: 'scripts/install_app_intelligence_tools.mjs',
  tetherCommandInstaller: 'scripts/install_tether_completion_commands.mjs',
  hardener: 'scripts/harden_intelligence_wiring.mjs',
  signalCli: 'scripts/build_signal_learning_dataset.mjs',
  appCli: 'scripts/build_app_intelligence_dataset.mjs',
  appTetherCli: 'scripts/evo_app_intelligence.mjs',
  workCli: 'scripts/evo_work_memory.mjs',
  appRoute: 'generated_apis/evo_app_intelligence_routes.js',
  omnibotMobileRoute: 'generated_apis/omnibot_mobile_routes.js',
  bridge: 'promptbridge-server.js',
  packageJson: 'package.json'
};

const checks = [];

function abs(file) { return path.join(rootDir, file); }
function read(file) { const full = abs(file); return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''; }
function add(id, file, ok, weight, detail = '') { checks.push({ id, file, ok: Boolean(ok), weight, earned: ok ? weight : 0, detail }); }
function exists(id, file, weight) { add(id, file, fs.existsSync(abs(file)), weight, fs.existsSync(abs(file)) ? 'present' : 'missing'); }
function contains(id, file, needle, weight) { const ok = read(file).includes(needle); add(id, file, ok, weight, ok ? 'found' : `missing ${needle}`); }
function syntax(id, file, weight) {
  if (!fs.existsSync(abs(file))) return add(id, file, false, weight, 'missing');
  try { execFileSync(process.execPath, ['--check', abs(file)], { cwd: rootDir, stdio: 'pipe' }); add(id, file, true, weight, 'node --check passed'); }
  catch (error) { add(id, file, false, weight, String(error.stderr || error.message).slice(0, 800)); }
}

for (const [id, file] of Object.entries(targets)) exists(`exists:${id}`, file, 3);

contains('export:signal-bridge', targets.evoIndex, "export * from './EvoSignalLearningBridge.js';", 5);
contains('export:app-bridge', targets.evoIndex, "export * from './EvoAppIntelligenceBridge.js';", 5);
contains('export:work-memory', targets.evoIndex, "export * from './EvoWorkMemoryEngine.js';", 5);
contains('export:frontier-safety', targets.evoIndex, "export * from './FrontierIntelligenceSafetyGate.js';", 5);
contains('export:tether-core', targets.evoIndex, "export * from './EvoIntelligenceTetherCore.js';", 5);
contains('installer:app-route-writer', targets.appInstaller, 'evo_app_intelligence_routes.js', 5);
contains('installer:app-cli-writer', targets.appInstaller, 'build_app_intelligence_dataset.mjs', 5);
contains('installer:bridge-import', targets.appInstaller, 'registerEvoAppIntelligenceRoutes', 5);
contains('installer:package-script', targets.appInstaller, 'evo:wire-intelligence', 5);
contains('installer:tether-master-script', targets.tetherCommandInstaller, 'evo:intelligence:master', 6);
contains('installer:tether-proof-script', targets.tetherCommandInstaller, 'evo:tether:proof', 6);
contains('installer:tether-cycle-script', targets.tetherCommandInstaller, 'evo:tether:cycle', 6);
contains('hardener:receipt', targets.hardener, 'intelligence-wiring-', 5);
contains('hardener:syntax-check', targets.hardener, 'node --check', 5);
contains('hardener:package-verify', targets.hardener, 'evo:intelligence:verify', 5);
contains('app-bridge:blueprints', targets.appBridge, 'generated-feature-blueprints.json', 5);
contains('app-bridge:training-output', targets.appBridge, 'app-intelligence-examples.json', 5);
contains('signal-bridge:training-output', targets.signalBridge, 'signal-learning-examples.json', 5);
contains('signal-fabric:contract', targets.signalFabric, 'getEvoSignalFabricContract', 5);
contains('signal-cli:imports-fabric', targets.signalCli, 'importEvoSignalFabricSnapshot', 4);
contains('work-memory:lessons', targets.workMemory, 'lessons.json', 5);
contains('work-memory:plans', targets.workMemory, 'evolution-plans.json', 5);
contains('work-memory:dataset', targets.workMemory, 'work-memory-examples.json', 5);
contains('work-memory:privacy', targets.workMemory, 'storesRawSecrets: false', 5);
contains('work-cli:status', targets.workCli, 'getEvoWorkMemoryStatus', 4);
contains('frontier-safety:approval', targets.frontierSafety, 'explicitApproval', 6);
contains('frontier-safety:budget', targets.frontierSafety, 'budgetLimit', 6);
contains('frontier-safety:rollback', targets.frontierSafety, 'rollbackPlan', 6);
contains('frontier-safety:receipts', targets.frontierSafety, 'writeFrontierSafetyReceipt', 6);
contains('frontier-safety:secret-block', targets.frontierSafety, 'secretLikeTextBlocked', 6);
contains('frontier-safety:human-review', targets.frontierSafety, 'highRiskNeedsHumanReview', 6);
contains('frontier-safety-cli:decision', targets.frontierSafetyCli, 'evaluateFrontierIntelligenceSafety', 5);
contains('tether:class', targets.tetherCore, 'class EvoIntelligenceTetherCore', 6);
contains('tether:safety', targets.tetherCore, 'evaluateFrontierIntelligenceSafety', 6);
contains('tether:safety-receipt', targets.tetherCore, 'writeFrontierSafetyReceipt', 6);
contains('tether:work-memory', targets.tetherCore, 'ingestEvoWorkMemory', 6);
contains('tether:dataset', targets.tetherCore, 'buildAppIntelligenceDataset', 6);
contains('tether:promotion-proof', targets.tetherCore, 'requiredPromotionProof', 6);
contains('tether:receipt', targets.tetherCore, 'writeTetherReceipt', 6);
contains('tether-cli:cycle', targets.appTetherCli, '--cycle-test', 5);
contains('safe-autonomy:contract', targets.safeAutonomy, 'getSafeAutonomousExecutionContract', 7);
contains('safe-autonomy:plan', targets.safeAutonomy, 'createSafeAutonomousExecutionPlan', 7);
contains('safe-autonomy:safety-gate', targets.safeAutonomy, 'evaluateFrontierIntelligenceSafety', 7);
contains('safe-autonomy:rollback', targets.safeAutonomy, 'rollbackPlan', 7);
contains('safe-autonomy:promotion-gate', targets.safeAutonomy, 'promotionWithoutProofBlocked', 7);
contains('safe-autonomy:receipt', targets.safeAutonomy, 'writeSafeAutonomousExecutionReceipt', 7);
contains('safe-autonomy-cli:status', targets.safeAutonomyCli, 'getSafeAutonomousExecutionStatus', 5);
contains('omnibot-mobile:contract', targets.omnibotMobile, 'getOmnibotMobileContract', 6);
contains('omnibot-mobile:channels', targets.omnibotMobile, 'MOBILE_CHANNELS', 6);
contains('omnibot-mobile:offline', targets.omnibotMobile, 'offlineFallbackRequired', 6);
contains('omnibot-mobile:receipts', targets.omnibotMobile, 'writeOmnibotMobileReceipt', 6);
contains('omnibot-mobile-cli:status', targets.omnibotMobileCli, 'getOmnibotMobileStatus', 5);
contains('omnibot-mobile-route:status', targets.omnibotMobileRoute, '/api/omnibot-mobile/status', 5);

for (const file of [targets.signalFabric, targets.signalBridge, targets.appBridge, targets.workMemory, targets.frontierSafety, targets.tetherCore, targets.safeAutonomy, targets.omnibotMobile, targets.frontierSafetyCli, targets.safeAutonomyCli, targets.omnibotMobileCli, targets.signalInstaller, targets.appInstaller, targets.tetherCommandInstaller, targets.hardener, targets.workCli, targets.appTetherCli]) {
  syntax(`syntax:${file}`, file, 4);
}
if (fs.existsSync(abs(targets.appRoute))) syntax(`syntax:${targets.appRoute}`, targets.appRoute, 4);
if (fs.existsSync(abs(targets.appCli))) syntax(`syntax:${targets.appCli}`, targets.appCli, 4);
if (fs.existsSync(abs(targets.omnibotMobileRoute))) syntax(`syntax:${targets.omnibotMobileRoute}`, targets.omnibotMobileRoute, 4);

const total = checks.reduce((sum, item) => sum + item.weight, 0);
const earned = checks.reduce((sum, item) => sum + item.earned, 0);
const score = total ? Math.round((earned / total) * 100) : 0;
const missing = checks.filter((item) => !item.ok);
const truthState = score >= 90 && missing.length === 0
  ? 'INTELLIGENCE_STACK_AUDIT_PASS'
  : score >= 80
    ? 'INTELLIGENCE_STACK_AUDIT_WARNINGS'
    : 'INTELLIGENCE_STACK_AUDIT_FAIL';

const report = {
  generatedAt: new Date().toISOString(), truthState, score, earned, total,
  passed: checks.length - missing.length, failed: missing.length, checks, missing,
  recommendedCommands: [
    'node scripts/install_tether_completion_commands.mjs',
    'node scripts/frontier_safety_gate.mjs --status',
    'node scripts/frontier_safety_gate.mjs --contract',
    'node scripts/safe_autonomous_execution.mjs --contract',
    'node scripts/safe_autonomous_execution.mjs --status',
    'node scripts/omnibot_mobile.mjs --contract',
    'node scripts/omnibot_mobile.mjs --status',
    'node scripts/evo_app_intelligence.mjs --cycle-test',
    'npm run evo:wire-intelligence',
    'npm run evo:intelligence:verify',
    'node scripts/evo_work_memory.mjs --status',
    'node scripts/evo_work_memory.mjs',
    'npm run evo:signals',
    'npm run evo:app-intelligence',
    'npm run build',
    'npm run verify:studio'
  ]
};

fs.mkdirSync(receiptDir, { recursive: true });
const receiptPath = path.join(receiptDir, `intelligence-stack-audit-${Date.now()}.json`);
fs.writeFileSync(receiptPath, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify({ ...report, receiptPath: path.relative(rootDir, receiptPath).replace(/\\/g, '/') }, null, 2));
if (score < 90) process.exitCode = 1;
