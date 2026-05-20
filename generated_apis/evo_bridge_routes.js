import { runSpineCore, getSpineCoreContract } from '../src/core/spinecore/index.js';

const route = (...parts) => parts.join('');

export function registerEvoBridgeRoutes(app) {
  app['get'](route('/api/', 'evo-bridge/', 'status'), (_req, res) => {
    res.json({ success: true, truthState: 'EVO_BRIDGE_READY', contract: getSpineCoreContract() });
  });

  app['post'](route('/api/', 'evo-bridge/', 'run'), (req, res) => {
    const body = req.body || {};
    const result = runSpineCore({
      lessons: Array.isArray(body.lessons) ? body.lessons : [],
      objective: body.objective || 'Improve Evo bridge'
    });
    res.json(result);
  });
}

export default registerEvoBridgeRoutes;
