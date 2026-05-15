import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { requireDeployApproval } from '../middleware/security-gates.js';
import { runVercelPreviewDeploy } from '../services/vercel-preview-runner.js';

/**
 * PH EVO STUDIO — VERCEL PREVIEW DEPLOY ROUTES
 * ═══════════════════════════════════════════════════════════════
 * POST /api/vercel/preview-deploy
 * Requires ownerApproval (scope: deploy).
 * No production deploy allowed.
 */
export function registerVercelPreviewDeployRoutes(app, context) {
  const { routeRegistry } = context;

  app.post('/api/vercel/preview-deploy',
    createRegisteredRouteMiddleware(routeRegistry, {
      method: 'POST', path: '/api/vercel/preview-deploy',
      source: 'vercel-preview-deploy.routes.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: [S.DEPLOY, S.EXECUTE_EXTERNAL],
      localOnly: true,
    }),
    requireDeployApproval, // Hard gate requiring Owner Approval
    async (req, res) => {
      try {
        const { ownerApproval } = req.body || {};
        
        // Execute the preview deployment
        const result = await runVercelPreviewDeploy({ ownerApproval });

        if (result.ok) {
          res.json(result);
        } else {
          // Status 400 for blocked/bad request, 500 for actual errors
          const statusCode = result.truthState === TRUTH_STATES.ERROR ? 500 : 400;
          res.status(statusCode).json(result);
        }
      } catch (error) {
        res.status(500).json({ 
          ok: false, 
          truthState: TRUTH_STATES.ERROR, 
          error: error.message,
          message: 'Internal server error during preview deployment request.'
        });
      }
    }
  );
}
