/**
 * PH EVO STUDIO — Vercel Preview Deploy Routes
 */

import { requireDeployApproval } from '../middleware/security-gates.js';
import { runVercelPreviewDeploy } from '../services/vercel-preview-runner.js';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerVercelPreviewDeployRoutes(app, context = {}) {
  app.post('/api/vercel/preview-deploy', requireDeployApproval, async (req, res) => {
    try {
      const result = await runVercelPreviewDeploy(req.body);
      if (!result.ok) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ ok: false, truthState: TRUTH_STATES.ERROR, error: err.message });
    }
  });
}
