import { getEvoWiFiStatus, evaluateBrainRoute, listBonds } from '../src/core/signals/EvoWiFi.js';

function sendOk(res, payload = {}) {
  return res.json({ success: true, ...payload });
}

function sendFailure(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error?.message || String(error) });
}

export default function registerBrainRouterRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.post('/api/brain-router/evaluate', async (req, res) => {
    try {
      const intentData = req.body || {};
      const status = await getEvoWiFiStatus(rootDir);
      const bonds = listBonds(rootDir);
      
      const routingDecision = evaluateBrainRoute(intentData, status, bonds, rootDir);
      sendOk(res, routingDecision);
    } catch (error) {
      sendFailure(res, error);
    }
  });
}
