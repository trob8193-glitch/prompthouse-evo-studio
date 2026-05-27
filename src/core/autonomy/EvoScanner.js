import { DRIFT_GUARD } from './DriftGuard.js';
import { Log } from './SovereignLogger.js';
import { PerfectionGate } from './PerfectionGate.js';
import path from 'path';

/**
 * PH EVO STUDIO — EVOSCANNER (SACRED AUDIT)
 * ═══════════════════════════════════════════════════════════════
 * Audits core organs and identifies logic drift.
 */

export class EvoScanner {
  constructor() {
    this.organs = [
      'src/core/autonomy/EvoForge.js', 
      'src/core/autonomy/EvoScanner.js', 
      'src/core/automation/SelfHealer.js'
    ];
    this.gate = new PerfectionGate();
  }

  async scanCore() {
    Log.info('🔍 [EvoScanner] Initiating Sacred Audit of Core Organs...');
    const report = {
      timestamp: Date.now(),
      organs: {},
      driftCount: 0
    };

    const auditResults = await this.gate.runPerfectionAudit('src/core');
    
    // Map audit results to organs
    for (const violation of auditResults) {
      const relPath = path.relative(process.cwd(), violation.file).replace(/\\/g, '/');
      if (!report.organs[relPath]) {
        report.organs[relPath] = { healthy: false, issues: [] };
        report.driftCount++;
      }
      report.organs[relPath].issues.push(violation);
    }

    Log.info(`🔍 [EvoScanner] Audit Complete. ${report.driftCount} violations identified.`);
    return report;
  }

  async auditOrgan(organPath) {
    const results = await this.gate.runPerfectionAudit(path.dirname(organPath));
    const issues = results.filter(r => r.file.includes(path.basename(organPath)));
    return {
      drift: issues.length > 0,
      issues: issues,
      health: issues.length > 0 ? 0.5 : 1.0
    };
  }
}

export const EVO_SCANNER = new EvoScanner();
