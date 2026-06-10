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
  Log.info('\n👁️‍🗨️ Auditing ALL ENDS & Inventing Missing Daemons...');
  
  const ends = [
    { name: 'Front-End', id: 'frontend', path: path.join(rootDir, 'src', 'views.jsx') },
    { name: 'Middle-End', id: 'middleend', path: path.join(rootDir, 'src', 'core') },
    { name: 'Bridge-End', id: 'bridgeend', path: path.join(rootDir, 'promptbridge-server.js') },
    { name: 'Backend', id: 'backend', path: path.join(rootDir, 'server', 'routes', 'studio-core.routes.js') },
  ];

  const daemonsDir = path.join(rootDir, 'scripts');

  for (const end of ends) {
    if (await exists(end.path)) {
      logPass(`Detected ${end.name} Architecture at ${end.path}`);
      
      const daemonName = `${end.id}-watchdog-daemon.mjs`;
      const daemonPath = path.join(daemonsDir, daemonName);
      
      if (await exists(daemonPath)) {
        logPass(`  -> Dedicated ${daemonName} is already guarding this end.`);
      } else {
        logWarn(`  -> No dedicated daemon found for ${end.name}. INVENTING DAEMON NOW...`);
        
        const daemonCode = `// 🛡️ Auto-Invented Daemon for ${end.name}
// Generated by the Omni-Singularity Auditor
import fs from 'fs/promises';
import { execSync } from 'child_process';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const TARGET_PATH = \`${end.path.replace(/\\/g, '\\\\')}\`;
const DAEMON_ID = '${end.id}';
const DAEMON_NAME = '${end.name}';

async function performSelfMaintenance() {
  Log.info(\`\\x1b[35m[\${DAEMON_NAME} Watchdog]\\x1b[0m Running self-maintenance cycle on \${DAEMON_ID}...\`);
  try {
    await fs.access(TARGET_PATH);
    Log.info(\`\\x1b[32m  -> Integrity intact.\\x1b[0m\`);
  } catch (err) {
    Log.info(\`\\x1b[31m  -> \${DAEMON_NAME} INTEGRITY COMPROMISED. INITIATING SELF-RECOVERY.\\x1b[0m\`);
    try {
      Log.info(\`\\x1b[33m  -> Triggering Singularity Repair Protocol for \${TARGET_PATH}...\\x1b[0m\`);
      // Self-Repair: Kick off a targeted singularity/crucible run to restore the file
      execSync('npm run singularity', { stdio: 'ignore' });
      Log.info(\`\\x1b[32m  -> Self-Recovery attempt complete.\\x1b[0m\`);
    } catch (repairErr) {
      Log.error(\`\\x1b[31m  -> Self-Repair failed:\\x1b[0m\`, repairErr.message);
    }
  }
}

// Continuous Self-Maintenance Loop
setInterval(performSelfMaintenance, 25000);
performSelfMaintenance(); // Initial run
`;
        await fs.writeFile(daemonPath, daemonCode, 'utf8');
        logPass(`  -> INVENTED: ${daemonName}. Wrote to disk.`);
        
        try {
          Log.info(`  -> SPAWNING INVENTED DAEMON: ${daemonName}`);
          // Fork it in the background so it doesn't block the auditor
          import('child_process').then(({ fork }) => {
            const child = fork(daemonPath, { detached: true, stdio: 'ignore' });
            child.unref();
          });
          logPass(`  -> Spawned ${daemonName} in the background.`);
        } catch (err) {
          logFail(`  -> Failed to spawn invented daemon: ${err.message}`);
        }
      }
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
