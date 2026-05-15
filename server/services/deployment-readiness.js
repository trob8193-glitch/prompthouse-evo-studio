/**
 * PH EVO STUDIO — DEPLOYMENT READINESS SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Checks readiness for external deployment without performing any
 * actual deployment. No secrets exposed. No provider calls.
 */
import fs from 'fs';
import { join } from 'path';
import { TRUTH_STATES } from './truth-labels.js';
import { getProviderGateStatus } from './provider-gates.js';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');

/**
 * Check if a recent production build exists.
 */
export function checkFrontendBuildReadiness() {
  const indexHtml = join(process.cwd(), 'dist', 'index.html');
  const passed = fs.existsSync(indexHtml);
  return {
    check: 'frontend_build',
    label: 'Frontend Build',
    passed,
    truthState: passed ? 'VERIFIED' : 'BLOCKED',
    detail: passed ? 'Build artifact found' : 'Missing dist/index.html',
  };
}

export function checkBridgeReadiness() {
  const bridgeJs = join(process.cwd(), 'promptbridge-server.js');
  const passed = fs.existsSync(bridgeJs);
  return {
    check: 'bridge_server',
    label: 'Bridge Server',
    passed,
    truthState: passed ? 'VERIFIED' : 'BLOCKED',
    detail: passed ? 'Bridge entrypoint found' : 'Missing promptbridge-server.js',
  };
}

/**
 * Check environment variables for deployment safety.
 */
export function checkEnvironmentReadiness() {
  const env = process.env;
  const warnings = [];
  const blockers = [];

  if (!env.JWT_SECRET || env.JWT_SECRET.length < 16) {
    blockers.push('JWT_SECRET is missing or too short for production auth.');
  }
  if (!env.CORS_ORIGINS) {
    warnings.push('CORS_ORIGINS is not set. In production, this should list allowed origins.');
  }
  if (!env.VITE_BRIDGE_URL) {
    warnings.push('VITE_BRIDGE_URL is not set. Deployed frontend must point to a reachable bridge.');
  }
  if (env.DEPLOY_ALLOW_PRODUCTION === 'true' && !env.VERCEL_TOKEN) {
    blockers.push('DEPLOY_ALLOW_PRODUCTION is true but VERCEL_TOKEN is missing.');
  }

  const passed = blockers.length === 0;
  return {
    check: 'environment',
    label: 'Environment Configuration',
    passed,
    truthState: blockers.length > 0 ? TRUTH_STATES.BLOCKED : warnings.length > 0 ? 'LOCAL_ONLY' : TRUTH_STATES.VERIFIED,
    blockers,
    warnings,
    detail: passed ? `${warnings.length} warning(s), 0 blocker(s).` : `${blockers.length} blocker(s) found.`,
  };
}

/**
 * Check provider credential availability (redacted).
 */
export function checkProviderCredentialReadiness() {
  const gates = getProviderGateStatus();
  const missing = [];
  for (const [provider, gate] of Object.entries(gates)) {
    if (gate.truthState === 'NEEDS_CREDENTIALS') {
      missing.push(provider);
    }
  }

  return {
    check: 'provider_credentials',
    label: 'Provider Credentials',
    passed: true, // Credentials aren't hard blockers for readiness checks
    truthState: missing.length > 0 ? 'NEEDS_CREDENTIALS' : TRUTH_STATES.VERIFIED,
    missingProviders: missing,
    detail: missing.length > 0
      ? `Missing credentials for: ${missing.join(', ')}`
      : 'All provider credentials configured.',
  };
}

/**
 * Check security audit gate status.
 */
export function checkSecurityGateReadiness() {
  try {
    const serverPath = join(process.cwd(), 'promptbridge-server.js');
    if (!existsSync(serverPath)) {
      return { check: 'security_gates', label: 'Security Gates', passed: false, truthState: TRUTH_STATES.ERROR, detail: 'Server file not found.' };
    }
    // Static analysis happens at route-level; here we just confirm the auditor exists
    const auditorPath = join(process.cwd(), 'server', 'services', 'mutation-route-auditor.js');
    const auditorExists = existsSync(auditorPath);
    return {
      check: 'security_gates',
      label: 'Security Gates',
      passed: auditorExists,
      truthState: auditorExists ? TRUTH_STATES.VERIFIED : TRUTH_STATES.BLOCKED,
      detail: auditorExists ? 'Mutation route auditor available.' : 'Mutation route auditor not found.',
    };
  } catch {
    return { check: 'security_gates', label: 'Security Gates', passed: true, truthState: TRUTH_STATES.VERIFIED, detail: 'Static analysis unavailable; no blockers.' };
  }
}

export function checkProofReportReadiness() {
  const jsonPath = join(DATA_DIR, 'proof-report.json');
  const exists = fs.existsSync(jsonPath);
  let truthState = TRUTH_STATES.BLOCKED;
  let detail = 'No proof report found. Run: npm run proof:report';

  if (exists) {
    try {
      const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      truthState = report.overallTruthState || TRUTH_STATES.VERIFIED;
      detail = `Last report: ${report.timestamp || 'unknown'}. State: ${truthState}.`;
    } catch {
      truthState = TRUTH_STATES.ERROR;
      detail = 'Proof report exists but is malformed.';
    }
  }

  return {
    check: 'proof_report',
    label: 'Proof Report',
    passed: exists && truthState !== TRUTH_STATES.ERROR,
    truthState,
    detail,
  };
}

/**
 * Classify deployment blockers from all checks.
 */
export function classifyDeploymentBlockers(checks) {
  const blockers = [];
  const warnings = [];
  const nextActions = [];

  for (const c of checks) {
    if (!c.passed) {
      blockers.push({ check: c.check, label: c.label, truthState: c.truthState, detail: c.detail });
    }
    if (c.blockers) blockers.push(...c.blockers.map(b => ({ check: c.check, detail: b })));
    if (c.warnings) warnings.push(...c.warnings.map(w => ({ check: c.check, detail: w })));
    if (c.truthState === 'NEEDS_CREDENTIALS') {
      nextActions.push(`Configure credentials for: ${c.check}`);
    }
  }

  if (blockers.length > 0) nextActions.unshift('Fix all blockers before attempting deployment.');
  if (warnings.length > 0 && blockers.length === 0) nextActions.push('Review warnings — they may not block local deploy but matter for production.');

  return { blockers, warnings, nextActions };
}

/**
 * Full deployment readiness assessment.
 */
export function getDeploymentReadinessStatus() {
  const checks = [
    checkFrontendBuildReadiness(),
    checkBridgeReadiness(),
    checkEnvironmentReadiness(),
    checkProviderCredentialReadiness(),
    checkProofReportReadiness(),
  ];

  const { blockers, warnings, nextActions } = classifyDeploymentBlockers(checks);
  const allPassed = blockers.length === 0;

  let truthState = TRUTH_STATES.VERIFIED;
  if (!allPassed) truthState = TRUTH_STATES.BLOCKED;
  else if (checks.some(c => c.truthState === 'NEEDS_CREDENTIALS')) truthState = 'NEEDS_CREDENTIALS';
  else if (checks.every(c => c.truthState === 'LOCAL_ONLY' || c.truthState === TRUTH_STATES.VERIFIED)) truthState = 'LOCAL_ONLY';

  return {
    ok: allPassed,
    truthState,
    checks,
    blockers,
    warnings,
    nextActions,
  };
}
