/**
 * PH EVO STUDIO — DEPLOY ACTION ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Owner-approved deployment action route.
 * Requires ownerApproval scope deploy + VERCEL_TOKEN.
 * Creates blocked receipts for denied/missing attempts.
 */
import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { createDeploymentReceipt } from '../services/deployment-receipts.js';

export function registerDeployActionRoutes(app, context) {
  const { routeRegistry } = context;

  // POST /api/deployment/vercel/preview
  app.post('/api/deployment/vercel/preview',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'POST', path: '/api/deployment/vercel/preview',
      source: 'deploy-action.routes.js',
      truthState: 'NEEDS_OWNER_APPROVAL',
      security: [S.DEPLOY, S.PROVIDER_CALL, S.REQUIRES_AUTH],
      localOnly: false,
    }) : (req, res, next) => next(),
    (req, res) => {
      const body = req.body || {};

      // 1. Check owner approval
      const approval = body.ownerApproval;
      if (!approval || approval.granted !== true || approval.scope !== 'deploy') {
        const receipt = createDeploymentReceipt({
          action: 'preview_deploy', provider: 'vercel', status: 'blocked',
          truthState: 'NEEDS_OWNER_APPROVAL',
          request: { action: 'preview_deploy' },
          message: 'Missing or invalid owner approval for deploy scope.',
        });
        return res.status(403).json({
          ok: false, truthState: 'NEEDS_OWNER_APPROVAL',
          error: 'Owner approval with scope "deploy" is required.',
          receiptId: receipt.id,
        });
      }

      // 2. Check VERCEL_TOKEN
      const token = process.env.VERCEL_TOKEN;
      if (!token) {
        const receipt = createDeploymentReceipt({
          action: 'preview_deploy', provider: 'vercel', status: 'blocked',
          truthState: 'NEEDS_CREDENTIALS',
          request: { action: 'preview_deploy', approvalReceiptId: approval.receiptId },
          message: 'VERCEL_TOKEN is not configured.',
        });
        return res.status(403).json({
          ok: false, truthState: 'NEEDS_CREDENTIALS',
          error: 'VERCEL_TOKEN environment variable is required for Vercel deployment.',
          receiptId: receipt.id,
        });
      }

      // 3. Vercel API integration is PROVIDER_GATED until real implementation wired
      // If a real VercelAdapter exists in the project, it could be called here.
      // For now, we honestly report this as provider-gated.
      const receipt = createDeploymentReceipt({
        action: 'preview_deploy', provider: 'vercel', status: 'blocked',
        truthState: 'PROVIDER_GATED',
        request: { action: 'preview_deploy', approvalReceiptId: approval.receiptId },
        message: 'Vercel preview deployment route is wired but the live API call is provider-gated. Real deployment requires the VercelAdapter integration to be activated.',
      });

      return res.json({
        ok: false, truthState: 'PROVIDER_GATED',
        message: 'Vercel preview deploy is provider-gated. Owner approval is valid, but real Vercel API call is not yet activated in this route.',
        receiptId: receipt.id,
        nextAction: 'Activate VercelAdapter integration to enable real preview deploys.',
      });
    }
  );
}
