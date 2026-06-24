/**
 * PH EVO STUDIO — TRUTH LEDGER SEAL
 * ═══════════════════════════════════════════════════════════════
 * Cryptographically seals all proof receipts to finalize the 
 * current session's architectural gains.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROOF_DIR = path.join(__dirname, 'proof_receipts');
const LEDGER_FILE = path.join(__dirname, 'proof_receipts', 'MASTER_TRUTH_LEDGER.json');

function sealLedger() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   PH EVO STUDIO — TRUTH LEDGER SEAL                           ║');
  console.log('║   Finalizing Sovereign Architectural Gains                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(PROOF_DIR)) {
    console.error('[Ledger] ❌ Proof receipts directory not found.');
    return;
  }

  const receipts = fs.readdirSync(PROOF_DIR).filter(f => f.endsWith('.json') && f !== 'MASTER_TRUTH_LEDGER.json');
  const sessionManifest = [];

  console.log(`[Ledger] Aggregating ${receipts.length} proof receipts...`);

  receipts.forEach(file => {
    const content = fs.readFileSync(path.join(PROOF_DIR, file), 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    
    sessionManifest.push({
      file,
      hash,
      timestamp: fs.statSync(path.join(PROOF_DIR, file)).mtime
    });
    console.log(`  [SEAL] ${file.padEnd(30)} | HASH: ${hash.slice(0, 12)}...`);
  });

  const masterHash = crypto.createHash('sha256').update(JSON.stringify(sessionManifest)).digest('hex');
  
  const ledger = {
    session_id: `SOVEREIGN_SESSION_${Date.now()}`,
    finalized_at: new Date().toISOString(),
    receipt_count: receipts.length,
    manifest: sessionManifest,
    master_seal: masterHash,
    status: 'IMMUTABLE_TRUTH_STATE'
  };

  fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log(`║   MASTER SEAL GENERATED: ${masterHash.slice(0, 32)}... ║`);
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\n🔒 Absolute Truth Finalized: proof_receipts/MASTER_TRUTH_LEDGER.json`);
}

sealLedger();
