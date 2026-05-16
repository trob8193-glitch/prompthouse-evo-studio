/**
 * PH EVO STUDIO — Vercel Readiness Service
 */

import { TRUTH_STATES } from './truth-labels.js';

export function classifyVercelTokenStatus() {
  const token = process.env.VERCEL_TOKEN || '';
  if (!token.trim()) return { configured: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS };
  const redactedToken = token.length > 8 ? token.slice(0, 4) + '****' + token.slice(-4) : '****';
  return { configured: true, truthState: TRUTH_STATES.VERIFIED, redactedToken };
}

export function classifyPreviewDeployReadiness() {
  const tokenStatus = classifyVercelTokenStatus();
  if (!tokenStatus.configured) return { ready: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS };
  return { ready: true, truthState: TRUTH_STATES.VERIFIED };
}

export function classifyProductionDeployReadiness() {
  const tokenStatus = classifyVercelTokenStatus();
  const blockers = [];
  if (!tokenStatus.configured) blockers.push('VERCEL_TOKEN not configured');
  if (process.env.DEPLOY_ALLOW_PRODUCTION !== 'true') blockers.push('DEPLOY_ALLOW_PRODUCTION is false');

  if (blockers.length > 0) return { ready: false, truthState: TRUTH_STATES.BLOCKED, blockers };
  return { ready: true, truthState: TRUTH_STATES.VERIFIED, blockers: [] };
}
