import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m",
  blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m",
  white: "\x1b[37m", bgRed: "\x1b[41m"
};

console.log(`
${c.cyan}${c.bold}==================================================
PROMPTHOUSE EVO STUDIO LAUNCHER
==================================================${c.reset}
${c.magenta}Mode:${c.reset} Autonomous Swarm Orchestration
${c.magenta}Resiliency:${c.reset} Auto-healing active
${c.cyan}${c.bold}==================================================${c.reset}
`);

// 23 Daemon Definitions
const daemons = [
  { name: 'Vite',          cmd: 'npm', args: ['run', 'dev'],                color: c.cyan, group: 'Core' },
  { name: 'Bridge',        cmd: 'npm', args: ['run', 'bridge'],             color: c.blue, group: 'Core' },
  { name: 'Singularity',   cmd: 'npm', args: ['run', 'singularity'],        color: c.magenta, group: 'Core' },
  { name: 'Crucible',      cmd: 'npm', args: ['run', 'crucible'],           color: c.red, group: 'Core' },
  { name: 'Sentinel',      cmd: 'npm', args: ['run', 'sentinel:daemon'],    color: c.yellow, group: 'Core' },
  { name: 'Convergence',   cmd: 'npm', args: ['run', 'convergence:daemon'], color: c.green, group: 'Core' },
  { name: 'Evolution',     cmd: 'node', args: ['scripts/evolution-daemon.mjs'], color: c.magenta, group: 'Evo' },
  { name: 'AI Daemon',     cmd: 'npm', args: ['run', 'ai:daemon'],          color: c.cyan, group: 'Evo' },
  { name: 'Audit',         cmd: 'npm', args: ['run', 'audit:platform:daemon'], color: c.yellow, group: 'Audit' },
  { name: 'WD:Frontend',   cmd: 'npm', args: ['run', 'watchdog:frontend'],  color: c.white, group: 'Watchdog' },
  { name: 'WD:Middle',     cmd: 'npm', args: ['run', 'watchdog:middleend'], color: c.white, group: 'Watchdog' },
  { name: 'WD:Bridge',     cmd: 'npm', args: ['run', 'watchdog:bridgeend'], color: c.white, group: 'Watchdog' },
  { name: 'WD:Backend',    cmd: 'npm', args: ['run', 'watchdog:backend'],   color: c.white, group: 'Watchdog' },
  { name: 'WD:API',        cmd: 'npm', args: ['run', 'watchdog:api-fallback'], color: c.white, group: 'Watchdog' },
  { name: 'WD:UIMatrix',   cmd: 'npm', args: ['run', 'watchdog:ui-matrix'], color: c.white, group: 'Watchdog' },
  { name: 'Self-Invent',   cmd: 'npm', args: ['run', 'self:invent'],        color: c.green, group: 'Evo' },
  { name: 'OmniRouter',    cmd: 'npm', args: ['run', 'omni:orchestrator'],  color: c.blue, group: 'Core' },
  { name: 'PluginInst.', cmd: 'node', args: ['scripts/plugin-installer-daemon.mjs'], color: c.cyan, group: 'Evo' },
  { name: 'Antigravity',   cmd: 'npm', args: ['run', 'antigravity'],        color: c.cyan, group: 'Core' },
  { name: 'MarketBrain',   cmd: 'npm', args: ['run', 'marketing:daemon'],   color: c.magenta, group: 'Market' },
  { name: 'SeedRound',     cmd: 'npm', args: ['run', 'seed:daemon'],        color: c.green, group: 'Market' },
  { name: 'Mobile',        cmd: 'npm', args: ['run', 'mobile:daemon'],      color: c.blue, group: 'Evo' },
  { name: 'Ingestion',     cmd: 'npm', args: ['run', 'ingestion:daemon'],   color: c.yellow, group: 'Evo' },
  { name: 'Sing.Builder',  cmd: 'npm', args: ['run', 'singularity:build:daemon'], color: c.magenta, group: 'Core' }
];

const processes = new Map();

const logBuffers = new Map();

function prefixLog(name, color, data, isError = false) {
  const lines = data.toString().split('\n').filter(l => l.trim().length > 0);
  const prefix = `${c.dim}[${c.reset}${color}${c.bold}${name.padEnd(12)}${c.reset}${c.dim}]${c.reset}`;
  
  if (!logBuffers.has(name)) {
    logBuffers.set(name, { count: 0, lastReset: Date.now() });
  }
  const state = logBuffers.get(name);
  
  // Throttle to max 5 logs per second per daemon to prevent IDE terminal crashing
  if (Date.now() - state.lastReset > 1000) {
    state.count = 0;
    state.lastReset = Date.now();
  }

  lines.forEach(line => {
    if (isError) {
      console.error(`${prefix} ${c.red}${line}${c.reset}`);
    } else {
      state.count++;
      if (state.count <= 5) {
        console.log(`${prefix} ${line}`);
      } else if (state.count === 6) {
        console.log(`${prefix} ${c.dim}... [Logs throttled to prevent IDE crash]${c.reset}`);
      }
    }
  });
}

function spawnDaemon(daemon) {
  console.log(`${c.dim}[Launcher] Booting ${daemon.color}${daemon.name}${c.reset}...`);
  
  const isWindows = process.platform === 'win32';
  const cmd = isWindows && daemon.cmd === 'npm' ? 'npm.cmd' : daemon.cmd;
  
  // HARDENING: Force strict memory limits on swarm nodes to prevent IDE RAM exhaustion
  // Give Bridge and Vite 1GB, heavily restrict everything else to 256MB
  const memLimit = ['Bridge', 'Vite', 'Sing.Builder'].includes(daemon.name) ? '1024' : '256';
  const nodeOptions = (process.env.NODE_OPTIONS || '') + ` --max-old-space-size=${memLimit}`;

  const proc = spawn(cmd, daemon.args, {
    cwd: rootDir,
    env: { 
      ...process.env, 
      FORCE_COLOR: '1', 
      NODE_NO_WARNINGS: '1',
      NODE_OPTIONS: nodeOptions
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWindows
  });

  proc.stdout.on('data', (data) => prefixLog(daemon.name, daemon.color, data));
  proc.stderr.on('data', (data) => prefixLog(daemon.name, daemon.color, data, true));

  proc.on('close', (code) => {
    const exitMsg = code === 0 ? 'exited gracefully' : `crashed with code ${code}`;
    const color = code === 0 ? c.yellow : c.bgRed + c.white;
    console.log(`${c.dim}[Launcher]${c.reset} ${color} ${daemon.name} ${exitMsg}. ${c.reset}`);
    
    if (code !== 0) {
      console.log(`${c.dim}[Launcher] Auto-healing: Respawning ${daemon.name} in 3 seconds...${c.reset}`);
      setTimeout(() => spawnDaemon(daemon), 3000);
    }
  });

  processes.set(daemon.name, proc);
}

// Staggered Boot Sequence
const isLite = process.argv.includes('--lite');
const activeDaemons = isLite 
  ? daemons.filter(d => ['Vite', 'Bridge', 'OmniRouter', 'Singularity'].includes(d.name))
  : daemons;

if (isLite) {
  console.log(`${c.yellow}${c.bold}LITE MODE ACTIVE: Skipping heavy background daemons to conserve IDE resources.${c.reset}`);
}

let delay = 0;
for (const daemon of activeDaemons) {
  setTimeout(() => spawnDaemon(daemon), delay);
  delay += 1200; // 1200ms stagger between each process to prevent I/O & CPU storms
}

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log(`\n${c.red}${c.bold}==================================================
SHUTDOWN SEQUENCE INITIATED
==================================================${c.reset}`);
  for (const [name, proc] of processes.entries()) {
    console.log(`${c.dim}[Launcher] Terminating ${name}...${c.reset}`);
    proc.kill('SIGTERM');
  }
  process.exit(0);
});
