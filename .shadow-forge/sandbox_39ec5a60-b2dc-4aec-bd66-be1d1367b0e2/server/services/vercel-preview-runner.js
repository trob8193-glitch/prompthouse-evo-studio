/**
 * PH EVO STUDIO — Vercel Preview Runner
 */

import fetch from 'node-fetch';
import { TRUTH_STATES } from './truth-labels.js';
import { classifyVercelTokenStatus } from './vercel-readiness.js';
import { createProviderReceipt } from './provider-receipts.js';

export function validatePreviewDeployInput(params) {
  if (!params?.ownerApproval?.granted) {
    return { valid: false, reason: 'Owner approval required for preview deploy' };
  }
  return { valid: true };
}

export async function runVercelPreviewDeploy(params = {}) {
  if (!params.ownerApproval?.granted) {
    const receipt = createProviderReceipt({
      provider: 'vercel',
      action: 'preview_deploy',
      status: 'blocked',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      message: 'Owner approval required',
      requestPayload: { target: 'preview' }
    });
    return { ok: false, truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL, blockedReason: 'Owner approval required', receipt, receiptId: receipt.id };
  }

  const tokenStatus = classifyVercelTokenStatus();
  if (!tokenStatus.configured) {
    const receipt = createProviderReceipt({
      provider: 'vercel',
      action: 'preview_deploy',
      status: 'blocked',
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      message: 'VERCEL_TOKEN not configured',
      requestPayload: { target: 'preview', approvalReceiptId: params.ownerApproval?.receiptId || null }
    });
    return { ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS, blockedReason: 'VERCEL_TOKEN not configured', receipt, receiptId: receipt.id };
  }

  const token = process.env.VERCEL_TOKEN;
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'ph-evo-proof', target: 'preview' }),
  });

  const data = await response.json();
  const deploymentUrl = data.url ? `https://${data.url}` : null;
  const receipt = createProviderReceipt({
    provider: 'vercel',
    action: 'preview_deploy',
    status: response.ok ? 'success' : 'blocked',
    truthState: response.ok ? TRUTH_STATES.PROVEN : TRUTH_STATES.ERROR,
    message: response.ok ? 'Vercel preview deployment created.' : 'Vercel preview deployment request failed.',
    requestPayload: { target: 'preview', approvalReceiptId: params.ownerApproval?.receiptId || null },
    responsePayload: { deploymentId: data.id, deploymentUrl, inspectorUrl: data.inspectorUrl, status: response.status }
  });

  if (!response.ok) {
    return {
      ok: false,
      truthState: TRUTH_STATES.ERROR,
      blockedReason: data.error?.message || data.message || 'Vercel preview deployment request failed',
      receipt,
      receiptId: receipt.id
    };
  }

  return {
    ok: true,
    deploymentUrl,
    deploymentId: data.id,
    inspectorUrl: data.inspectorUrl,
    receipt,
    receiptId: receipt.id,
    truthState: TRUTH_STATES.PROVEN,
  };
}
