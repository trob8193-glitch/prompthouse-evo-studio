import { exec } from 'child_process';
import { promisify } from 'util';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const execAsync = promisify(exec);

async function runSentinelCycle() {
  Log.info('\n🛡️ [Platform Sentinel Daemon] Waking up for strict readiness check...');
  try {
    const { stdout } = await execAsync('npm run platform:strict');
    Log.info('✅ [Sentinel] Platform is strictly ready. No blockers detected.');
  } catch (error) {
    Log.error('❌ [Sentinel] Platform readiness violation detected!');
    Log.error(error.stdout || error.message);
    
    // Attempt to automatically generate a repair plan and receipt
    Log.info('🛠️ [Sentinel] Generating repair plan and receipt...');
    try {
      await execAsync('npm run platform:repair-plan && npm run platform:receipt');
      Log.info('✅ [Sentinel] Repair plan and receipt logged.');
    } catch (e) {
      Log.error('❌ [Sentinel] Failed to log repair plan.');
    }
  }
  Log.info('🛡️ [Platform Sentinel Daemon] Returning to sleep for 60 seconds...');
}

async function startDaemon() {
  Log.info('🛡️ [Platform Sentinel Daemon] Booted and armed.');
  await runSentinelCycle();
  setInterval(runSentinelCycle, 60000);
}

startDaemon();
