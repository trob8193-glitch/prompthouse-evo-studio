/**
 * PH EVO STUDIO — AI Provider Probe Routes
 */

import { requireProviderProbeApproval } from '../middleware/security-gates.js';
import { classifyOpenAiKey } from '../services/ai-provider-status.js';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerAiProviderProbeRoutes(app, context = {}) {
  app.post('/api/ai-providers/openai/probe', requireProviderProbeApproval, (req, res) => {
    const openai = classifyOpenAiKey();
    if (!openai.configured) {
      return res.status(400).json({ ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS });
    }
    res.json({ ok: true, openai, truthState: TRUTH_STATES.VERIFIED, timestamp: new Date().toISOString() });
  });
}
