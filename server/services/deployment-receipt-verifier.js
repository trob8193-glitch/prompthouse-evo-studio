/**
 * PH EVO STUDIO — Deployment Receipt Verifier
 */

import { TRUTH_STATES } from './truth-labels.js';

export function classifyPreviewReceiptTruth(receipt) {
  if (!receipt) return TRUTH_STATES.UNKNOWN;
  if (receipt.status === 'blocked') return receipt.truthState || TRUTH_STATES.BLOCKED;
  if (receipt.status === 'success') {
    if (!receipt.deploymentUrl && !receipt.deploymentId) return TRUTH_STATES.ERROR;
    return TRUTH_STATES.VERIFIED;
  }
  return TRUTH_STATES.UNKNOWN;
}

export function verifyPreviewDeploymentReceipt(receipt) {
  const truth = classifyPreviewReceiptTruth(receipt);
  return {
    truthState: truth,
    verified: truth === TRUTH_STATES.VERIFIED,
    receipt,
  };
}
