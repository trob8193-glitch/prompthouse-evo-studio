import {
  collectEvoSignalFabric,
  getEvoSignalFabricContract,
  routeEvoSignalIntent,
  writeEvoSignalReceipt
} from '../src/core/signals/EvoSignalFabric.js';

function sendOk(res, payload = {}) {
  return res.json({ success: true, ...payload });
}

function sendFailure(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error?.message || String(error) });
}

export default function registerEvoSignalFabricRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.get('/api/evo-signal-fabric/contract', (_req, res) => {
    sendOk(res, { contract: getEvoSignalFabricContract() });
  });

  app.get('/api/evo-signal-fabric/status', async (req, res) => {
    try {
      const timeoutMs = Number(req.query.timeoutMs || 1200);
      const fabric = await collectEvoSignalFabric({ rootDir, timeoutMs });
      sendOk(res, { fabric });
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.post('/api/evo-signal-fabric/route-intent', async (req, res) => {
    try {
      const body = req.body || {};
      const fabric = await collectEvoSignalFabric({ rootDir, timeoutMs: Number(body.timeoutMs || 1200) });
      const decision = routeEvoSignalIntent(body, fabric);
      const receipt = body.writeReceipt === false ? null : writeEvoSignalReceipt({ rootDir, fabric, decision, type: 'evo_signal_route_receipt' });
      sendOk(res, { fabric, decision, receipt });
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.post('/api/evo-signal-fabric/receipt', async (req, res) => {
    try {
      const timeoutMs = Number(req.body?.timeoutMs || 1200);
      const fabric = await collectEvoSignalFabric({ rootDir, timeoutMs });
      const receipt = writeEvoSignalReceipt({ rootDir, fabric, decision: req.body?.decision || null });
      sendOk(res, { receipt });
    } catch (error) {
      sendFailure(res, error);
    }
  });
}
