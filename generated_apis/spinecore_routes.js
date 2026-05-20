import { runSpineCore, getSpineCoreContract } from '../src/core/spinecore/index.js';

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}

export function registerSpineCoreRoutes(app) {
  app.get('/api/spinecore/status', (_req, res) => {
    json(res, 200, {
      success: true,
      truthState: 'SPINECORE_ROUTE_READY',
      contract: getSpineCoreContract()
    });
  });

  app.post('/api/spinecore/run', async (req, res) => {
    try {
      const body = req.body || {};
      const result = runSpineCore({ lessons: body.lessons || [], objective: body.objective || 'Improve learning pipeline' });
      json(res, 200, result);
    } catch (error) {
      json(res, 500, { success: false, truthState: 'SPINECORE_ROUTE_FAILED', error: error.message || String(error) });
    }
  });
}

export default registerSpineCoreRoutes;
