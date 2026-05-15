/**
 * PH EVO STUDIO — NUCLEAR TRUTH AUDITOR
 * ═══════════════════════════════════════════════════════════════
 * Performs a structural integrity audit of the studio's codebase,
 * verifying that critical modules, routes, and configurations exist.
 */
import { existsSync } from 'fs';
import { join } from 'path';

const CRITICAL_MODULES = [
  'src/store.js',
  'src/App.jsx',
  'src/config/bridge-config.js',
  'src/services/bridge-client.js',
  'src/constants/truth-states.js',
  'src/components/Navigation.jsx',
  'src/components/SingularityEngineOverlay.jsx',
  'src/components/TruthBadge.jsx',
  'src/evolution-runtime.js',
  'promptbridge-server.js',
];

export class NuclearTruthAuditor {
  async performFullAudit() {
    const root = process.cwd();
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const mod of CRITICAL_MODULES) {
      const exists = existsSync(join(root, mod));
      results.push({
        module: mod,
        status: exists ? 'PRESENT' : 'MISSING',
        truth_state: exists ? 'VERIFIED' : 'ERROR',
      });
      if (exists) passed++;
      else failed++;
    }

    const integrity = CRITICAL_MODULES.length > 0
      ? Math.round((passed / CRITICAL_MODULES.length) * 100)
      : 0;

    return {
      timestamp: new Date().toISOString(),
      total: CRITICAL_MODULES.length,
      passed,
      failed,
      integrity,
      results,
    };
  }
}
