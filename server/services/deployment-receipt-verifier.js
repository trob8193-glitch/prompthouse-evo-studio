/**
 * PH EVO STUDIO — DEPLOYMENT RECEIPT VERIFIER
 * ═══════════════════════════════════════════════════════════════
 * Verifies deployment receipts against truth standards.
 */
import { listDeploymentReceipts } from './deployment-receipts.js';
import { TRUTH_STATES } from './truth-labels.js';
import { createRegisteredRouteMiddleware } from '../route-registry.js';

/**
 * Classifies the truth state of a preview deployment receipt.
 */
export function classifyPreviewReceiptTruth(receipt) {
  if (!receipt) return TRUTH_STATES.UNKNOWN;

  const isVercel = receipt.provider === 'vercel';
  const isPreview = receipt.action === 'preview_deploy';
  const isSuccess = receipt.status === 'success';
  const hasProof = !!(receipt.deploymentUrl || receipt.metadata?.deploymentId);

  if (isVercel && isPreview && isSuccess && hasProof) {
    return TRUTH_STATES.VERIFIED; // In Phase 14, we treat verified receipts as VERIFIED
  }

  if (receipt.status === 'blocked') {
    return receipt.truthState || TRUTH_STATES.BLOCKED;
  }

  return TRUTH_STATES.ERROR;
}

/**
 * Verifies a single preview deployment receipt.
 */
export function verifyPreviewDeploymentReceipt(receipt) {
  const truthState = classifyPreviewReceiptTruth(receipt);
  return {
    valid: truthState === TRUTH_STATES.VERIFIED,
    truthState,
    receiptId: receipt?.id
  };
}

/**
 * Retrieves the latest preview deployment receipt.
 */
export function getLatestPreviewDeploymentReceipt() {
  const receipts = listDeploymentReceipts(100);
  return receipts.find(r => r.action === 'preview_deploy') || null;
}

/**
 * Registers the preview receipt verification routes.
 */
export function registerDeploymentReceiptVerifierRoutes(app, context) {
  const { routeRegistry } = context;

  app.get('/api/deployment/preview/latest',
    routeRegistry ? createRegisteredRouteMiddleware(routeRegistry, {
      method: 'GET', path: '/api/deployment/preview/latest',
      source: 'deployment-receipt-verifier.js',
      truthState: TRUTH_STATES.VERIFIED,
      security: ['READ_ONLY'], localOnly: true
    }) : (req, res, next) => next(),
    (req, res) => {
      const receipt = getLatestPreviewDeploymentReceipt();
      const truthState = classifyPreviewReceiptTruth(receipt);
      res.json({ ok: true, data: receipt, truthState });
    }
  );
}
