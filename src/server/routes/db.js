import express from 'express';
import db, { getConfigValue, setConfigValue, getAllConfigValues, createProofReceipt, getRecentProofReceipts, setMemory, getMemory, getAgentMemories, getNightForgeDBState, setNightForgeDBState } from '../../core/db/quad_schema.js';

const router = express.Router();

// Proof Receipts
router.get('/proof-receipts', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    res.json({ receipts: getRecentProofReceipts(limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/proof-receipts', (req, res) => {
  try {
    const receipt = createProofReceipt(req.body);
    res.json({ ok: true, receipt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Agent Memory
router.get('/memory/:agent', (req, res) => {
  try {
    res.json({ memories: getAgentMemories(req.params.agent) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/memory/:agent/:key', (req, res) => {
  try {
    const memory = getMemory(req.params.agent, req.params.key);
    res.json({ memory });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/memory', (req, res) => {
  try {
    const { agent, key, memory } = req.body;
    setMemory(agent, key, memory);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// KV Config
router.get('/config', (req, res) => {
  try { res.json({ config: getAllConfigValues() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/config/:key', (req, res) => {
  try { res.json({ value: getConfigValue(req.params.key) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/config', (req, res) => {
  try {
    const { key, value } = req.body;
    setConfigValue(key, value);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// NightForge State (DB-backed)
router.get('/nightforge-state', (req, res) => {
  try { res.json({ state: getNightForgeDBState() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/nightforge-state', (req, res) => {
  try {
    setNightForgeDBState(req.body);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DB Health Stats
router.get('/stats', (req, res) => {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    const stats = {};
    for (const t of tables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
      stats[t.name] = count.count;
    }
    res.json({ tables: tables.length, rows: stats, engine: 'better-sqlite3' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
