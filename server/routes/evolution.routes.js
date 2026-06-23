import express from 'express';
import {
  getEvolutionStatus,
  runAutonomousEvolutionCycle,
  startAutonomousEvolutionDaemon,
  stopAutonomousEvolutionDaemon,
  engageEvolutionKillSwitch,
  releaseEvolutionKillSwitch,
  listEvolutionApprovalQueue,
  approveEvolutionQueueItem,
  rejectEvolutionQueueItem,
  listEvolutionRuns,
  getEvolutionRun
} from '../../src/core/evolution/index.js';

export function registerEvolutionRoutes(app) {
  const router = express.Router();

  router.get('/status', (req, res) => {
    try {
      const status = getEvolutionStatus();
      res.json(status);
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/cycle', async (req, res) => {
    try {
      const result = await runAutonomousEvolutionCycle();
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/daemon/start', (req, res) => {
    try {
      const { intervalMs } = req.body;
      const result = startAutonomousEvolutionDaemon(intervalMs);
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/daemon/stop', (req, res) => {
    try {
      const result = stopAutonomousEvolutionDaemon();
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/kill-switch/engage', (req, res) => {
    try {
      const { reason } = req.body;
      const result = engageEvolutionKillSwitch(reason);
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/kill-switch/release', (req, res) => {
    try {
      const result = releaseEvolutionKillSwitch();
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.get('/queue', (req, res) => {
    try {
      const queue = listEvolutionApprovalQueue();
      res.json({ success: true, queue });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/queue/:id/approve', (req, res) => {
    try {
      const result = approveEvolutionQueueItem(req.params.id);
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.post('/queue/:id/reject', (req, res) => {
    try {
      const { reason } = req.body;
      const result = rejectEvolutionQueueItem(req.params.id, reason);
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.get('/runs', (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const runs = listEvolutionRuns(limit);
      res.json({ success: true, runs });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  router.get('/runs/:id', (req, res) => {
    try {
      const run = getEvolutionRun(req.params.id);
      if (!run) {
        return res.status(404).json({ success: false, error: 'Run not found' });
      }
      res.json({ success: true, run });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.use('/api/evolution', router);
}
