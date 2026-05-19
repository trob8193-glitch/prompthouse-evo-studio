import {
  getEvolutionStatus,
  listEvolutionRuns,
  getEvolutionRun,
  runEvolutionCycle,
  loadEvolutionMemory,
  getAutonomousEvolutionDaemonStatus,
  runAutonomousEvolutionCycle,
  startAutonomousEvolutionDaemon,
  stopAutonomousEvolutionDaemon,
  loadEvolutionDaemonSettings,
  saveEvolutionDaemonSettings,
  getEvolutionKillSwitchState,
  engageEvolutionKillSwitch,
  releaseEvolutionKillSwitch,
  listEvolutionApprovalQueue,
  approveEvolutionQueueItem,
  rejectEvolutionQueueItem,
} from '../src/core/evolution/index.js';

import {
  evaluateCostedRequest,
  summarizeCostSavings,
  listCostSavingsReceipts,
  listCertifiedSavingsClaims,
  getSemanticCacheStats,
  clearSemanticCache,
  listCostReviewQueue,
  markCostReview,
} from '../src/core/gateway/index.js';

import {
  getThemeEvolutionStatus,
  suggestThemeEvolution,
  previewThemeEvolution,
  approveThemeEvolution,
  applyThemeEvolution,
  rollbackThemeEvolution,
  buildThemeRuntimePayload,
  listThemeProfiles,
} from '../src/core/theme-evolution/index.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });
const asyncRoute = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    fail(res, error);
  }
};

function cleanObjective(value, fallback) {
  const text = String(value || fallback || '').trim();
  return text.slice(0, 500) || 'Studio dashboard self-evolution cycle';
}

export default function registerEngineDashboardRoutes(app) {
  // ─── SELF-EVOLUTION DASHBOARD ROUTES ───────────────────────────────────────

  app.get('/api/self-evolution/status', (req, res) => {
    ok(res, { status: getEvolutionStatus(), daemon: getAutonomousEvolutionDaemonStatus() });
  });

  app.get('/api/self-evolution/receipts', (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 25), 100));
    ok(res, { receipts: listEvolutionRuns({ limit }) });
  });

  app.get('/api/self-evolution/receipts/:runId', (req, res) => {
    ok(res, { receipt: getEvolutionRun({ runId: req.params.runId }) });
  });

  app.get('/api/self-evolution/memory', (req, res) => {
    ok(res, { memory: loadEvolutionMemory() });
  });

  app.post('/api/self-evolution/propose', asyncRoute(async (req, res) => {
    const result = await runEvolutionCycle({
      objective: cleanObjective(req.body?.objective, 'Dashboard proposal cycle'),
      mode: 'proposal',
      applyFixes: false,
    });
    ok(res, { result, truthState: result.truthState });
  }));

  app.post('/api/self-evolution/apply-sandbox', asyncRoute(async (req, res) => {
    const result = await runEvolutionCycle({
      objective: cleanObjective(req.body?.objective, 'Dashboard sandbox repair cycle'),
      mode: 'sandbox_apply',
      applyFixes: true,
      allowRollback: true,
    });
    ok(res, { result, truthState: result.truthState });
  }));

  app.post('/api/self-evolution/proof', asyncRoute(async (req, res) => {
    const result = await runEvolutionCycle({
      objective: cleanObjective(req.body?.objective, 'Dashboard proof-gated repair cycle'),
      mode: 'proof',
      applyFixes: true,
      runTests: req.body?.runTests !== false,
      runBuild: req.body?.runBuild !== false,
      allowRollback: req.body?.allowRollback !== false,
    });
    ok(res, { result, truthState: result.truthState });
  }));

  app.get('/api/self-evolution/daemon/status', (req, res) => {
    ok(res, { daemon: getAutonomousEvolutionDaemonStatus(), settings: loadEvolutionDaemonSettings() });
  });

  app.post('/api/self-evolution/daemon/settings', (req, res) => {
    ok(res, { settings: saveEvolutionDaemonSettings(req.body || {}) });
  });

  app.post('/api/self-evolution/daemon/start', (req, res) => {
    ok(res, { daemon: startAutonomousEvolutionDaemon({ settings: req.body || {} }) });
  });

  app.post('/api/self-evolution/daemon/stop', (req, res) => {
    ok(res, { daemon: stopAutonomousEvolutionDaemon() });
  });

  app.post('/api/self-evolution/daemon/run-once', asyncRoute(async (req, res) => {
    const result = await runAutonomousEvolutionCycle({ trigger: 'dashboard' });
    ok(res, { result, truthState: result.truthState });
  }));

  app.get('/api/self-evolution/kill-switch', (req, res) => {
    ok(res, { killSwitch: getEvolutionKillSwitchState() });
  });

  app.post('/api/self-evolution/kill-switch', (req, res) => {
    ok(res, { killSwitch: engageEvolutionKillSwitch({ reason: req.body?.reason || 'Dashboard kill switch engaged' }) });
  });

  app.post('/api/self-evolution/kill-switch/release', (req, res) => {
    ok(res, { killSwitch: releaseEvolutionKillSwitch({ reason: req.body?.reason || 'Dashboard kill switch released' }) });
  });

  app.get('/api/self-evolution/approval-queue', (req, res) => {
    ok(res, { approvals: listEvolutionApprovalQueue() });
  });

  app.post('/api/self-evolution/approval-queue/:approvalId/approve', (req, res) => {
    ok(res, { approval: approveEvolutionQueueItem({ approvalId: req.params.approvalId, actor: req.body?.actor || 'studio_owner' }) });
  });

  app.post('/api/self-evolution/approval-queue/:approvalId/reject', (req, res) => {
    ok(res, { approval: rejectEvolutionQueueItem({ approvalId: req.params.approvalId, actor: req.body?.actor || 'studio_owner', reason: req.body?.reason || 'Rejected from dashboard' }) });
  });

  // ─── COST FIREWALL DASHBOARD ROUTES ────────────────────────────────────────

  app.get('/api/cost-firewall/status', (req, res) => {
    ok(res, {
      savings: summarizeCostSavings(),
      claims: listCertifiedSavingsClaims(),
      cache: getSemanticCacheStats(),
      reviews: listCostReviewQueue({ status: 'PENDING' }),
      recentReceipts: listCostSavingsReceipts({ limit: 20 }),
    });
  });

  app.get('/api/cost-firewall/savings', (req, res) => {
    ok(res, { savings: summarizeCostSavings() });
  });

  app.get('/api/cost-firewall/ledger', (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 50), 250));
    ok(res, { receipts: listCostSavingsReceipts({ limit }) });
  });

  app.get('/api/cost-firewall/claims', (req, res) => {
    ok(res, { claims: listCertifiedSavingsClaims() });
  });

  app.get('/api/cost-firewall/cache', (req, res) => {
    ok(res, { cache: getSemanticCacheStats() });
  });

  app.post('/api/cost-firewall/cache/clear', (req, res) => {
    ok(res, { cache: clearSemanticCache() });
  });

  app.get('/api/cost-firewall/review-queue', (req, res) => {
    ok(res, { reviews: listCostReviewQueue({ status: req.query.status || null }) });
  });

  app.post('/api/cost-firewall/review-queue/:id/mark', (req, res) => {
    ok(res, {
      review: markCostReview({
        id: req.params.id,
        status: req.body?.status || 'APPROVED',
        actor: req.body?.actor || 'studio_owner',
        note: req.body?.note || 'Marked from dashboard',
      }),
    });
  });

  app.post('/api/cost-firewall/estimate', (req, res) => {
    const result = evaluateCostedRequest({
      orgId: req.body?.orgId || 'org_test',
      orgPlan: req.body?.orgPlan || 'free',
      endpoint: req.body?.endpoint || '/api/nightforge/cycle',
      taskType: req.body?.taskType || 'dashboard_estimate',
      taskComplexity: req.body?.taskComplexity || 'standard',
      providerAllowed: req.body?.providerAllowed || 'any',
      messages: Array.isArray(req.body?.messages) && req.body.messages.length > 0
        ? req.body.messages
        : [{ role: 'user', content: 'Estimate PromptHouse Evo Studio dashboard repair task cost.' }],
      expectedOutputTokens: Number(req.body?.expectedOutputTokens || 1200),
    });
    ok(res, { result });
  });

  // ─── THEME EVOLUTION DASHBOARD ROUTES ──────────────────────────────────────

  app.get('/api/theme-evolution/status', (req, res) => {
    ok(res, { status: getThemeEvolutionStatus() });
  });

  app.get('/api/theme-evolution/profiles', (req, res) => {
    ok(res, { profiles: listThemeProfiles() });
  });

  app.get('/api/theme-evolution/runtime', (req, res) => {
    ok(res, { runtime: buildThemeRuntimePayload() });
  });

  app.post('/api/theme-evolution/suggest', (req, res) => {
    ok(res, { suggestion: suggestThemeEvolution({ page: req.body?.page || 'dashboard', state: req.body?.state || 'normal', preference: req.body?.preference || '' }) });
  });

  app.post('/api/theme-evolution/preview', (req, res) => {
    ok(res, { preview: previewThemeEvolution({ themeId: req.body?.themeId || 'evoCore' }) });
  });

  app.post('/api/theme-evolution/approve', (req, res) => {
    ok(res, { receipt: approveThemeEvolution({ themeId: req.body?.themeId || null, actor: req.body?.actor || 'studio_owner' }) });
  });

  app.post('/api/theme-evolution/apply', (req, res) => {
    ok(res, { receipt: applyThemeEvolution({ themeId: req.body?.themeId || null, actor: req.body?.actor || 'studio_owner' }) });
  });

  app.post('/api/theme-evolution/rollback', (req, res) => {
    ok(res, { receipt: rollbackThemeEvolution({ actor: req.body?.actor || 'studio_owner' }) });
  });
}