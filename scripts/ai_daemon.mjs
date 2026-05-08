import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const INTERVAL_MINUTES = 3;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

console.log(`🌌 [AI_Daemon] Starting continuous evolution loop...`);
console.log(`⏱️ Interval: ${INTERVAL_MINUTES} minutes`);

function runCycle() {
  console.log(`\n🔔 [AI_Daemon] Triggering cycle at ${new Date().toISOString()}`);
  try {
    execSync('node scripts/ai_loop.mjs', { cwd: root, stdio: 'inherit' });
    console.log(`✅ [AI_Daemon] Cycle completed successfully.`);
  } catch (err) {
    console.error(`❌ [AI_Daemon] Cycle failed:`, err.message || err);
  }
  console.log(`\n⏳ [AI_Daemon] Waiting ${INTERVAL_MINUTES} minutes for next cycle...`);
}

// Run immediately on start
runCycle();

// Then run on interval
setInterval(runCycle, INTERVAL_MS);
