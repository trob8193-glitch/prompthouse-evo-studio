import {
  getOmnibotMobileContract,
  getOmnibotMobileStatus,
  planOmnibotMobileIntent,
  registerOmnibotMobileSession,
  writeOmnibotMobileReceipt
} from '../src/core/omnibot/OmnibotMobileCore.js';

export function registerOmnibotMobileRoutes(app, options = {}) {
  const rootDir = options.rootDir || process.cwd();

  app.get('/api/omnibot-mobile/contract', (_req, res) => {
    res.json(getOmnibotMobileContract());
  });

  app.get('/api/omnibot-mobile/status', (_req, res) => {
    res.json(getOmnibotMobileStatus({ rootDir }));
  });

  app.post('/api/omnibot-mobile/session', (req, res) => {
    res.json(registerOmnibotMobileSession({ rootDir, session: req.body || {} }));
  });

  app.post('/api/omnibot-mobile/intent', (req, res) => {
    const result = planOmnibotMobileIntent({ rootDir, intent: req.body || {} });
    res.status(result.success ? 200 : 423).json(result);
  });

  app.post('/api/omnibot-mobile/plan', (req, res) => {
    const result = planOmnibotMobileIntent({ rootDir, intent: { action: 'tether-cycle-plan', ...(req.body || {}) } });
    res.status(result.success ? 200 : 423).json(result);
  });

  app.post('/api/omnibot-mobile/receipt', (req, res) => {
    res.json(writeOmnibotMobileReceipt({ rootDir, type: 'omnibot_mobile_api_receipt', payload: req.body || {} }));
  });
}
