import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export default function registerPlatformSentinelRoutes(app) {
  const engine = () => new PlatformReadinessEngine();

  app.get('/api/platform-sentinel/status', (req, res) => {
    try { ok(res, { status: engine().status({ runCommands: false }) }); } catch (error) { fail(res, error); }
  });

  app.get('/api/platform-sentinel/modules', (req, res) => {
    try { ok(res, { modules: engine().inspectModules() }); } catch (error) { fail(res, error); }
  });

  app.get('/api/platform-sentinel/receipts', (req, res) => {
    try { ok(res, { receipts: engine().receipts({ limit: Number(req.query.limit || 50) }) }); } catch (error) { fail(res, error); }
  });

  app.get('/api/platform-sentinel/repair-queue', (req, res) => {
    try { ok(res, { repairQueue: engine().status({ runCommands: false }).repairQueue }); } catch (error) { fail(res, error); }
  });

  app.get('/api/platform-sentinel/release-verdict', (req, res) => {
    try { ok(res, { release: engine().status({ runCommands: false }).release }); } catch (error) { fail(res, error); }
  });

  app.post('/api/platform-sentinel/audit', (req, res) => {
    try { ok(res, { status: engine().status({ runCommands: Boolean(req.body?.runCommands), includeHeavy: Boolean(req.body?.includeHeavy) }) }); } catch (error) { fail(res, error); }
  });

  app.post('/api/platform-sentinel/repair-plan', (req, res) => {
    try { ok(res, { repairQueue: engine().status({ runCommands: false }).repairQueue }); } catch (error) { fail(res, error); }
  });

  app.post('/api/platform-sentinel/receipt', (req, res) => {
    try { ok(res, { receipt: engine().receipt({ runCommands: Boolean(req.body?.runCommands), includeHeavy: Boolean(req.body?.includeHeavy) }) }); } catch (error) { fail(res, error); }
  });
}
