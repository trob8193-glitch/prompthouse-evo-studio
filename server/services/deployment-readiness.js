/**
 * PH EVO STUDIO — Deployment Readiness Service
 */

import { existsSync } from 'fs';
import { join } from 'path';

export function checkFrontendBuildReadiness() {
  const distExists = existsSync(join(process.cwd(), 'dist', 'index.html'));
  return {
    check: 'frontend_build',
    passed: distExists,
    truthState: distExists ? 'VERIFIED' : 'BLOCKED',
    detail: distExists ? 'dist/index.html exists' : 'Missing dist/index.html — run npm run build',
  };
}

export function checkBridgeReadiness() {
  const serverExists = existsSync(join(process.cwd(), 'promptbridge-server.js'));
  return {
    check: 'bridge_server',
    passed: serverExists,
    truthState: serverExists ? 'VERIFIED' : 'BLOCKED',
    detail: serverExists ? 'promptbridge-server.js found' : 'Missing promptbridge-server.js',
  };
}

export function checkEnvironmentReadiness() {
  const blockers = [];
  const required = ['JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) blockers.push({ key, reason: `${key} not set` });
  }
  return {
    check: 'environment',
    passed: blockers.length === 0,
    truthState: blockers.length === 0 ? 'VERIFIED' : 'BLOCKED',
    blockers,
  };
}

export function checkProviderCredentialReadiness() {
  const providers = { OPENAI_API_KEY: 'openai', GEMINI_API_KEY: 'gemini', STRIPE_SECRET_KEY: 'stripe' };
  const missing = [];
  for (const [key, name] of Object.entries(providers)) {
    if (!process.env[key]) missing.push(name);
  }
  return {
    check: 'provider_credentials',
    passed: missing.length === 0,
    truthState: missing.length === 0 ? 'VERIFIED' : 'NEEDS_CREDENTIALS',
    missing,
  };
}

export function checkProofReportReadiness() {
  const reportExists = existsSync(join(process.cwd(), 'proof_receipts', 'latest-proof-report.json'));
  return {
    check: 'proof_report',
    passed: reportExists,
    truthState: reportExists ? 'VERIFIED' : 'BLOCKED',
    detail: reportExists ? 'Proof report exists' : 'No proof report found',
  };
}

export function classifyDeploymentBlockers(checks) {
  const blockers = checks.filter(c => !c.passed && c.truthState === 'BLOCKED');
  const warnings = checks.filter(c => !c.passed && c.truthState !== 'BLOCKED');
  return { blockers, warnings };
}

export function getDeploymentReadinessStatus() {
  const checks = [
    checkFrontendBuildReadiness(),
    checkBridgeReadiness(),
    checkEnvironmentReadiness(),
    checkProviderCredentialReadiness(),
    checkProofReportReadiness(),
  ];

  const { blockers, warnings } = classifyDeploymentBlockers(checks);
  const ok = blockers.length === 0;
  const truthState = ok ? 'VERIFIED' : 'BLOCKED';
  const nextActions = blockers.map(b => b.detail || b.check);

  return { ok, truthState, checks, blockers, warnings, nextActions };
}
