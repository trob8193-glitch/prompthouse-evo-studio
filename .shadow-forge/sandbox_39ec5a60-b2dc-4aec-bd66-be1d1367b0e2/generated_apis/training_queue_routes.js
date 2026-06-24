import { addTrainingJob, startTrainingJobs, getTrainingJobs, clearCompletedJobs } from '../src/core/api/training_job_queue.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

export function registerTrainingQueueRoutes(app, { authMiddleware = null } = {}) {
  const middleware = authMiddleware ? [authMiddleware] : [];

  app.get('/api/training/jobs', ...middleware, (req, res) => {
    try {
      res.json({ success: true, jobs: getTrainingJobs() });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/training/jobs', ...middleware, (req, res) => {
    try {
      if (!req.body.fileId) {
        return res.status(400).json({ success: false, error: 'fileId is required' });
      }
      const job = addTrainingJob(req.body);
      res.json({ success: true, job });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/training/process-queue', ...middleware, async (req, res) => {
    try {
      // Trigger execution. We do not await this to prevent holding the connection.
      startTrainingJobs().catch(e => Log.error(`[TrainingQueue] Async error: ${e.message}`));
      res.json({ success: true, message: 'Queue processing started in background' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/training/jobs/completed', ...middleware, async (req, res) => {
    try {
      await clearCompletedJobs();
      res.json({ success: true, message: 'Completed jobs cleared' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
