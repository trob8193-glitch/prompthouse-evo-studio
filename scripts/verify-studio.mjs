#!/usr/bin/env node
/**
 * PH EVO STUDIO — STUDIO VERIFICATION RUNNER
 * ═══════════════════════════════════════════════════════════════
 * Runs the full verification pipeline in order.
 * Stops on first failure.
 */
import { execSync } from 'child_process';

const COMMANDS = [
  { label: 'Syntax Check (Bridge Server)', cmd: 'node --check promptbridge-server.js' },
  { label: 'Import Audit', cmd: 'npm run audit:imports' },
  { label: 'CSS Variable Audit', cmd: 'npm run audit:css' },
  { label: 'Test Suite', cmd: 'npm test' },
  { label: 'Production Build', cmd: 'npm run build' },
];

console.log('\n╔════════════════════════════════════════╗');
console.log('║  PH EVO STUDIO — VERIFICATION RUNNER   ║');
console.log('╚════════════════════════════════════════╝\n');

let passed = 0;
let failed = false;

for (const { label, cmd } of COMMANDS) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${cmd}`);
  console.log('  ' + '─'.repeat(50));

  try {
    execSync(cmd, {
      cwd: process.cwd(),
      stdio: 'inherit',
      timeout: 5 * 60 * 1000,
    });
    console.log(`  ✅ ${label} — PASSED`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${label} — FAILED`);
    if (err.status) console.error(`  Exit code: ${err.status}`);
    failed = true;
    break;
  }
}

console.log(`\n${'═'.repeat(50)}`);
if (failed) {
  console.log(`❌ Verification FAILED after ${passed}/${COMMANDS.length} steps.`);
  process.exit(1);
} else {
  console.log(`✅ All ${passed} verification steps PASSED.`);
  process.exit(0);
}
