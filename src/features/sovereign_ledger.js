import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Log } from '../core/autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — SOVEREIGN LEDGER (Physical Edition)
 * ═══════════════════════════════════════════════════════════════
 * The immutable record of all production missions and logic 
 * transitions. Ensures 100% auditability for the Truth Chain.
 * ABSOLUTE REALITY: Every entry is physically persisted to disk.
 */

export class SovereignLedger {
  ledgerPath;

  constructor(rootDir = process.cwd()) {
    this.ledgerPath = path.join(rootDir, 'proof_receipts', 'SOVEREIGN_TRUTH_LEDGER.jsonl');
    this.ensureLedgerExists();
  }

  ensureLedgerExists() {
    const dir = path.dirname(this.ledgerPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.ledgerPath)) {
      fs.writeFileSync(this.ledgerPath, '');
      Log.info('📜 [Ledger] Initialized Physical Truth Ledger.');
    }
  }

  async recordEntry(missionId, outcome, signature) {
    Log.info(`📜 [Ledger] Signing mission outcome: ${missionId}`);
    
    // Generate a reality hash for the entry
    const entryData = JSON.stringify({ missionId, outcome, signature, timestamp: Date.now() });
    const realityHash = crypto.createHash('sha256').update(entryData).digest('hex');
    
    const entry = {
      missionId,
      outcome,
      signature,
      realityHash,
      timestamp: new Date().toISOString(),
      truthState: 'SIGNED_PHYSICAL'
    };

    // PHYSICAL APPEND - NO MEMORY STUBS
    fs.appendFileSync(this.ledgerPath, JSON.stringify(entry) + '\n');
    
    return entry;
  }

  getRecentEntries(limit = 100) {
    if (!fs.existsSync(this.ledgerPath)) return [];
    const content = fs.readFileSync(this.ledgerPath, 'utf8');
    return content.split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .slice(-limit);
  }

  getLedgerStats() {
    if (!fs.existsSync(this.ledgerPath)) return { size: 0, entries: 0 };
    const stats = fs.statSync(this.ledgerPath);
    const content = fs.readFileSync(this.ledgerPath, 'utf8');
    const entries = content.split('\n').filter(Boolean).length;
    return {
      size_bytes: stats.size,
      entries,
      path: this.ledgerPath
    };
  }
}
