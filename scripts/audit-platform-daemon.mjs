import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const INTERVAL_MS = 60000; // Run every 60 seconds

Log.info('\x1b[36m╔═══════════════════════════════════════════════════════════════╗\x1b[0m');
Log.info('\x1b[36m║   PLATFORM READINESS DAEMON ONLINE                            ║\x1b[0m');
Log.info('\x1b[36m║   Continuous watchdog active. Auditing every 60 seconds.      ║\x1b[0m');
Log.info('\x1b[36m╚═══════════════════════════════════════════════════════════════╝\x1b[0m\n');

function runAudit() {
  try {
    Log.info(`\n\x1b[34m[${new Date().toISOString()}] Triggering Platform Readiness Audit...\x1b[0m`);
    // Pass stdio inherit so it outputs directly to the parent process terminal
    execSync('npm run audit:platform', { stdio: 'inherit', cwd: rootDir });
    Log.info(`\x1b[32m[${new Date().toISOString()}] Platform Audit Passed. Sleeping for 60s.\x1b[0m`);
  } catch (err) {
    Log.error(`\x1b[31m[${new Date().toISOString()}] PLATFORM AUDIT FAILED.\x1b[0m`);
    Log.error('The autonomous system has introduced a regression or broken a core capability.');
    Log.error(err.message);
  }
}

// Run immediately on boot, then schedule
runAudit();
setInterval(runAudit, INTERVAL_MS);
