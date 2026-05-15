import { TRUTH_STATES } from '../services/truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';
import { SECURITY_ACTION_TYPES as S } from '../services/security-classifier.js';
import { createDeploymentReceipt } from '../services/deployment-receipts.js';
import { requireDeployApproval } from '../middleware/security-gates.js';
import { classifyVercelTokenStatus } from '../services/vercel-readiness.js';

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
      const status = classifyVercelTokenStatus();
      const approval = req.body?.ownerApproval;

      if (!status.configured) {
        const receipt = createDeploymentReceipt({
          action: 'preview_deploy', provider: 'vercel', status: 'blocked',
          truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
          request: { action: 'preview_deploy', approvalReceiptId: approval?.receiptId },
          message: status.blockedReason,
        });
        return res.status(400).json({ ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS, error: status.blockedReason, receiptId: receipt.id });
      }

      // We do not have a full Vercel Adapter in this phase.
      // We must return honestly PROVIDER_GATED without claiming fake success.
      const receipt = createDeploymentReceipt({
        action: 'preview_deploy', provider: 'vercel', status: 'blocked',
        truthState: TRUTH_STATES.PROVIDER_GATED,
        request: { action: 'preview_deploy', approvalReceiptId: approval?.receiptId },
        message: 'Vercel API calls are safely disabled during this phase. Provider integration is incomplete.',
      });

      return res.json({
        ok: false,
        truthState: TRUTH_STATES.PROVIDER_GATED,
        message: 'Vercel preview deploy is provider-gated. Owner approval is valid and token is configured, but the real Vercel API call is disabled for this test phase.',
        receiptId: receipt.id,
      });
    }
  );
}
