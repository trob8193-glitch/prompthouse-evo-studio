/**
 * PromptHouse real execution routes.
 *
 * Provides a narrow API wrapper around RealExecutionPipeline:
 * intent -> manifest -> connector handshakes -> proof -> artifact.
 */

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export function registerExecutionRoutes(app, { pipeline } = {}) {
  if (!pipeline) {
    throw new Error('registerExecutionRoutes requires a RealExecutionPipeline instance.');
  }

  app.post('/api/execution/run', async (req, res) => {
    const { intent, options = {} } = req.body || {};
    if (!intent || typeof intent !== 'string' || intent.trim().length === 0) {
      return fail(res, 'intent is required and must be a non-empty string', 400);
    }

    try {
      const execution = await pipeline.executeWorkflow(intent.trim(), options);
      ok(res, { execution });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/execution', (req, res) => {
    try {
      ok(res, { executions: pipeline.getAllExecutions() });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/execution/:executionId', (req, res) => {
    try {
      const execution = pipeline.getExecutionStatus(req.params.executionId);
      if (!execution) return fail(res, `Unknown execution: ${req.params.executionId}`, 404);
      ok(res, { execution });
    } catch (error) {
      fail(res, error);
    }
  });

  console.log('Execution routes registered: /api/execution/*');
}

export default registerExecutionRoutes;
