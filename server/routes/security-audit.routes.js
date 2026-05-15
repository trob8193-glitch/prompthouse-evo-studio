/**
 * PH EVO STUDIO — SECURITY AUDIT ROUTE
 * ═══════════════════════════════════════════════════════════════
 * Read-only endpoint for security audit report.
 * No secrets exposed. No provider calls required.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildSecurityAuditReport } from '../services/mutation-route-auditor.js';
import { buildTruthResponse } from '../services/truth-labels.js';
import { getProviderGateStatus } from '../services/provider-gates.js';

export function registerSecurityAuditRoutes(app) {
  app.get('/api/security/audit', (req, res) => {
    try {
      const serverPath = join(process.cwd(), 'promptbridge-server.js');
      let sourceText;
      try {
        sourceText = readFileSync(serverPath, 'utf8');
      } catch {
        return res.json(buildTruthResponse({
          success: false,
          truthState: 'ERROR',
          error: 'Could not read promptbridge-server.js for audit.',
        }));
      }

      const audit = buildSecurityAuditReport(sourceText);
      const gates = getProviderGateStatus();

      res.json(buildTruthResponse({
        success: true,
        truthState: audit.truthState,
        audit,
        providerGates: gates,
      }));
    } catch (err) {
      res.status(500).json(buildTruthResponse({
        success: false,
        error: err.message,
        truthState: 'ERROR',
      }));
    }
  });
}
