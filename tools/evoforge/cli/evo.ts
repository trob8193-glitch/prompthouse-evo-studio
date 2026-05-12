import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { TruthAuditEngine } from '../truth/truthAuditEngine';

/**
 * PH EVO STUDIO — EVOFORGE CLI
 * ═══════════════════════════════════════════════════════════════
 * The native build/dev controller. Wraps Vite with a truth-audit shell.
 */

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log(`\n🌌 [EvoForge] Initializing Build Engine...`);
  const root = process.cwd();
  const auditor = new TruthAuditEngine(root);

  switch (command) {
    case 'dev':
      await runDev(auditor);
      break;
    case 'build':
      await runBuild(auditor);
      break;
    case 'audit':
      await runAudit(auditor);
      break;
    default:
      console.log('Usage: evo <dev|build|audit>');
      process.exit(1);
  }
}

async function runAudit(auditor) {
  console.log('🛡️ [EvoForge] Running Nuclear Truth Audit...');
  const report = await auditor.audit();
  auditor.printReport(report);
  
  if (report.severity === 'CRITICAL') {
    console.error('\n❌ [EvoForge] Audit Failed: Critical simulation drift detected.');
    process.exit(1);
  }
  console.log('✅ [EvoForge] Truth Verified. Studio is stable.');
}

async function runDev(auditor) {
  await runAudit(auditor);
  console.log('🚀 [EvoForge] Launching Dev Runtime (Vite Proxy)...');
  const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });
  vite.on('exit', (code) => process.exit(code));
}

async function runBuild(auditor) {
  await runAudit(auditor);
  console.log('📦 [EvoForge] Launching Production Build Pipeline...');
  const build = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });
  build.on('exit', (code) => process.exit(code));
}

main().catch(err => {
  console.error(`\n💥 [EvoForge] Fatal Error: ${err.message}`);
  process.exit(1);
});
