/**
 * PH EVO STUDIO — Handover Routes
 */

import fs from 'node:fs';
import { join } from 'path';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerHandoverRoutes(app, context = {}) {
  app.get('/api/handover/status', (req, res) => {
    const reportPath = join(process.cwd(), 'proof_receipts', 'handover-report.json');
    if (fs.existsSync(reportPath)) {
      try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        return res.json({ ok: true, reportGenerated: true, productionDeployBlocked: false, truthState: TRUTH_STATES.VERIFIED, timestamp: new Date().toISOString() });
      } catch (err) {
        return res.json({ ok: false, truthState: TRUTH_STATES.ERROR, error: 'Failed to parse report' });
      }
    }
    res.json({ ok: true, truthState: TRUTH_STATES.LOCAL_ONLY, productionDeployBlocked: true, reportGenerated: false });
  });

  app.get('/api/handover/report', (req, res) => {
    const reportPath = join(process.cwd(), 'proof_receipts', 'handover-report.json');
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ ok: false, error: 'Report not found', truthState: TRUTH_STATES.LOCAL_ONLY });
    }
    try {
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      if (report.environment) {
        delete report.environment.rawToken;
        if (report.environment.stripeKey) report.environment.stripeKey = '[REDACTED]';
      }
      return res.json({ ok: true, report });
    } catch (err) {
      return res.status(500).json({ ok: false, error: 'Failed to read report' });
    }
  });
}
