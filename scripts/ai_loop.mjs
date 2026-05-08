import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const run = (command) => {
  console.log(`
▶ Running: ${command}`);
  execSync(command, { cwd: root, stdio: 'inherit' });
};

try {
  run('node scripts/ai_context_pack.mjs');
  
  try {
    run('node scripts/ai_review_openai.mjs');
  } catch (apiErr) {
    console.log('\n⚠️ [AI_Loop] OpenAI API failed or exhausted. Falling back to Local Core...');
    run('node scripts/ai_review_local.mjs');
  }
  
  run('node scripts/ai_self_train.mjs');
  console.log('\n✅ ai:loop completed: review output posted, training capture sent, evo runtime activated.');
} catch (err) {
  console.error('\n❌ ai:loop failed:', err.message || err);
  process.exit(1);
}
