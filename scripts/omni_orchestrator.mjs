import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The exhaustive list of Level 1 Terminal Daemons
const DAEMONS = [
  'crucible-daemon.mjs',
  'ai_daemon.mjs',
  'ai_loop.mjs',
  'ai_self_train.mjs',
  'self_evolution_cycle.mjs', // We will pass --unattended below
  'physical_desktop_orchestrator.js',
  'physical_hardware_interface.js',
  'physical_os_audit.js',
  'cost_firewall_v2_check.mjs',
  'enterprise_audit.mjs',
  'nuclear_audit.mjs',
  'team_repair.mjs'
];

console.log('🌌 [Omni-Orchestrator] IGNITING THE FULL STUDIO DAEMON NETWORK...\n');
console.log('Level 2 (Brain) and Level 3 (Nerves) classes will be autonomously invoked into memory by these Level 1 processes.\n');

const children = [];

for (const daemon of DAEMONS) {
  const daemonPath = path.join(__dirname, daemon);
  console.log(`🚀 Spawning: ${daemon}`);
  
  // Use 'sh' for shell scripts, 'node' for JS
  const command = daemon.endsWith('.sh') ? 'sh' : 'node';
  const args = [daemonPath];
  
  if (daemon === 'self_evolution_cycle.mjs') {
     args.push('--unattended');
  }
  
  const child = spawn(command, args, {
    stdio: 'pipe',
    shell: true
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${daemon}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    // Suppress verbose experimental warnings
    if (!data.toString().includes('ExperimentalWarning')) {
      process.stderr.write(`[${daemon} ERR] ${data}`);
    }
  });

  child.on('close', (code) => {
    console.log(`⚠️ [Omni-Orchestrator] Daemon ${daemon} exited with code ${code}`);
  });

  children.push(child);
}

process.on('SIGINT', () => {
  console.log('\n🛑 [Omni-Orchestrator] Shutting down all daemons...');
  children.forEach(child => child.kill('SIGINT'));
  process.exit(0);
});

console.log('\n✅ [Omni-Orchestrator] All Level 1 daemons are now running concurrently. Press Ctrl+C to terminate all.\n');
