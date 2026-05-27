import {
  TRIBRAIN_BRAINS,
  TRIBRAIN_ABILITY_CLASSES,
  TRIBRAIN_RISK_LEVELS,
  createTriBrainSystem,
} from '../src/core/tribrain/index.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

function roleFromRequest(req) {
  return String(req.user?.role || req.headers['x-tribrain-role'] || 'viewer').toLowerCase();
}

function userFromRequest(req) {
  return String(req.user?.sub || req.headers['x-user-id'] || 'anonymous');
}

function tenantFromRequest(req) {
  return String(req.user?.tenantId || req.headers['x-tenant-id'] || 'tenant_default');
}

function projectIdsFromRequest(req) {
  const raw = req.user?.projectIds || req.headers['x-project-ids'] || '';
  if (Array.isArray(raw)) return raw;
  return String(raw).split(',').map(item => item.trim()).filter(Boolean);
}

function createSystem(req) {
  const chatgptOnline = String(req.headers['x-chatgpt-online'] || '').toLowerCase() === 'true';
  const ideOnline = String(req.headers['x-ide-online'] || '').toLowerCase() === 'true';
  return createTriBrainSystem({
    brainSettings: {
      [TRIBRAIN_BRAINS.STUDIO]: { enabled: true, available: true, localMode: true },
      [TRIBRAIN_BRAINS.CHATGPT_OPERATOR]: { enabled: true, available: chatgptOnline, localMode: false },
      [TRIBRAIN_BRAINS.IDE_AGENT]: { enabled: true, available: ideOnline, localMode: true },
    },
  });
}

function permissionContext(req) {
  return {
    tenantId: tenantFromRequest(req),
    userId: userFromRequest(req),
    role: roleFromRequest(req),
    projectIds: projectIdsFromRequest(req),
    approvals: Array.isArray(req.body?.approvals) ? req.body.approvals : [],
  };
}

export default function registerTriBrainRoutes(app) {
  app.get('/api/tribrain/status', (req, res) => {
    try { ok(res, { status: createSystem(req).status() }); } catch (error) { fail(res, error); }
  });

  app.get('/api/tribrain/contract', (req, res) => {
    try {
      ok(res, {
        brains: TRIBRAIN_BRAINS,
        abilities: TRIBRAIN_ABILITY_CLASSES,
        riskLevels: TRIBRAIN_RISK_LEVELS,
      });
    } catch (error) { fail(res, error); }
  });

  app.post('/api/tribrain/route', (req, res) => {
    try {
      const plan = createSystem(req).plan(req.body?.command || {}, permissionContext(req));
      ok(res, { plan });
    } catch (error) { fail(res, error); }
  });

  app.post('/api/tribrain/final-response', (req, res) => {
    try {
      const system = createSystem(req);
      const finalResponse = system.arbiter.arbitrate({
        command: req.body?.command || null,
        responses: Array.isArray(req.body?.responses) ? req.body.responses : [],
        permissionContext: permissionContext(req),
      });
      ok(res, { finalResponse });
    } catch (error) { fail(res, error); }
  });
}
