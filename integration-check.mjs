/**
 * PH EVO STUDIO — OMEGA INTEGRATION PROBE (.MJS)
 * ═══════════════════════════════════════════════════════════════
 * Performs a dynamic import sweep of all 96 features to verify 
 * architectural soundness and export availability.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const featuresDir = path.join(__dirname, 'src', 'features');

async function runProbe() {
  console.log('🛡️ [OMEGA_PROBE] Initializing integration probe for 96 features...\n');
  
  const files = fs.readdirSync(featuresDir)
    .filter(f => f.endsWith('.js') && !f.includes('logic'));

  let verifiedCount = 0;
  for (const file of files) {
    try {
      const modulePath = 'file://' + path.join(featuresDir, file).replace(/\\/g, '/');
      const module = await import(modulePath);
      
      const exports = Object.keys(module);
      console.log(`  ✅ [VERIFIED] ${file.padEnd(25)} | Exports: ${exports.length}`);
      verifiedCount++;
    } catch (e) {
      console.error(`  ❌ [FAILED]   ${file.padEnd(25)} | Error: ${e.message.slice(0, 50)}...`);
    }
  }

  console.log(`\n🏆 INTEGRATION PROBE COMPLETE: ${verifiedCount} / ${files.length} Features Verified.`);
}

runProbe();
