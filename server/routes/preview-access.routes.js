import { Router } from 'express';
import { getPreviewAccessDecisionStatus } from '../services/preview-access-decision.js';

export function registerPreviewAccessRoutes() {
  const router = Router();

  router.get('/status', (req, res) => {
    try {
      const status = getPreviewAccessDecisionStatus();
      res.json({ ok: true, data: status, truthState: status.truthState });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message, truthState: 'ERROR' });
    }
  });

  router.get('/options', (req, res) => {
    try {
      const status = getPreviewAccessDecisionStatus();
      res.json({ ok: true, data: status.options, truthState: status.truthState });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message, truthState: 'ERROR' });
    }
  });

  return { router, basePath: '/api/preview-access' };
}
