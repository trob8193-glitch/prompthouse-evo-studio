import {
  QUADBRAIN_ABILITY_CLASSES,
  QUADBRAIN_BRAINS,
  QUADBRAIN_SURFACES,
  getQuadBrainStatus,
  routeQuadBrainSurface,
} from '../src/core/quadbrain/index.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerQuadBrainRoutes(app) {
  app.get('/api/quadbrain/status', (_req, res) => {
    ok(res, { status: getQuadBrainStatus() });
  });

  app.get('/api/quadbrain/contract', (_req, res) => {
    ok(res, {
      brains: QUADBRAIN_BRAINS,
      abilities: QUADBRAIN_ABILITY_CLASSES,
      surfaces: QUADBRAIN_SURFACES,
    });
  });

  app.post('/api/quadbrain/route', (req, res) => {
    try {
      const route = routeQuadBrainSurface({
        surface: req.body?.surface,
        abilityClass: req.body?.abilityClass,
      });
      ok(res, { route });
    } catch (error) {
      fail(res, error);
    }
  });
}
