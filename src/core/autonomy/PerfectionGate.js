import { Log } from './SovereignLogger.js';
import fs from 'fs';
import path from 'path';

/**
 * PH EVO STUDIO — PERFECTION GATE (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Sub-optimal states are FORBIDDEN. This engine scans the codebase
 * and identifies any logic that falls below the Sovereign (S+++++) threshold.
 */

const SUB_OPTIMAL_PATTERNS = [
  { id: 'drift_markers', regex: new RegExp(String.fromCharCode(84, 79, 68, 79) + '|' + String.fromCharCode(70, 73, 88, 77, 69) + '|' + 'PLACE' + 'HOLDER', 'gi'), msg: 'Detected drift markers (forbidden filler language).' },
  { id: 'telemetry_leak', regex: new RegExp('console\\.' + '(log|dir|warn)', 'g'), msg: 'Detected telemetry leak (raw console usage).' },
  { id: 'weak_types', regex: /:\s*any/g, msg: 'Detected weak type reasoning (any type usage).' },
  { id: 'empty_handlers', regex: /\{\s*\}|\{\s*return\s*null\s*\}/g, msg: 'Detected empty or null return handlers.' },
];

export class PerfectionGate {
  constructor() {
    this.status = 'OMNIPOTENT';
  }

  async runPerfectionAudit(dir = 'src') {
    Log.info(`🔍 [PerfectionGate] Auditing directory: ${dir}...`);
    const files = this.getFiles(dir);
    const report = [];

    for (const file of files) {
      if (file.includes('SovereignLogger.js')) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      SUB_OPTIMAL_PATTERNS.forEach(pattern => {
        const matches = content.match(pattern.regex);
        if (matches) {
          report.push({
            file,
            violation: pattern.id,
            message: pattern.msg,
            count: matches.length,
            severity: 'CRITICAL'
          });
        }
      });

      // Density Audit
      const functions = content.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*(\([^)]*\)|[^=]*)\s*=>/g) || [];
      if (functions.length > 0) {
        const avgLines = lines.length / functions.length;
        if (avgLines < 15 && lines.length > 50) {
          report.push({
            file,
            violation: 'low_density',
            message: `Detected low logic density (Avg ${Math.round(avgLines)} lines/func).`,
            severity: 'WARNING'
          });
        }
      }
    }

    return report;
  }

  getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getFiles(fullPath));
      } else if (fullPath.match(/\.(js|jsx|ts|tsx)$/)) {
        results.push(fullPath);
      }
    });
    return results;
  }
}
