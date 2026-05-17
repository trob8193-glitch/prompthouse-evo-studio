/**
 * PH EVO STUDIO — Env Validation Service
 */

import { TRUTH_STATES } from './truth-labels.js';

const REQUIRED_SECRETS = ['JWT_SECRET', 'PH_EVO_MASTER_KEY'];

export function validateSecretLength(envKey, minLength = 24) {
  const val = process.env[envKey] || '';
  return { configured: val.trim() !== '', lengthValid: val.length >= minLength };
}

export function getSafeEnvSummary() {
  const summary = {};
  for (const key of REQUIRED_SECRETS) {
    const val = process.env[key] || '';
    summary[key] = { configured: val.trim() !== '', length: val.length };
  }
  summary.productionAllowed = process.env.DEPLOY_ALLOW_PRODUCTION === 'true';
  summary.deployTarget = process.env.DEPLOY_TARGET || 'local';
  summary.corsOrigins = process.env.CORS_ORIGINS || '';
  summary.bridgeUrl = process.env.VITE_BRIDGE_URL || '';
  return summary;
}

export function classifyEnvReadiness() {
  const blockers = [];
  for (const key of REQUIRED_SECRETS) {
    const val = process.env[key] || '';
    if (!val.trim()) blockers.push({ key, reason: `${key} is not configured` });
  }
  if (blockers.length > 0) return { truthState: TRUTH_STATES.NEEDS_CREDENTIALS, blockers };
  return { truthState: TRUTH_STATES.VERIFIED, blockers: [] };
}
