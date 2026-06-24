/**
 * PH EVO STUDIO — DEPLOYMENT CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Frontend client for deployment readiness, blockers, receipts,
 * and owner-approved deploy actions. No secrets. No hardcoded URL.
 */
import { safeFetchBridge } from '../config/bridge-config.js';

export async function getDeploymentReadiness() {
  return safeFetchBridge('/api/deployment/readiness');
}

export async function getDeploymentBlockers() {
  return safeFetchBridge('/api/deployment/blockers');
}

export async function getDeploymentEnvironment() {
  return safeFetchBridge('/api/deployment/environment');
}

export async function getDeploymentReceipts(limit = 50) {
  return safeFetchBridge(`/api/deployment/receipts?limit=${limit}`);
}

/**
 * Request a Vercel preview deploy. Requires caller-provided ownerApproval.
 */
export async function requestVercelPreviewDeploy(payload) {
  if (!payload || !payload.ownerApproval) {
    return { ok: false, error: 'ownerApproval is required for deploy request.', truthState: 'NEEDS_OWNER_APPROVAL' };
  }
  return safeFetchBridge('/api/deployment/vercel/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
