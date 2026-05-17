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
  run('node scripts/ai_review_openai.mjs');
  run('node scripts/ai_self_train.mjs');
  console.log('\n✅ ai:loop completed: review output posted, training capture sent, evo runtime activated, self-implementation requested.');
} catch (err) {
  console.error('\n❌ ai:loop failed:', err.message || err);
  process.exit(1);
}
