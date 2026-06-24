import { execSync } from 'child_process';
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import { hardenProcess, createDaemonHeartbeat } from './daemon-hardener.mjs';

hardenProcess('continuous-training-daemon');

Log.info("🕒 Starting 1-Hour Continuous Training Daemon...");

let minutesPassed = 0;
const DURATION_MINUTES = 60;
const INTERVAL_MINUTES = 5;

function runTrainingCycle() {
  Log.info(`\n🔄 [Continuous Training] Triggering cycle (Minute ${minutesPassed}/${DURATION_MINUTES})`);
  try {
    // 1. Ingest signal learning dataset
    Log.info('>> Running build_signal_learning_dataset.mjs');
    execSync('node scripts/build_signal_learning_dataset.mjs', { stdio: 'inherit' });
    
    // 2. Trigger Evo LLM pipeline
    Log.info('>> Running start-evo-training.mjs');
    execSync('node scripts/start-evo-training.mjs', { stdio: 'inherit' });
    
    Log.info('✅ Training cycle complete.');
  } catch (err) {
    Log.error('❌ Training cycle encountered an error:', err.message);
  }
}

// Run immediately for the 0th minute
runTrainingCycle();

const interval = setInterval(() => {
  minutesPassed += INTERVAL_MINUTES;
  if (minutesPassed >= DURATION_MINUTES) {
    Log.info("🛑 1-Hour Continuous Training Daemon Finished.");
    clearInterval(interval);
    process.exit(0);
  } else {
    runTrainingCycle();
  }
}, INTERVAL_MINUTES * 60 * 1000);
