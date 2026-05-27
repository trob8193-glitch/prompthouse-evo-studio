import { execSync } from 'child_process';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const run = (command) => {
  Log.info(`\n▶ Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    Log.error(`\n❌ Command failed: ${command}`);
  }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const DURATION_MINUTES = 5;
  const ITERATIONS = DURATION_MINUTES;
  Log.info(`🚀 Starting 5-minute continuous API run (Iterations: ${ITERATIONS})`);

  for (let i = 1; i <= ITERATIONS; i++) {
    Log.info(`\n======================================================`);
    Log.info(`⏱️  ITERATION ${i} / ${ITERATIONS} (${new Date().toLocaleTimeString()})`);
    Log.info(`======================================================`);

    // 1. Pack context
    run('node scripts/ai_context_pack.mjs');
    
    // 2. Run OpenAI
    run('node scripts/ai_review_openai.mjs');

    // 3. Run Gemini
    run('node scripts/ai_review_gemini.mjs');

    if (i < ITERATIONS) {
      Log.info(`\n⏳ Waiting 60 seconds before next iteration to respect API rate limits...`);
      await wait(60000);
    }
  }

  Log.info(`\n✅ 5-minute continuous run completed successfully!`);
}

main();
