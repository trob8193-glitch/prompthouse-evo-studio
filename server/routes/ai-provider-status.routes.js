/**
 * PH EVO STUDIO — AI Provider Status Routes
 */

import { getAiProviderStatus } from '../services/ai-provider-status.js';
import { TRUTH_STATES } from '../services/truth-labels.js';

export function registerAiProviderStatusRoutes(app, context = {}) {
  app.get('/api/ai-providers/status', (req, res) => {
    const status = getAiProviderStatus();
    res.json({ ok: true, data: status, truthState: TRUTH_STATES.VERIFIED, timestamp: new Date().toISOString() });
  });
}
