import {
  getOmnibotMobileContract,
  getOmnibotMobileStatus,
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

  app.post('/api/omnibot-mobile/receipt', (req, res) => {
    res.json(writeOmnibotMobileReceipt({ rootDir, type: 'omnibot_mobile_api_receipt', payload: req.body || {} }));
  });
}
