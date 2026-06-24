import fs from 'fs';
import path from 'path';

import { getProviderGateStatus, REQUIRED_PROVIDER_KEYS } from './provider-gates.js';
import { createProviderReceipt } from './provider-receipts.js';
import { classifyPreviewDeployReadiness, classifyProductionDeployReadiness } from './vercel-readiness.js';
import { classifyStripeCheckoutReadiness } from './stripe-test-checkout.js';
import { TRUTH_STATES } from './truth-labels.js';

const PROVIDER_ACTIONS = [
  { provider: 'openai', action: 'ai_provider_probe', envKey: REQUIRED_PROVIDER_KEYS.openai, approvalScope: 'provider_probe' },
  { provider: 'gemini', action: 'ai_provider_probe', envKey: REQUIRED_PROVIDER_KEYS.gemini, approvalScope: 'provider_probe' },
  { provider: 'stripe', action: 'stripe_test_checkout', envKey: REQUIRED_PROVIDER_KEYS.stripe, approvalScope: 'commerce' },
  { provider: 'vercel', action: 'vercel_preview_deploy', envKey: REQUIRED_PROVIDER_KEYS.vercel, approvalScope: 'deploy' }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hasOwnerApproval(ownerApproval = {}, scope = '') {
  return ownerApproval?.granted === true && ownerApproval?.scope === scope;
}

function buildProviderReadiness(provider) {
  if (provider === 'stripe') return classifyStripeCheckoutReadiness();
  if (provider === 'vercel') {
    return {
      preview: classifyPreviewDeployReadiness(),
      production: classifyProductionDeployReadiness()
    };
  }
  return null;
}

function classifyAction(action, gate, { live = false, ownerApproval = {} } = {}) {
  if (!gate?.configured) {
    return {
      ...action,
      status: 'blocked',
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      message: `${action.envKey} is required before ${action.action}.`,
      readiness: buildProviderReadiness(action.provider)
    };
  }

  if (live && !hasOwnerApproval(ownerApproval, action.approvalScope)) {
    return {
      ...action,
      status: 'blocked',
      truthState: TRUTH_STATES.NEEDS_OWNER_APPROVAL,
      message: `Owner approval scope ${action.approvalScope} is required before live ${action.action}.`,
      readiness: buildProviderReadiness(action.provider)
    };
  }

  return {
    ...action,
    status: live ? 'ready_for_live_run' : 'armed_local_only',
    truthState: live ? TRUTH_STATES.BUILT : TRUTH_STATES.LOCAL_ONLY,
    message: live
      ? `${action.provider} has credentials and owner approval for the live action.`
      : `${action.provider} has credentials; live action was not requested.`,
    readiness: buildProviderReadiness(action.provider)
  };
}

export function buildProviderActivationProof({ live = false, ownerApproval = {}, writeReceipts = false } = {}) {
  const gates = getProviderGateStatus();
  const actions = PROVIDER_ACTIONS.map((action) => classifyAction(action, gates[action.provider], { live, ownerApproval }));
  const blockers = actions.filter((action) => action.truthState === TRUTH_STATES.NEEDS_CREDENTIALS || action.truthState === TRUTH_STATES.NEEDS_OWNER_APPROVAL);
  const readyActions = actions.filter((action) => action.status === 'ready_for_live_run' || action.status === 'armed_local_only');
  const truthState = blockers.length > 0
    ? TRUTH_STATES.PROVIDER_GATED
    : live
      ? TRUTH_STATES.BUILT
      : TRUTH_STATES.LOCAL_ONLY;

  const receipts = writeReceipts ? actions.map((action) => createProviderReceipt({
    provider: action.provider,
    action: action.action,
    status: action.status,
    truthState: action.truthState,
    message: action.message,
    requestPayload: {
      live,
      approvalScope: action.approvalScope,
      approvalReceiptId: ownerApproval?.receiptId || null
    },
    responsePayload: {
      configured: gates[action.provider]?.configured === true,
      readiness: action.readiness || null
    }
  })) : [];

  return {
    ok: blockers.length === 0,
    success: true,
    truthState,
    liveRequested: live,
    checkedAt: new Date().toISOString(),
    summary: {
      totalActions: actions.length,
      readyActions: readyActions.length,
      blockers: blockers.length
    },
    gates,
    actions,
    blockers,
    receipts
  };
}

export function writeProviderActivationProof({ rootDir = process.cwd(), live = false, ownerApproval = {} } = {}) {
  const report = buildProviderActivationProof({ live, ownerApproval, writeReceipts: true });
  const outDir = path.join(rootDir, '.ai', 'outbox');
  ensureDir(outDir);

  const jsonPath = path.join(outDir, 'provider-activation-proof.json');
  const mdPath = path.join(outDir, 'provider-activation-proof.md');

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(mdPath, [
    '# Provider Activation Proof',
    '',
    `- Truth State: ${report.truthState}`,
    `- Live Requested: ${report.liveRequested ? 'yes' : 'no'}`,
    `- Ready Actions: ${report.summary.readyActions}/${report.summary.totalActions}`,
    `- Blockers: ${report.summary.blockers}`,
    `- Checked At: ${report.checkedAt}`,
    '',
    '## Actions',
    ...report.actions.map((action) => `- ${action.provider}/${action.action}: ${action.truthState} (${action.status}) - ${action.message}`)
  ].join('\n'), 'utf8');

  return { ...report, files: { json: jsonPath, markdown: mdPath } };
}
