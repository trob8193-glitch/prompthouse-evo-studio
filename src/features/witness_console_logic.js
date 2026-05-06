import { Log } from '../autonomy/SovereignLogger.js';
import { TruthChain } from '../truth/TruthChain.js';

/**
 * PH EVO STUDIO — WITNESS CONSOLE (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * The 'Black Box' of the studio. Records every intent and 
 * production outcome with cryptographic verification.
 */

export class WitnessConsole {
  constructor() {
    this.chain = new TruthChain();
    this.logs = [];
  }

  async witness(intent, outcome) {
    Log.info(`👁️ [WitnessConsole] Canonizing event: ${intent}...`);
    
    const entry = {
      id: Date.now(),
      intent,
      outcome,
      timestamp: new Date()
    };

    // Sign the entry into the Truth Chain
    const signedEntry = await this.chain.canonize(entry);
    this.logs.push(signedEntry);
    
    return signedEntry;
  }

  getAuditTrail() {
    return this.logs;
  }
}
