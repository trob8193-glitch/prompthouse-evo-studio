import express from 'express';
import { scaffoldApp, launchApp, stopApp, listDeployedApps } from '../../../lib/deployment/SovereignDeployRail.mjs';

const router = express.Router();

// Scaffold a new app from LiveForge draft
router.post('/scaffold', (req, res) => {
  try {
    const result = scaffoldApp(req.body.draft || req.body, req.body.port || 0);
    res.json({ ok: true, ...result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Launch a scaffolded app (install deps + start dev server)
router.post('/launch', (req, res) => {
  try {
    const result = launchApp(req.body.projectDir);
    res.json({ ok: true, ...result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Scaffold + Launch in one shot
router.post('/build-and-launch', async (req, res) => {
  try {
    const scaffold = scaffoldApp(req.body.draft || req.body, req.body.port || 0);
    const launch = launchApp(scaffold.projectDir);
    res.json({ ok: true, scaffold, launch });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Stop a running app
router.post('/stop', (req, res) => {
  try {
    const result = stopApp(req.body.projectDir);
    res.json({ ok: true, ...result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// List all deployed apps
router.get('/list', (req, res) => {
  try {
    res.json({ apps: listDeployedApps() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
