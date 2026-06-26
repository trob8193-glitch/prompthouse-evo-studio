import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

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
  { name: 'Bridge',        cmd: 'npm', args: ['run', 'bridge'],             color: c.blue, group: 'Core' }
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
  const freeRamGB = os.freemem() / (1024 * 1024 * 1024);
  let memLimit = '256'; // default
  
  if (freeRamGB < 4) {
    // Low RAM: brutal clamping
    memLimit = ['Bridge', 'Vite', 'Sing.Builder'].includes(daemon.name) ? '512' : '128';
  } else {
    // Standard RAM
    memLimit = ['Bridge', 'Vite', 'Sing.Builder'].includes(daemon.name) ? '1024' : '256';
  }
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
const activeDaemons = daemons;

if (isLite) {
  console.log(`${c.yellow}${c.bold}LITE MODE ACTIVE (Deprecated).${c.reset}`);
}

let delay = 0;
const freeRamGBStagger = os.freemem() / (1024 * 1024 * 1024);
const staggerTime = freeRamGBStagger < 4 ? 2000 : 1200; // Increase stagger if RAM is low to prevent I/O & CPU storms

for (const daemon of activeDaemons) {
  setTimeout(() => spawnDaemon(daemon), delay);
  delay += staggerTime;
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
