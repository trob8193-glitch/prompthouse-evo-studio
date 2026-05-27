import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { EvoCoreConvergenceAmplifier } from '../../convergence-amplifier/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const receiptDir = path.join(rootDir, 'proof_receipts', 'convergence_proposals');

if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });

console.log('💎 [CONVERGENCE-AMPLIFIER] Initializing proposal receipt loop...');

const engine = new EvoCoreConvergenceAmplifier();
let cycle = 0;

function readReleaseGate() {
  try {
    const output = execSync('npm run platform:release-verdict', { cwd: rootDir, encoding: 'utf8', stdio: 'pipe', timeout: 120000 });
    return { status: 'CHECKED', output };
  } catch (error) {
    return { status: 'BLOCKED', output: String(error.stdout || error.message || '') };
  }
}

setInterval(() => {
  cycle++;
  console.log(`\n💎 [CONVERGENCE-AMPLIFIER] --- CYCLE ${cycle} ---`);

  try {
    const state = engine.run();
    const releaseGate = readReleaseGate();
    const pendingTargets = [...state.amplificationTargets].filter(t => t.score < 100).sort((a, b) => a.score - b.score);

    if (pendingTargets.length === 0) {
      console.log('🏆 [CONVERGENCE-AMPLIFIER] No proposal targets are pending.');
      return;
    }

    const target = pendingTargets[0];
    const receipt = {
      generatedAt: new Date().toISOString(),
      cycle,
      target,
      releaseGate,
      canonicalAuthorities: state.canonicalModuleMap,
      requiredProof: ['npm run platform:strict', 'npm run maturity:check', 'npm run audit:imports', 'npm run audit:css'],
      rule: 'Convergence records proposals only. Release claims require platform proof.'
    };

    const receiptPath = path.join(receiptDir, `convergence_cycle_${cycle}.json`);
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    console.log(`📦 [CONVERGENCE-AMPLIFIER] Proposal receipt written: ${receiptPath}`);
  } catch (err) {
    console.error('❌ [CONVERGENCE-AMPLIFIER] Error:', err.message);
  }
}, 12000);

console.log('💎 [CONVERGENCE-AMPLIFIER] Online in proposal receipt mode.');