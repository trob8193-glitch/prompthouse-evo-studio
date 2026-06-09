import { buildEdgeIoAudit } from '../src/core/edge-io/EdgeIoAudit.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerEdgeIoRoutes(app) {
  app.get('/api/edge-io/audit', (req, res) => {
    try { ok(res, { audit: buildEdgeIoAudit() }); } catch (error) { fail(res, error); }
  });

  app.get('/api/edge-io/status', (req, res) => {
    try { ok(res, { status: buildEdgeIoAudit() }); } catch (error) { fail(res, error); }
  });
}
