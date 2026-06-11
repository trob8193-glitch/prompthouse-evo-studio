import {
  buildSignalLearningDataset,
  getSignalLearningContract,
  getSignalLearningStatus,
  importEvoSignalFabricSnapshot,
  ingestEvoSignalLearningEvent,
  writeSignalLearningReceipt
} from '../src/core/evo-llm/EvoSignalLearningBridge.js';
import { collectEvoSignalFabric } from '../src/core/signals/EvoSignalFabric.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerEvoSignalLearningRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.get('/api/evo-signal-learning/contract', (_req, res) => {
    ok(res, { contract: getSignalLearningContract() });
  });

  app.get('/api/evo-signal-learning/status', (req, res) => {
    try {
      ok(res, { status: getSignalLearningStatus({ rootDir, limit: Number(req.query.limit || 500) }) });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-signal-learning/ingest', (req, res) => {
    try {
      ok(res, ingestEvoSignalLearningEvent({ rootDir, event: req.body || {} }));
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-signal-learning/import-fabric', async (req, res) => {
    try {
      const body = req.body || {};
      const fabric = body.fabric || await collectEvoSignalFabric({ rootDir, timeoutMs: Number(body.timeoutMs || 1200) });
      const connectedSources = Array.isArray(body.connectedSources) ? body.connectedSources : [];
      ok(res, importEvoSignalFabricSnapshot({ rootDir, fabric, connectedSources }));
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-signal-learning/dataset', (req, res) => {
    try {
      ok(res, buildSignalLearningDataset({
        rootDir,
        limit: Number(req.body?.limit || 1000),
        rebuildMainDataset: req.body?.rebuildMainDataset !== false
      }));
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-signal-learning/receipt', (req, res) => {
    try {
      ok(res, writeSignalLearningReceipt({ rootDir, type: req.body?.type || 'signal_learning_receipt', payload: req.body?.payload || {} }));
    } catch (error) {
      fail(res, error);
    }
  });
}
