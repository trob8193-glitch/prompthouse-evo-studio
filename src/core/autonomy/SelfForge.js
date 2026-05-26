import { Log } from '../autonomy/SovereignLogger.js';
import fs from 'fs';
import path from 'path';
import { PerfectionGate } from './PerfectionGate.js';
import { AiEngine as Engine } from '../../ai-engine.js';

/**
 * PH EVO STUDIO — SELF-FORGE DAEMON (Absolute Operational Reality)
 * ═══════════════════════════════════════════════════════════════
 * ABSOLUTE REALITY: Physically rebuilds the studio to eliminate drift.
 * Performs physical disk-writes of synthesized logic after truth-audits.
 */

export class SelfForge {
  constructor() {
    this.gate = new PerfectionGate();
    this.engine = new Engine();
  }

  /**
   * Run a physical self-build cycle.
   */
  async build() {
    Log.info('⚒️ [SelfForge] Initiating Physical Studio Self-Build Cycle...');
    
    // 1. Scan for Gaps via Physical Perfection Gate
    const report = await this.gate.runPerfectionAudit('src');
    const criticalGaps = report.filter(r => r.severity === 'CRITICAL');

    if (criticalGaps.length === 0) {
      Log.success('⚒️ [SelfForge] Studio is already physically Perfect.');
      return;
    }

    Log.info(`⚒️ [SelfForge] Identified ${criticalGaps.length} Physical Gaps. Forging...`);

    // 2. Physical Forge Loop
    for (const gap of criticalGaps) {
      await this.forge(gap);
    }

    Log.success('⚒️ [SelfForge] Physical Self-Build Cycle Complete.');
  }

  async forge(gap) {
    Log.info(`⚒️ [SelfForge] Physically Forging fix for: ${gap.file}`);
    
    const mission = {
      id: `forge_${Date.now()}`,
      prompt: `Fulfill the logic for ${gap.file}. The violation is ${gap.violation}. 
               Replace any incomplete elements with 100% production-grade, dense JavaScript.`
    };

    try {
      const fulfillment = await this.engine.execute(mission);
      
      if (fulfillment.content) {
        // PHYSICAL MANIFESTATION: Perform actual disk-write
        const filePath = path.join(process.cwd(), gap.file);
        fs.writeFileSync(filePath, fulfillment.content, 'utf8');
        
        Log.success(`⚒️ [SelfForge] Logic physically manifested in ${gap.file}.`);
        
        // Final Truth Audit of the Manifested Logic
        await this.gate.auditFileIntegrity(gap.file);
      }
    } catch (e) {
      Log.error(`⚒️ [SelfForge] Forge failed for ${gap.file}: ${e.message}`);
    }
  }
}
