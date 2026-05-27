import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * Returns basic Vercel status.
 */
export async function getVercelStatus() {
  return await safeFetchBridge('/api/vercel/status');
}

/**
 * Returns detailed Vercel readiness.
 */
export async function getVercelReadiness() {
  return await safeFetchBridge('/api/vercel/readiness');
}

/**
 * Requests a preview deploy (requires ownerApproval with scope: deploy).
 */
export async function requestVercelPreviewDeploy(ownerApproval) {
  if (!ownerApproval || ownerApproval.scope !== 'deploy') {
    return { ok: false, error: 'Owner approval with scope "deploy" is required', truthState: 'NEEDS_OWNER_APPROVAL' };
  }
  
  return await safeFetchBridge('/api/vercel/preview-deploy', {
    method: 'POST',
    body: JSON.stringify({ ownerApproval })
  });
}
