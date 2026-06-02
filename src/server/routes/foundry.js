import express from 'express';

export default function createFoundryRouter(dependencies) {
  const router = express.Router();
  const { foundry, saasOrchestrator, maybeRequireAuthOrMaster } = dependencies;

  router.post('/harvest', maybeRequireAuthOrMaster, async (req, res) => {
    try {
      const result = await foundry.harvest(process.cwd());
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/initiate', maybeRequireAuthOrMaster, async (req, res) => {
    try {
      const mission = req.body;
      const result = await foundry.initiateBuild(mission);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/orchestrate', maybeRequireAuthOrMaster, async (req, res) => {
    try {
      const { prompt } = req.body;
      const result = await saasOrchestrator.buildSaaS(prompt);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
