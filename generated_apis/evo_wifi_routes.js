import { getEvoWiFiStatus, getEvoWiFiTopology, evaluateBrainRoute, listBonds } from '../src/core/signals/EvoWiFi.js';

function sendOk(res, payload = {}) {
  return res.json({ success: true, ...payload });
}

function sendFailure(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error?.message || String(error) });
}

export default function registerEvoWiFiRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.get('/api/evo-wifi/status', async (req, res) => {
    try {
      const status = await getEvoWiFiStatus(rootDir);
      sendOk(res, status);
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.get('/api/evo-wifi/topology', async (req, res) => {
    try {
      const topology = await getEvoWiFiTopology(rootDir);
      sendOk(res, topology);
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.get('/api/evo-wifi/devices', (req, res) => {
    try {
      const bonds = listBonds(rootDir);
      sendOk(res, { devices: bonds.map(b => b.deviceName) });
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.post('/api/evo-wifi/route-intent', async (req, res) => {
    try {
      const body = req.body || {};
      const status = await getEvoWiFiStatus(rootDir);
      const bonds = listBonds(rootDir);
      
      const routingDecision = evaluateBrainRoute(body, status, bonds);
      sendOk(res, routingDecision);
    } catch (error) {
      sendFailure(res, error);
    }
  });
}
