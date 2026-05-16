import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Returns Vercel readiness status for preview deploy.
 */
export async function getVercelPreviewStatus() {
  return await safeFetchBridge('/api/vercel/status');
}

/**
 * Requests a real Vercel preview deployment (requires ownerApproval).
 */
export async function requestVercelPreviewDeploy(ownerApproval) {
  if (!ownerApproval || ownerApproval.scope !== 'deploy') {
    return { ok: false, error: 'Owner approval (scope: deploy) is required', truthState: 'NEEDS_OWNER_APPROVAL' };
  }

  return await safeFetchBridge('/api/vercel/preview-deploy', {
    method: 'POST',
    body: JSON.stringify({ ownerApproval })
  });
}

/**
 * Retrieves the latest preview deployment receipt from the bridge.
 */
export async function getLatestPreviewDeploymentReceipt() {
  return await safeFetchBridge('/api/deployment/preview/latest');
}
