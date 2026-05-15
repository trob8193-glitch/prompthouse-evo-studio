/**
 * PH EVO STUDIO — VERCEL READINESS SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Safely inspects Vercel tokens and readiness for preview deploy.
 * NEVER exposes raw tokens. NEVER claims deployment success without
 * a real Vercel response.
 */
import { TRUTH_STATES } from './truth-labels.js';

/**
 * Returns a redacted Vercel token if present.
 */
export function redactVercelToken(token) {
  if (!token) return null;
  const str = String(token).trim();
  if (str.length < 15) return '***';
  return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
}

/**
 * Classifies Vercel token status safely.
 */
export function classifyVercelTokenStatus() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return {
      configured: false,
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      blockedReason: 'Missing VERCEL_TOKEN in environment',
      nextAction: 'Add VERCEL_TOKEN to your .env file.',
    };
  }

  return {
    configured: true,
    truthState: TRUTH_STATES.VERIFIED,
    redactedToken: redactVercelToken(token),
    blockedReason: null,
    nextAction: 'Ready for owner-approved preview deploy.',
  };
}

/**
 * Classifies Preview Deploy Readiness.
 * Requires VERCEL_TOKEN.
 */
export function classifyPreviewDeployReadiness() {
  const tokenStatus = classifyVercelTokenStatus();
  
  if (!tokenStatus.configured) {
    return {
      ready: false,
      truthState: tokenStatus.truthState,
      blockers: [tokenStatus.blockedReason],
      nextActions: [tokenStatus.nextAction],
    };
  }

  return {
    ready: true,
    truthState: TRUTH_STATES.VERIFIED,
    blockers: [],
    nextActions: ['Provide owner approval to run preview deployment.'],
  };
}

/**
 * Classifies Production Deploy Readiness.
 * This phase enforces DEPLOY_ALLOW_PRODUCTION=false.
 */
export function classifyProductionDeployReadiness() {
  const tokenStatus = classifyVercelTokenStatus();
  const allowProduction = process.env.DEPLOY_ALLOW_PRODUCTION === 'true';

  const blockers = [];
  const nextActions = [];

  if (!tokenStatus.configured) {
    blockers.push(tokenStatus.blockedReason);
    nextActions.push(tokenStatus.nextAction);
  }

  if (!allowProduction) {
    blockers.push('DEPLOY_ALLOW_PRODUCTION is false');
    nextActions.push('Production deployment is blocked during local testing phases.');
  }

  const ready = blockers.length === 0;

  return {
    ready,
    truthState: ready ? TRUTH_STATES.VERIFIED : TRUTH_STATES.BLOCKED,
    blockers,
    nextActions,
  };
}

/**
 * Unified safely redacted Vercel environment summary.
 */
export function getVercelReadinessStatus() {
  return {
    tokenStatus: classifyVercelTokenStatus(),
    previewReadiness: classifyPreviewDeployReadiness(),
    productionReadiness: classifyProductionDeployReadiness(),
  };
}

/**
 * Export safe subset of vercel-related env variables for debug logging if needed.
 */
export function getSafeVercelEnvSummary() {
  return {
    hasToken: !!process.env.VERCEL_TOKEN,
    hasProjectId: !!process.env.VERCEL_PROJECT_ID,
    hasTeamId: !!process.env.VERCEL_TEAM_ID,
    deployTarget: process.env.DEPLOY_TARGET || 'local',
    allowProduction: process.env.DEPLOY_ALLOW_PRODUCTION === 'true',
  };
}
