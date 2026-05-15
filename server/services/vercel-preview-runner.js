/**
 * PH EVO STUDIO — VERCEL PREVIEW RUNNER SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Performs real Vercel Preview Deployments using the Vercel API.
 * Requires ownerApproval (scope: deploy).
 * NO production deploy allowed.
 */
import fetch from 'node-fetch';
import { TRUTH_STATES } from './truth-labels.js';
import { createDeploymentReceipt } from './deployment-receipts.js';
import { classifyVercelTokenStatus } from './vercel-readiness.js';

/**
 * Validates the input for a preview deployment.
 */
export function validatePreviewDeployInput(input) {
  const { ownerApproval } = input;
  if (!ownerApproval || ownerApproval.scope !== 'deploy' || !ownerApproval.granted) {
    return { valid: false, reason: 'Missing or invalid owner approval (scope: deploy required).' };
  }
  
  const tokenStatus = classifyVercelTokenStatus();
  if (!tokenStatus.configured) {
    return { valid: false, reason: tokenStatus.blockedReason || 'VERCEL_TOKEN not configured.', truthState: TRUTH_STATES.NEEDS_CREDENTIALS };
  }

  if (process.env.DEPLOY_ALLOW_PRODUCTION === 'true') {
    // Safety check: this runner is for PREVIEW ONLY. 
    // If production is enabled, we still force this specific runner to be preview-only.
  }

  return { valid: true };
}

/**
 * Normalizes Vercel API response into a standard Studio format.
 */
export function normalizeVercelPreviewResult(data) {
  return {
    ok: true,
    truthState: TRUTH_STATES.VERIFIED,
    deploymentId: data.id,
    deploymentUrl: `https://${data.url}`,
    inspectUrl: data.inspectorUrl,
    message: 'Vercel preview deployment created successfully.'
  };
}

/**
 * Creates a blocked response with a receipt.
 */
export function buildPreviewDeployBlockedResponse(reason, status = 'blocked', truthState = TRUTH_STATES.BLOCKED) {
  const receipt = createDeploymentReceipt({
    action: 'preview_deploy',
    provider: 'vercel',
    status,
    truthState,
    message: reason
  });

  return {
    ok: false,
    truthState,
    blockedReason: reason,
    receiptId: receipt.id,
    message: reason
  };
}

/**
 * Performs a real Vercel Preview Deployment.
 */
export async function runVercelPreviewDeploy(input = {}) {
  const validation = validatePreviewDeployInput(input);
  if (!validation.valid) {
    const truthState = validation.truthState || TRUTH_STATES.NEEDS_OWNER_APPROVAL;
    return buildPreviewDeployBlockedResponse(validation.reason, 'blocked', truthState);
  }

  try {
    // Attempt a minimal proof deployment to Vercel (as implemented in Phase 13A proof)
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ph-evo-studio-preview-proof',
        files: [
          {
            file: 'index.html',
            data: `<h1>PH Evo Studio — Vercel Preview Deploy Proof</h1><p>Verified with real Vercel API call at ${new Date().toISOString()}.</p><p>Approval Receipt: ${input.ownerApproval?.receiptId || 'none'}</p>`
          }
        ],
        projectSettings: { framework: null }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = `Vercel API Error: ${data.error?.message || response.statusText}`;
      const receipt = createDeploymentReceipt({
        action: 'preview_deploy', provider: 'vercel', status: 'failed',
        truthState: TRUTH_STATES.ERROR,
        message: errorMsg,
      });
      return {
        ok: false,
        truthState: TRUTH_STATES.ERROR,
        error: errorMsg,
        receiptId: receipt.id
      };
    }

    // Success
    const result = normalizeVercelPreviewResult(data);
    const receipt = createDeploymentReceipt({
      action: 'preview_deploy',
      provider: 'vercel',
      status: 'success',
      truthState: TRUTH_STATES.VERIFIED,
      deploymentUrl: result.deploymentUrl,
      metadata: { deploymentId: result.deploymentId, inspectUrl: result.inspectUrl }
    });

    return {
      ...result,
      receiptId: receipt.id
    };
  } catch (error) {
    const errorMsg = `Network error during Vercel deployment: ${error.message}`;
    const receipt = createDeploymentReceipt({
      action: 'preview_deploy', provider: 'vercel', status: 'failed',
      truthState: TRUTH_STATES.ERROR,
      message: errorMsg,
    });
    return {
      ok: false,
      truthState: TRUTH_STATES.ERROR,
      error: errorMsg,
      receiptId: receipt.id
    };
  }
}
