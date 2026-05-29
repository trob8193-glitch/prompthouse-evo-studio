import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default function registerQuadBrainRoutes(app) {
  const router = express.Router();
  const GATEWAY_KEY = "EVO_STUDIO_BYPASS";

  router.use(express.json());

  // Middleware to enforce gateway bypass for Brain 2
  router.use((req, res, next) => {
    const key = req.headers['x-studio-gateway-key'];
    if (key !== GATEWAY_KEY) {
      return res.status(403).json({ success: false, error: "Unauthorized. Missing QuadBrain Gateway Key." });
    }
    next();
  });

  // Brain 2 -> Brain 1 Trigger: Deep Audit
  router.post('/audit/trigger', async (req, res) => {
    try {
      // Trigger the local audit script in the background
      exec('node scripts/deep-audit.mjs', { cwd: process.cwd() });
      
      res.json({
        success: true,
        message: "Nuclear Truth Audit triggered. IDE Agent and Daemons will process the results."
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Brain 2 -> Brain 3 Queue: IDE Queue
  router.post('/ide/queue', async (req, res) => {
    try {
      const { task_description, priority = "normal" } = req.body;
      if (!task_description) {
        return res.status(400).json({ success: false, error: "task_description required" });
      }

      const queueFile = path.join(process.cwd(), '.prompthouse-data', 'evo-layer', 'ide_queue.json');
      const queueDir = path.dirname(queueFile);
      try { await fs.mkdir(queueDir, { recursive: true }); } catch (e) {}

      let queue = [];
      try { queue = JSON.parse(await fs.readFile(queueFile, "utf-8")); } catch (e) {}
      
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
        timestamp: new Date().toISOString(),
        source: "actions_gpt_brain",
        priority,
        description: task_description,
        status: "pending"
      };
      
      queue.push(newTask);
      await fs.writeFile(queueFile, JSON.stringify(queue, null, 2), "utf-8");
      
      res.json({
        success: true,
        message: "Task delegated to IDE Agent.",
        taskId: newTask.id
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Brain 2 & 4 -> Mobile App Generator
  router.post('/mobile/generate', async (req, res) => {
    try {
      const { feature, architecture = "clean_riverpod" } = req.body;
      if (!feature) return res.status(400).json({ success: false, error: "feature required" });
      
      const cmd = `node scripts/mobile-architect-cli.mjs "${feature}" "${architecture}"`;
      const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });
      
      res.json({
        success: true,
        message: `Mobile architecture generation triggered for ${feature}.`,
        stdout,
        stderr
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Brain 2 & 4 -> Evo X-Ray (Semantic Drift)
  router.get('/xray', async (req, res) => {
    try {
      const { StudioDiagnostics } = await import('../src/features/studio_diagnostics_logic.js');
      const engine = new StudioDiagnostics();
      const results = engine.getDiagnostics();
      res.json({
        success: true,
        xray_score: results.summary.avg_drift,
        health: results.summary
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Brain 4 -> API Manifest
  router.get('/apis', async (req, res) => {
    try {
      const generatedApiDir = path.join(process.cwd(), 'generated_apis');
      const files = await fs.readdir(generatedApiDir);
      
      const manifest = [];
      const routeRegex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
      
      for (const file of files) {
        if (!file.endsWith('.js')) continue;
        const content = await fs.readFile(path.join(generatedApiDir, file), 'utf8');
        let match;
        while ((match = routeRegex.exec(content)) !== null) {
          manifest.push({ file, method: match[1].toUpperCase(), route: match[2] });
        }
      }
      res.json({ success: true, total: manifest.length, endpoints: manifest });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.use('/api/quadbrain', router);
}
