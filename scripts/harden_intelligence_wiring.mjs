import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const rootDir = process.cwd();
const files = {
  bridge: path.join(rootDir, 'promptbridge-server.js'),
  packageJson: path.join(rootDir, 'package.json'),
  appRoute: path.join(rootDir, 'generated_apis', 'evo_app_intelligence_routes.js'),
  appCli: path.join(rootDir, 'scripts', 'build_app_intelligence_dataset.mjs'),
  signalCli: path.join(rootDir, 'scripts', 'build_signal_learning_dataset.mjs'),
  appCore: path.join(rootDir, 'src', 'core', 'evo-llm', 'EvoAppIntelligenceBridge.js'),
  signalCore: path.join(rootDir, 'src', 'core', 'evo-llm', 'EvoSignalLearningBridge.js'),
  signalFabric: path.join(rootDir, 'src', 'core', 'signals', 'EvoSignalFabric.js'),
  index: path.join(rootDir, 'src', 'core', 'evo-llm', 'index.js')
};

const receiptDir = path.join(rootDir, '.prompthouse-data', 'intelligence-wiring');
const changed = [];
const checks = [];
const warnings = [];

function rel(file) {
  return path.relative(rootDir, file).replace(/\\/g, '/');
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function writeIfChanged(file, content) {
  ensureDir(file);
  const previous = read(file);
  if (previous === content) return false;
  fs.writeFileSync(file, content, 'utf8');
  changed.push(rel(file));
  return true;
}

function requiredFile(id, file) {
  const ok = fs.existsSync(file);
  checks.push({ id, file: rel(file), ok });
  if (!ok) warnings.push({ id, file: rel(file), issue: 'missing' });
  return ok;
}

function includesCheck(id, file, needle) {
  const ok = read(file).includes(needle);
  checks.push({ id, file: rel(file), ok });
  if (!ok) warnings.push({ id, file: rel(file), issue: `missing: ${needle}` });
  return ok;
}

function syntaxCheck(file) {
  if (!fs.existsSync(file)) return false;
  try {
    execFileSync(process.execPath, ['--check', file], { cwd: rootDir, stdio: 'pipe' });
    checks.push({ id: 'syntax', file: rel(file), ok: true });
    return true;
  } catch (error) {
    checks.push({ id: 'syntax', file: rel(file), ok: false });
    warnings.push({ id: 'syntax', file: rel(file), issue: String(error.stderr || error.message).slice(0, 1200) });
    return false;
  }
}

for (const [id, file] of Object.entries(files)) requiredFile(id, file);

includesCheck('app-core-export', files.index, "export * from './EvoAppIntelligenceBridge.js';");
includesCheck('signal-core-export', files.index, "export * from './EvoSignalLearningBridge.js';");
includesCheck('bridge-app-import', files.bridge, "import registerEvoAppIntelligenceRoutes from './generated_apis/evo_app_intelligence_routes.js';");
includesCheck('bridge-app-register', files.bridge, 'registerEvoAppIntelligenceRoutes(app);');

for (const file of [files.appRoute, files.appCli, files.signalCli, files.bridge]) syntaxCheck(file);

if (fs.existsSync(files.packageJson)) {
  const pkg = JSON.parse(read(files.packageJson));
  pkg.scripts = pkg.scripts || {};
  const scripts = {
    'evo:app-intelligence': 'node scripts/build_app_intelligence_dataset.mjs',
    'evo:app-intelligence:status': 'node scripts/build_app_intelligence_dataset.mjs --status',
    'evo:signals': 'node scripts/build_signal_learning_dataset.mjs',
    'evo:signals:status': 'node scripts/build_signal_learning_dataset.mjs --status',
    'evo:wire-intelligence': 'node scripts/install_evo_signal_fabric_routes.mjs && node scripts/install_app_intelligence_tools.mjs && node scripts/harden_intelligence_wiring.mjs',
    'evo:intelligence:verify': 'node scripts/harden_intelligence_wiring.mjs && node --check promptbridge-server.js'
  };
  for (const [name, command] of Object.entries(scripts)) pkg.scripts[name] = command;
  writeIfChanged(files.packageJson, JSON.stringify(pkg, null, 2) + '\n');
}

try { if (fs.existsSync(files.appCli)) fs.chmodSync(files.appCli, 0o755); } catch (error) { warnings.push({ id: 'chmod-app-cli', issue: error.message }); }
try { if (fs.existsSync(files.signalCli)) fs.chmodSync(files.signalCli, 0o755); } catch (error) { warnings.push({ id: 'chmod-signal-cli', issue: error.message }); }

fs.mkdirSync(receiptDir, { recursive: true });
const receipt = {
  success: warnings.length === 0,
  truthState: warnings.length ? 'INTELLIGENCE_WIRING_NEEDS_LOCAL_INSTALL' : 'INTELLIGENCE_WIRING_HARDENED',
  generatedAt: new Date().toISOString(),
  changed,
  checks,
  warnings,
  nextCommands: warnings.length ? [
    'node scripts/install_evo_signal_fabric_routes.mjs',
    'node scripts/install_app_intelligence_tools.mjs',
    'node scripts/harden_intelligence_wiring.mjs'
  ] : [
    'npm run evo:intelligence:verify',
    'npm run evo:signals',
    'npm run evo:app-intelligence'
  ]
};
const receiptPath = path.join(receiptDir, `intelligence-wiring-${Date.now()}.json`);
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
console.log(JSON.stringify({ ...receipt, receiptPath: rel(receiptPath) }, null, 2));
if (warnings.length) process.exitCode = 1;
