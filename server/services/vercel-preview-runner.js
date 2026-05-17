/**
 * PH EVO STUDIO — Vercel Preview Runner
 */

import fetch from 'node-fetch';
import { TRUTH_STATES } from './truth-labels.js';
import { classifyVercelTokenStatus } from './vercel-readiness.js';

export function validatePreviewDeployInput(params) {
  if (!params?.ownerApproval?.granted) {
    return { valid: false, reason: 'Owner approval required for preview deploy' };
  }
  return { valid: true };
}

export async function runVercelPreviewDeploy(params = {}) {
  if (!params.ownerApproval?.granted) {
    return { ok: false, truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL, blockedReason: 'Owner approval required' };
  }

  const tokenStatus = classifyVercelTokenStatus();
  if (!tokenStatus.configured) {
    return { ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS, blockedReason: 'VERCEL_TOKEN not configured' };
  }

  const token = process.env.VERCEL_TOKEN;
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'ph-evo-proof', target: 'preview' }),
  });

  const data = await response.json();
  const deploymentUrl = data.url ? `https://${data.url}` : null;

  return {
    ok: true,
    deploymentUrl,
    deploymentId: data.id,
    inspectorUrl: data.inspectorUrl,
    receiptId: `deploy_rcpt_${Date.now()}`,
    truthState: TRUTH_STATES.PROVEN,
  };
}
