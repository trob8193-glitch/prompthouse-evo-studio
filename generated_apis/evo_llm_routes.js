import {
  approveEvoTrainPlan,
  buildGlobalContributionPacket,
  createEvoTrainPlan,
  evaluateEvoLlmTrainingCostGate,
  evaluateEvoProviderGate,
  getGlobalNodeStatus,
  getEvoTrainRun,
  getEvoTrainStatus,
  listEvoModelVersions,
  listEvoTrainPlans,
  listEvoTrainRuns,
  promoteEvoModelVersion,
  rollbackEvoModelVersion,
  runEvoTrainPlan,
  submitGlobalContributionPacket,
  syncEvoTrainRun,
} from '../src/core/evo-llm/index.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });
const asyncRoute = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    fail(res, error);
  }
};

export default function registerEvoLlmRoutes(app) {
  app.get('/api/evo-llm/status', (req, res) => {
    try { ok(res, { status: getEvoTrainStatus() }); } catch (error) { fail(res, error); }
  });

  app.get('/api/evo-llm/plans', (req, res) => {
    try { ok(res, { plans: listEvoTrainPlans({ limit: Number(req.query.limit || 50) }) }); } catch (error) { fail(res, error); }
  });

  app.post('/api/evo-llm/plan', (req, res) => {
    try {
      ok(res, createEvoTrainPlan({
        provider: req.body?.provider || 'local-dataset',
        objective: req.body?.objective || undefined,
        model: req.body?.model || null,
        providerApiKey: req.body?.providerApiKey || null,
        providerKeyPresent: Boolean(req.body?.providerKeyPresent),
        maxTrainingBudgetUsd: req.body?.maxTrainingBudgetUsd ?? null,
        allowProviderTraining: req.body?.allowProviderTraining ?? null,
        contributionMode: req.body?.contributionMode || 'private'
      }));
    } catch (error) { fail(res, error); }
  });

  app.post('/api/evo-llm/approve', (req, res) => {
    try { ok(res, approveEvoTrainPlan({ planId: req.body?.planId, actor: req.body?.actor || 'studio_owner', scope: req.body?.scope || 'dataset-only' })); } catch (error) { fail(res, error); }
  });

  app.post('/api/evo-llm/run', asyncRoute(async (req, res) => {
    ok(res, await runEvoTrainPlan({
      planId: req.body?.planId,
      providerApiKey: req.body?.providerApiKey || null,
      maxTrainingBudgetUsd: req.body?.maxTrainingBudgetUsd ?? null,
      allowProviderTraining: req.body?.allowProviderTraining ?? null
    }));
  }));

  app.get('/api/evo-llm/runs', (req, res) => {
    try { ok(res, { runs: listEvoTrainRuns({ limit: Number(req.query.limit || 50) }) }); } catch (error) { fail(res, error); }
  });

  app.get('/api/evo-llm/runs/:runId', (req, res) => {
    try {
      const run = getEvoTrainRun({ runId: req.params.runId });
      if (!run) return fail(res, `Unknown run: ${req.params.runId}`, 404);
      ok(res, { run });
    } catch (error) { fail(res, error); }
  });

  app.post('/api/evo-llm/runs/:runId/sync', asyncRoute(async (req, res) => {
    ok(res, await syncEvoTrainRun({ runId: req.params.runId }));
  }));

  app.post('/api/evo-llm/promote', (req, res) => {
    try { ok(res, promoteEvoModelVersion({ runId: req.body?.runId, actor: req.body?.actor || 'studio_owner' })); } catch (error) { fail(res, error); }
  });

  app.post('/api/evo-llm/rollback', (req, res) => {
    try { ok(res, rollbackEvoModelVersion({ actor: req.body?.actor || 'studio_owner', reason: req.body?.reason || 'Dashboard rollback' })); } catch (error) { fail(res, error); }
  });

  app.get('/api/evo-llm/versions', (req, res) => {
    try { ok(res, { versions: listEvoModelVersions({ limit: Number(req.query.limit || 50) }) }); } catch (error) { fail(res, error); }
  });

  app.get('/api/evo-llm/provider-gate', (req, res) => {
    try {
      ok(res, {
        gate: evaluateEvoProviderGate({
          provider: req.query.provider || 'local-dataset',
          providerKeyPresent: req.query.providerKeyPresent === 'true',
          maxTrainingBudgetUsd: req.query.maxTrainingBudgetUsd ?? null,
          allowProviderTraining: req.query.allowProviderTraining ?? null
        })
      });
    } catch (error) { fail(res, error); }
  });

  app.get('/api/evo-llm/cost-gate', (req, res) => {
    try { ok(res, { gate: evaluateEvoLlmTrainingCostGate({ provider: req.query.provider || 'local-dataset', examples: Number(req.query.examples || 0) }) }); } catch (error) { fail(res, error); }
  });

  app.get('/api/evo-llm/global-node/status', (req, res) => {
    try { ok(res, { status: getGlobalNodeStatus() }); } catch (error) { fail(res, error); }
  });

  app.post('/api/evo-llm/global-node/package', (req, res) => {
    try {
      ok(res, buildGlobalContributionPacket({
        contributor: req.body?.contributor || 'local-copy',
        scope: req.body?.scope || 'global-corpus',
        includeExamples: req.body?.includeExamples === true,
        consent: req.body?.consent || {}
      }));
    } catch (error) { fail(res, error); }
  });

  app.post('/api/evo-llm/global-node/submit', asyncRoute(async (req, res) => {
    ok(res, await submitGlobalContributionPacket({
      packetId: req.body?.packetId || null,
      hubUrl: req.body?.hubUrl || process.env.GLOBAL_EVO_HUB_URL,
      hubToken: req.body?.hubToken || process.env.GLOBAL_EVO_HUB_TOKEN
    }));
  }));
}
