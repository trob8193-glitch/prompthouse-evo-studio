import { execSync } from 'child_process';

console.log('[AI Loop] Engaging Infinite Evolution Daemon...');
console.log('[AI Loop] The studio will now autonomously pack, review, and train every 10 minutes.');

function runCycle() {
  console.log('\n--- STARTING AUTONOMOUS CYCLE ---');
  try {
    console.log('> Running Context Pack...');
    execSync('node scripts/ai_context_pack.mjs', { stdio: 'inherit' });
    
    console.log('> Running AI Review...');
    execSync('node scripts/ai_review_openai.mjs', { stdio: 'inherit' });
    
    console.log('> Running AI Self-Train...');
    execSync('node scripts/ai_self_train.mjs', { stdio: 'inherit' });
    
    console.log('--- CYCLE COMPLETE. SLEEPING. ---');
  } catch (e) {
    console.error('[AI Loop] Cycle encountered an error:', e.message);
  }
}

// Run immediately once
runCycle();

// Then run every 10 minutes (600,000 ms)
setInterval(runCycle, 600000);