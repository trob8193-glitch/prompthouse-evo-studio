import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../../..');

// Basic SovereignLogger fallback if missing, but typically we have Log.info available.
// We'll define a robust standalone logger just in case this runs completely decoupled.
const Log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

async function runMatrixCycle() {
  Log.info('\n🕸️ [UI Matrix Daemon] Waking up to scan UI-to-Route integrity...');
  try {
    const { stdout } = await execAsync('npm run audit:ui-matrix', { cwd: root });
    Log.info('✅ [UI Matrix Daemon] Matrix scan clear. 0 dead links detected.');
    
    // Optionally parse the output outbox file for stats
    const outboxPath = path.join(root, '.ai', 'outbox', 'ui-route-matrix.json');
    if (fs.existsSync(outboxPath)) {
      const stats = JSON.parse(fs.readFileSync(outboxPath, 'utf8'));
      Log.info(`   - UI Components: ${stats.totalComponentsScanned}`);
      Log.info(`   - Known Routes: ${stats.totalBackendRoutesFound}`);
    }
  } catch (error) {
    Log.error('❌ [UI Matrix Daemon] DEAD LINKS DETECTED in UI Matrix!');
    // The script throws process.exitCode = 1 when dead links are found
    Log.error('⚠️ The frontend is attempting to call endpoints that do not exist or have drifted.');
    Log.error(error.stdout || error.message);
  }
  Log.info('🕸️ [UI Matrix Daemon] Returning to sleep for 60 seconds...');
}

async function startDaemon() {
  Log.info('🕸️ [UI Matrix Daemon] Booted and armed.');
  await runMatrixCycle();
  setInterval(runMatrixCycle, 60000); // 60 seconds interval
}

// Support executing directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startDaemon();
}
