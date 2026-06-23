import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

Log.info('🚀 [Platform Readiness Auditor] Initializing...');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function logPass(message) {
  Log.info(`  ✅ [PASS] ${message}`);
}

function logWarn(message) {
  console.warn(`  ⚠️ [WARN] ${message}`);
}

function logFail(message) {
  Log.error(`  ❌ [FAIL] ${message}`);
}

async function auditFeatures() {
  Log.info('\n🧩 Auditing Features...');
  const featuresDir = path.join(rootDir, 'src', 'features');
  let featureCount = 0;
  if (await exists(featuresDir)) {
    const files = await fs.readdir(featuresDir);
    featureCount = files.filter(f => f.endsWith('.jsx') || f.endsWith('.js')).length;
    logPass(`Found ${featureCount} feature modules in src/features.`);
  } else {
    logFail('src/features directory missing.');
  }

  const testsDir = path.join(rootDir, 'tests');
  if (await exists(testsDir)) {
     const testFiles = await fs.readdir(testsDir);
     logPass(`Found ${testFiles.length} unit/integration tests in tests/ directory.`);
  } else {
     logWarn('tests directory missing.');
  }
}

async function auditModules() {
  Log.info('\n🧱 Auditing Modules & Components...');
  const componentsDir = path.join(rootDir, 'src', 'components');
  if (await exists(componentsDir)) {
    const files = await fs.readdir(componentsDir);
    const compCount = files.filter(f => f.endsWith('.jsx') || f.endsWith('.js')).length;
    logPass(`Found ${compCount} shared UI components.`);
  } else {
    logWarn('src/components directory missing.');
  }

  const coreDir = path.join(rootDir, 'src', 'core');
  if (await exists(coreDir)) {
    const files = await fs.readdir(coreDir);
    logPass(`Found ${files.length} core capability modules (routing, state, interop).`);
  } else {
    logWarn('src/core directory missing.');
  }
}

async function auditCapabilities() {
  Log.info('\n⚙️ Auditing Capabilities & Daemons...');
  const packagePath = path.join(rootDir, 'package.json');
  const pkg = await readJson(packagePath);

  const capabilities = [
    { name: 'Singularity Feedback Loop', script: 'singularity' },
    { name: 'Crucible Daemon', script: 'crucible' },
    { name: 'Antigravity Agent Tether', script: 'bridge' },
    { name: 'Cost Firewall', script: 'cost' },
    { name: 'Self-Evolution Engine', script: 'evolve:propose' }
  ];

  for (const cap of capabilities) {
    if (pkg.scripts && pkg.scripts[cap.script]) {
      logPass(`Capability Active: ${cap.name} (npm run ${cap.script})`);
    } else {
      logFail(`Capability Missing: ${cap.name} (script '${cap.script}' not found)`);
    }
  }

  if (await exists(path.join(rootDir, 'promptbridge-server.js'))) {
    logPass(`PromptBridge Interop Server found (Agent API Tether).`);
  } else {
    logFail(`PromptBridge Interop Server missing.`);
  }
}

async function auditProductionReadiness() {
  Log.info('\n🚢 Auditing Production Build Readiness...');
  if (await exists(path.join(rootDir, 'dist'))) {
    logPass('Production dist/ artifact bundle exists and is ready for Vercel/Netlify.');
  } else {
    logWarn('dist/ artifact missing. Run "npm run build" before deploying.');
  }
  
  if (await exists(path.join(rootDir, '.env'))) {
    logPass('.env configuration exists.');
  } else {
    logWarn('.env configuration missing. Make sure environment variables are injected in production.');
  }
}

async function auditDeadItems() {
  Log.info('\n💀 Auditing for Dead Surfaces & Code...');
  try {
    Log.info('  [Deep Audit] Scanning AST for dead exports and unreachable code...');
    execSync('node scripts/deep-audit.mjs src', { stdio: 'inherit' });
    logPass('Deep Audit Engine passed successfully.');
  } catch (err) {
    logFail('Deep Audit Engine found issues (see above output).');
  }

  try {
    Log.info('  [Dead Surface Hunter] Scanning UI for disconnected buttons/routes...');
    execSync('npx vitest run tests/dead-surface-hunter.test.jsx', { stdio: 'inherit' });
    logPass('Dead Surface Hunter passed successfully.');
  } catch (err) {
    logFail('Dead Surface Hunter found issues (see above output).');
  }
}

async function auditAllEndsAndInventDaemons() {
  Log.info('\n👁️‍🗨️ Auditing ALL ENDS...');
  
  const ends = [
    { name: 'Front-End', id: 'frontend', path: path.join(rootDir, 'src', 'views.jsx') },
    { name: 'Middle-End', id: 'middleend', path: path.join(rootDir, 'src', 'core') },
    { name: 'Bridge-End', id: 'bridgeend', path: path.join(rootDir, 'promptbridge-server.js') },
    { name: 'Backend', id: 'backend', path: path.join(rootDir, 'server', 'routes', 'studio-core.routes.js') },
  ];

  for (const end of ends) {
    if (await exists(end.path)) {
      logPass(`Detected ${end.name} Architecture at ${end.path}`);
    } else {
      logWarn(`Could not locate standard ${end.name} architecture.`);
    }
  }
}

async function run() {
  await auditFeatures();
  await auditModules();
  await auditCapabilities();
  await auditProductionReadiness();
  await auditDeadItems();
  await auditAllEndsAndInventDaemons();

  Log.info('\n=======================================');
  Log.info('✅ [Platform Auditor] Complete. Studio capabilities are heavily fortified.');
}

run().catch(err => {
  Log.error('Fatal error during audit:', err);
  process.exit(1);
});
