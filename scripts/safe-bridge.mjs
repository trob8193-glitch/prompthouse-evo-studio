import { spawn } from 'child_process';
import { join } from 'path';

/**
 * BRIDGE CRASH PROTECTION WRAPPER
 * Ensures promptbridge-server.js automatically restarts if it crashes due to unhandled exceptions.
 */

const args = ['promptbridge-server.js'];
let isShuttingDown = false;

function startServer() {
  console.log('\n[BRIDGE SAFE] Starting Bridge Server (Crash Protection Active)...');
  
  const child = spawn('node', args, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });

  child.on('close', (code) => {
    if (isShuttingDown) return;
    console.error(`\n[BRIDGE SAFE] 🔴 Bridge Server crashed with code ${code}. Restarting in 2s...`);
    setTimeout(startServer, 2000);
  });
}

process.on('SIGINT', () => {
  isShuttingDown = true;
  console.log('\n[BRIDGE SAFE] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  isShuttingDown = true;
  console.log('\n[BRIDGE SAFE] Shutting down gracefully...');
  process.exit(0);
});

startServer();
