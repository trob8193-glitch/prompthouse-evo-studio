import { registerBond, listBonds, revokeBond } from '../src/core/signals/EvoWiFi.js';

function sendOk(res, payload = {}) {
  return res.json({ success: true, ...payload });
}

function sendFailure(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error?.message || String(error) });
}

export default function registerEvoBondsRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.post('/api/evo-bonds/register', (req, res) => {
    try {
      const body = req.body || {};
      const bondResult = registerBond(rootDir, body);
      sendOk(res, bondResult);
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.get('/api/evo-bonds/list', (req, res) => {
    try {
      const bonds = listBonds(rootDir);
      sendOk(res, { bonds });
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.post('/api/evo-bonds/verify', (req, res) => {
    try {
      const { deviceName, role } = req.body || {};
      const bonds = listBonds(rootDir);
      const isVerified = bonds.some(b => b.deviceName === deviceName && b.role === role);
      sendOk(res, { verified: isVerified });
    } catch (error) {
      sendFailure(res, error);
    }
  });

  app.post('/api/evo-bonds/revoke', (req, res) => {
    try {
      const { bondId } = req.body || {};
      if (!bondId) throw new Error("bondId required");
      const result = revokeBond(rootDir, bondId);
      sendOk(res, result);
    } catch (error) {
      sendFailure(res, error);
    }
  });
}
