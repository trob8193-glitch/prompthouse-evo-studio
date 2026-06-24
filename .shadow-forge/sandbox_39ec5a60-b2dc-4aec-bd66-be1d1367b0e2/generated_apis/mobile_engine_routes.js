import { MobileEngine } from '../src/mobile-engine.js';
import { UniversalAIAdaptor } from '../lib/ai/UniversalAIAdaptor.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

export function registerMobileEngineRoutes(app, { authMiddleware = null, requireSubscription = null } = {}) {
  const engine = new MobileEngine(new UniversalAIAdaptor());
  
  const middleware = [];
  if (authMiddleware) middleware.push(authMiddleware);
  // Optional Paywall: if (requireSubscription) middleware.push(requireSubscription);

  app.post('/api/mobile-engine/execute', ...middleware, async (req, res) => {
    try {
      const { feature, arch } = req.body;
      if (!feature) {
        return res.status(400).json({ success: false, error: 'Feature name is required' });
      }
      Log.info(`[API] Triggered MobileEngine execution for feature: ${feature}`);
      const result = await engine.execute({ feature, arch });
      if (!result.success) {
        return res.status(500).json(result);
      }
      res.json(result);
    } catch (err) {
      Log.error(`[API] MobileEngine Error: ${err.message}`);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/mobile-engine/status', (req, res) => {
    res.json({ success: true, ...engine.getStatus() });
  });
}
