import { Log } from '../autonomy/SovereignLogger.js';
import { execSync } from 'child_process';

/**
 * PH EVO STUDIO — QUANTUM SEEDING (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Handles the initial seeding of the Evo Garden. Triggers 
 * the background training processes for the WebWevos.
 */

export class QuantumSeeding {
  constructor() {
    this.garden_status = 'EMPTY';
  }

  async sowSeeds(knowledgePack) {
    Log.info('🌱 [QuantumSeeding] Sowing knowledge seeds into the Evo Garden...');
    
    try {
      // Run the self-train script with the correct bridge URL
      execSync('node scripts/ai_self_train.mjs', {
        env: { ...process.env, BRIDGE_URL: 'http://localhost:3001' },
        stdio: 'inherit'
      });
      this.garden_status = 'SEEDED';
      return { seeds: knowledgePack.length, resonance: 0.99 };
    } catch (e) {
      Log.error(`❌ [QuantumSeeding] Failed to sow seeds: ${e.message}`);
      return { error: e.message };
    }
  }
}
