/**
 * PromptHouse real execution routes.
 *
 * Provides a narrow API wrapper around RealExecutionPipeline:
 * intent -> manifest -> connector handshakes -> proof -> artifact.
 */

import { exec } from 'child_process';
import crypto from 'crypto';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

export function registerExecutionRoutes(app, { pipeline } = {}) {
  if (!pipeline) {
    throw new Error('registerExecutionRoutes requires a RealExecutionPipeline instance.');
  }

  app.post('/api/execution/run', async (req, res) => {
    const { intent, raw_code, options = {} } = req.body || {};
    
    // Live Execution Sandbox (The Sovereign Forge)
    if (raw_code) {
      return new Promise((resolve) => {
        const timeoutMs = options.timeout || 10000; // 10s default timeout
        const forgeId = `forge_${crypto.randomBytes(4).toString('hex')}`;
        
        console.log(`[SOVEREIGN FORGE] Executing sandbox code block: ${forgeId}`);
        
        const proc = exec(`node -e "${raw_code.replace(/"/g, '\\"')}"`, { timeout: timeoutMs }, (error, stdout, stderr) => {
          const receipt = {
            forge_id: forgeId,
            timestamp: new Date().toISOString(),
            status: error ? 'failed' : 'passed',
            stdout: stdout ? stdout.trim() : '',
            stderr: stderr ? stderr.trim() : '',
            execution_time_ms: null, // Would require performance.now() tracking
            error: error ? error.message : null
          };
          resolve(ok(res, { receipt, truthState: error ? 'FORGE_SANDBOX_ERROR' : 'FORGE_SANDBOX_SUCCESS' }));
        });
      });
    }

    if (!intent || typeof intent !== 'string' || intent.trim().length === 0) {
      return fail(res, 'intent or raw_code is required', 400);
    }

    try {
      const execution = await pipeline.executeWorkflow(intent.trim(), options);
      ok(res, { execution, truthState: 'WORKFLOW_EXECUTION_STARTED' });
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
