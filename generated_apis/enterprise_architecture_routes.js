import {
  getEnterpriseArchitectureStatus,
  getEnterpriseExpansionRoadmap,
} from '../src/core/architecture/EnterpriseArchitectureContract.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerEnterpriseArchitectureRoutes(app) {
  app.get('/api/enterprise-architecture/status', (req, res) => {
    try {
      ok(res, { architecture: getEnterpriseArchitectureStatus({ compact: req.query?.compact === 'true' }) });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/enterprise-architecture/roadmap', (_req, res) => {
    try {
      ok(res, { roadmap: getEnterpriseExpansionRoadmap() });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/enterprise-architecture/products', (_req, res) => {
    try {
      ok(res, { products: getEnterpriseArchitectureStatus({ compact: false }).productSurfaces });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/enterprise-architecture/layers', (_req, res) => {
    try {
      ok(res, { layers: getEnterpriseArchitectureStatus({ compact: false }).infrastructureLayers });
    } catch (error) {
      fail(res, error);
    }
  });
}
