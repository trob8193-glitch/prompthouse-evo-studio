import {
  buildAppIntelligenceDataset,
  getAppIntelligenceContract,
  getAppIntelligenceStatus,
  ingestAppIntelligenceSource,
  writeAppIntelligenceReceipt
} from '../src/core/evo-llm/EvoAppIntelligenceBridge.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerEvoAppIntelligenceRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.get('/api/evo-app-intelligence/contract', (_req, res) => {
    ok(res, { contract: getAppIntelligenceContract() });
  });

  app.get('/api/evo-app-intelligence/status', (req, res) => {
    try {
      ok(res, { status: getAppIntelligenceStatus({ rootDir, limit: Number(req.query.limit || 500) }) });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-app-intelligence/source', (req, res) => {
    try {
      ok(res, ingestAppIntelligenceSource({ rootDir, source: req.body || {} }));
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-app-intelligence/dataset', (req, res) => {
    try {
      ok(res, buildAppIntelligenceDataset({ rootDir, limit: Number(req.body?.limit || 1000), rebuildMainDataset: req.body?.rebuildMainDataset !== false }));
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/evo-app-intelligence/receipt', (req, res) => {
    try {
      ok(res, writeAppIntelligenceReceipt({ rootDir, type: req.body?.type || 'app_intelligence_receipt', payload: req.body?.payload || {} }));
    } catch (error) {
      fail(res, error);
    }
  });
}
