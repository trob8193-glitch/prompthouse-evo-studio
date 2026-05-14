import { Log } from '../core/autonomy/SovereignLogger.js';
import { TruthChain } from '../core/truth/TruthChain.js';

/**
 * PH EVO STUDIO — WITNESS CONSOLE (Sovereign Edition)
 * ═══════════════════════════════════════════════════════════════
 * The 'Black Box' of the studio. Records every intent and 
 * production outcome with real cryptographic verification.
 * NO FILLER. NO FICTION.
 */

export class WitnessConsole {
  constructor() {
    this.chain = new TruthChain();
    this.logs = [];
  }

  async witness(intent, outcome) {
    Log.info(`👁️ [WitnessConsole] Canonizing physical event: ${intent}...`);
    
    const entry = {
      id: Date.now(),
      intent,
      outcome,
      timestamp: new Date().toISOString()
    };

    // Sign the entry into the Physical Truth Chain
    const signedEntry = await this.chain.canonize(entry);
    this.logs.push(signedEntry);
    
    return signedEntry;
  }

  getAuditTrail() {
    return this.logs;
  }
}
