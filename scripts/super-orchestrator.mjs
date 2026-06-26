import { spawn, exec } from 'child_process';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const execAsync = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(color, msg) {
  console.log(`${color}[SUPER-ORCHESTRATOR] ${new Date().toISOString()} - ${msg}${RESET}`);
}

// Support CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// 1. Persistent Server Management
let studioProcess = null;

function startPersistentServers() {
  if (isDryRun) {
    log(BLUE, 'Dry-run mode active. Skipping persistent server launch.');
    return;
  }

  log(BLUE, 'Booting persistent servers (launch:studio)...');
  
  studioProcess = spawn('node', ['scripts/studio-launcher.mjs'], {
    cwd: rootDir,
    shell: false,
    stdio: 'ignore'
  });

  studioProcess.on('exit', (code) => {
    log(RED, `Persistent servers crashed or exited (code ${code}). Restarting in 5s...`);
    setTimeout(startPersistentServers, 5000);
  });
  
  studioProcess.on('error', (err) => {
    log(RED, `Error starting servers: ${err.message}`);
  });
}

// 2. Cycle Scripts Definition
const CORE_SCRIPTS = [
  'npm run self:evolve',
  'npm run capabilities',
  'npm run cost',
  'npm run maturity:check',
  'npm run egit:snapshot'
];

const ENTERPRISE_SCRIPTS = [
  'npm run enterprise:edge',
  'npm run test:enterprise-license',
  'npm run reality:audit',
  'npm run architecture:status'
];

const AI_TRAINING_SCRIPTS = [
  'npm run evo:wire-intelligence',
  'npm run evo:receipt',
  'npm run ai:pack',
  'npm run ai:review',
  'npm run verify:agent'
];

const VERIFICATION_SCRIPTS = [
  'npm run proof:all',
  'npm run test:agent'
];

// Helper to randomly pick a UI component for evolution
function getRandomUIComponent() {
  try {
    const componentsDir = path.join(rootDir, 'src', 'components');
    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js') || f.endsWith('.tsx'));
    if (files.length > 0) {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      return `src/components/${randomFile}`;
    }
  } catch (e) {
    log(RED, `Error reading components directory: ${e.message}`);
  }
  return 'src/components/Navigation.jsx'; // Safe fallback
}

// Helper to run a shell command
async function runScript(cmd) {
  let finalCmd = cmd;
  if (cmd === 'npm run self:evolve') {
    const target = getRandomUIComponent();
    finalCmd = `node scripts/self_evolution_cycle.mjs ${target}`;
  }

  log(YELLOW, `Executing: ${finalCmd}`);
  try {
    const { stdout, stderr } = await execAsync(finalCmd, { cwd: rootDir });
    log(GREEN, `Success: ${finalCmd}`);
    return true;
  } catch (error) {
    log(RED, `Failed: ${finalCmd} - Exit code ${error.code}`);
    return false;
  }
}

// Self-healing flow
async function triggerSelfHealing(failingScript) {
  log(RED, `Triggering Self-Healing due to failure in: ${failingScript}`);
  await runScript('npm run self:evolve');
}

// Tiered schedules state
const intervals = {
  core: 10 * 60 * 1000,       // 10 minutes
  enterprise: 30 * 60 * 1000, // 30 minutes
  training: 60 * 60 * 1000,   // 60 minutes
  verify: 120 * 60 * 1000     // 120 minutes
};

const lastRunTimes = {
  core: 0,
  enterprise: 0,
  training: 0,
  verify: 0
};

async function runCycle(cycleName, scripts) {
  log(BLUE, `--- STARTING AUTONOMOUS ${cycleName.toUpperCase()} CYCLE ---`);
  let allPassed = true;

  for (const script of scripts) {
    const success = await runScript(script);
    if (!success) {
      allPassed = false;
      // Core & Enterprise failures trigger self-healing
      if (cycleName === 'core' || cycleName === 'enterprise') {
        await triggerSelfHealing(script);
      }
    }
  }

  lastRunTimes[cycleName] = Date.now();
  log(BLUE, `--- ${cycleName.toUpperCase()} CYCLE COMPLETE (Passed: ${allPassed}) ---`);
  return allPassed;
}

// Orchestrator scheduler tick
async function schedulerTick() {
  const now = Date.now();

  if (now - lastRunTimes.core >= intervals.core) {
    await runCycle('core', CORE_SCRIPTS);
  }

  if (now - lastRunTimes.enterprise >= intervals.enterprise) {
    await runCycle('enterprise', ENTERPRISE_SCRIPTS);
  }

  if (now - lastRunTimes.training >= intervals.training) {
    await runCycle('training', AI_TRAINING_SCRIPTS);
  }

  if (now - lastRunTimes.verify >= intervals.verify) {
    await runCycle('verify', VERIFICATION_SCRIPTS);
  }
}

// Main scheduler loop
async function runScheduler() {
  if (isDryRun) {
    log(BLUE, 'Running dry-run single pass...');
    const results = [];
    results.push(await runCycle('core', CORE_SCRIPTS));
    results.push(await runCycle('enterprise', ENTERPRISE_SCRIPTS));
    results.push(await runCycle('training', AI_TRAINING_SCRIPTS));
    results.push(await runCycle('verify', VERIFICATION_SCRIPTS));
    const allPassed = results.every(res => res === true);
    log(GREEN, `Dry run verification finished. All cycles passed: ${allPassed}`);
    process.exit(allPassed ? 0 : 1);
  }

  // Initial full pass on boot to verify health (10s delay to allow servers to bind)
  log(BLUE, 'Scheduling initial validation pass in 10s...');
  setTimeout(async () => {
    await runCycle('core', CORE_SCRIPTS);
    await runCycle('enterprise', ENTERPRISE_SCRIPTS);
    await runCycle('training', AI_TRAINING_SCRIPTS);
    await runCycle('verify', VERIFICATION_SCRIPTS);

    // Enter periodic scheduler check every 30 seconds
    setInterval(schedulerTick, 30000);
    log(GREEN, 'Periodic scheduler active. Core: 10m, Enterprise: 30m, Training: 60m, Verify: 120m.');
  }, 10000);
}

// Start persistent servers and kick off scheduler
startPersistentServers();
runScheduler().catch(err => {
  log(RED, `Scheduler encountered fatal error: ${err.message}`);
  process.exit(1);
});
