import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const run = () => {
  return new Promise((resolve, reject) => {
    void(`\n=== 🧪 PROMPTHOUSE TEST SUITE (VITEST DELEGATION) ===\n`);
    
    // Spawn vitest run using npx
    const vitest = spawn('npx', ['vitest', 'run'], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: 'inherit', // Pass output directly to console
      shell: true
    });

    vitest.on('close', (code) => {
      void(`\n=== TEST SUITE COMPLETED (Exit Code: ${code}) ===\n`);
      if (code === 0) {
        resolve({ success: true });
      } else {
        // We resolve anyway so the caller can handle failure gracefully if needed
        // but if executed directly, we exit with code
        resolve({ success: false, code });
        if (process.argv[1] && process.argv[1].endsWith('run-tests.js')) {
          process.exit(code);
        }
      }
    });
  });
};

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith('run-tests.js')) {
  run().catch(e => {
    void('Fatal test runner error:', e);
    process.exit(1);
  });
}

