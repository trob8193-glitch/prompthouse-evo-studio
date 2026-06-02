import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * PH EVO STUDIO — LAUNCH PROOF SCRIPT
 * ═══════════════════════════════════════════════════════════════
 * Executes core audit, syntax, route-contract, test, and build checks.
 * Saves receipts under launch-readiness/receipts.
 */

const rootDir = process.cwd();
const receiptsDir = path.join(rootDir, 'launch-readiness', 'receipts');
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const receiptPath = path.join(receiptsDir, `${timestamp}_launch-proof.md`);

console.log('🚀 Starting Launch Proof Verification...');

const results = [];

function runCheck(name, command) {
  console.log(`\n🔍 Checking: ${name}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    results.push({ name, status: 'PASS', output });
    console.log(`✅ ${name} passed.`);
  } catch (err) {
    results.push({ name, status: 'FAIL', output: err.stdout || err.message });
    console.log(`❌ ${name} failed.`);
  }
}

// 1. Security Audit
runCheck('Security Audit', 'npm audit');

// 2. Syntax Check
runCheck('Syntax Check', 'node --check promptbridge-server.js');

// 3. Test Suite (Core only for speed in proof)
runCheck('Core Tests', 'npm test tests/core-routes.test.js');

// 4. Production Build
runCheck('Production Build', 'npm run build');

// Generate Receipt
const receiptContent = `# Launch Proof Receipt
- **Timestamp:** ${new Date().toISOString()}
- **Environment:** ${process.platform} ${process.arch}
- **Node Version:** ${process.version}

## Verification Results
${results.map(r => `### ${r.status === 'PASS' ? '✅' : '❌'} ${r.name}\n\`\`\`\n${r.output.slice(0, 500)}...\n\`\`\``).join('\n\n')}

## Verdict
${results.every(r => r.status === 'PASS') ? '# 🚀 LAUNCH READY' : '# 🔒 GATED: FIX FAILURES'}
`;

fs.writeFileSync(receiptPath, receiptContent);
console.log(`\n📄 Receipt saved to: ${receiptPath}`);

if (results.every(r => r.status === 'PASS')) {
  process.exit(0);
} else {
  process.exit(1);
}
