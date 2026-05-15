/**
 * PH EVO STUDIO — STRIPE CHECKOUT BROWSER RUN SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Tracks manual verification of Stripe test checkout flows.
 * Append-only JSONL log. No raw secrets.
 */
import fs from 'node:fs';
import { join } from 'path';
import { TRUTH_STATES } from './truth-labels.js';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
export const stripeBrowserRunFilePath = join(DATA_DIR, 'stripe_checkout_browser_runs.jsonl');

export const STRIPE_BROWSER_RUN_STATUSES = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  OPENED_IN_BROWSER: 'OPENED_IN_BROWSER',
  CHECKOUT_PAGE_RENDERED: 'CHECKOUT_PAGE_RENDERED',
  TEST_PAYMENT_COMPLETED: 'TEST_PAYMENT_COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  BLOCKED: 'BLOCKED',
});

/**
 * Classifies Stripe test-mode readiness based on env.
 */
export function classifyStripeCheckoutBrowserReadiness() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const allowProduction = process.env.DEPLOY_ALLOW_PRODUCTION === 'true';

  if (!key) {
    return {
      ok: false,
      mode: 'PROVIDER_GATED',
      truthState: TRUTH_STATES.NEEDS_CREDENTIALS,
      reason: 'STRIPE_SECRET_KEY not configured.',
    };
  }

  if (key.startsWith('sk_live_')) {
    return {
      ok: false,
      mode: 'LIVE_MODE_BLOCKED',
      truthState: TRUTH_STATES.BLOCKED,
      reason: 'sk_live_ key detected. Phase 16B is restricted to sk_test_ keys only.',
    };
  }

  if (!key.startsWith('sk_test_')) {
    return {
      ok: false,
      mode: 'UNKNOWN',
      truthState: TRUTH_STATES.BLOCKED,
      reason: 'Invalid Stripe key prefix. Expected sk_test_ for Phase 16B.',
    };
  }

  return {
    ok: true,
    mode: 'TEST_MODE',
    truthState: allowProduction ? TRUTH_STATES.BUILT : TRUTH_STATES.LOCAL_ONLY,
    reason: 'Stripe test mode configured and safe for browser verification.',
  };
}

/**
 * Gets overall status for Stripe browser runs.
 */
export function getStripeCheckoutBrowserRunStatus() {
  const readiness = classifyStripeCheckoutBrowserReadiness();
  const records = listStripeBrowserRunRecords(1);
  const latest = records[0] || null;

  return {
    ...readiness,
    latestRun: latest,
    liveBillingBlocked: true,
  };
}

/**
 * Persists a new Stripe browser run record.
 */
export function createStripeBrowserRunRecord(input) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const record = {
    id: `SBR-${Date.now().toString(36).toUpperCase()}`,
    type: 'INIT',
    checkoutSessionId: input.checkoutSessionId,
    checkoutUrl: input.checkoutUrl,
    providerReceiptId: input.providerReceiptId || null,
    ownerApprovalReceiptId: input.ownerApprovalReceiptId || null,
    createdAt: new Date().toISOString(),
    status: STRIPE_BROWSER_RUN_STATUSES.NOT_STARTED,
    metadata: input.metadata || {},
  };

  fs.appendFileSync(stripeBrowserRunFilePath, JSON.stringify(record) + '\n', 'utf8');
  return record;
}

/**
 * Appends a manual verification update for a run.
 */
export function updateStripeBrowserRunManualStatus(id, status, note = '') {
  if (!Object.values(STRIPE_BROWSER_RUN_STATUSES).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const update = {
    id,
    type: 'UPDATE',
    status,
    note,
    updatedAt: new Date().toISOString(),
  };

  fs.appendFileSync(stripeBrowserRunFilePath, JSON.stringify(update) + '\n', 'utf8');
  return update;
}

/**
 * List recent records, resolving state from append-only log.
 */
export function listStripeBrowserRunRecords(limit = 50) {
  if (!fs.existsSync(stripeBrowserRunFilePath)) return [];
  
  const lines = fs.readFileSync(stripeBrowserRunFilePath, 'utf8')
    .split('\n')
    .filter(Boolean);

  const map = new Map();
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      const existing = map.get(data.id) || {};
      map.set(data.id, { ...existing, ...data });
    } catch (err) {
      /* skip malformed */
    }
  }

  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
    .slice(0, limit);
}

/**
 * Validates session ID presence.
 */
export function verifyStripeCheckoutSessionForBrowserRun(input) {
  if (!input.checkoutSessionId || !input.checkoutUrl) {
    return {
      valid: false,
      reason: 'checkoutSessionId and checkoutUrl are required.',
    };
  }
  return { valid: true };
}

/**
 * Standard blocked response.
 */
export function buildStripeBrowserRunBlockedResponse(reason) {
  return {
    ok: false,
    truthState: TRUTH_STATES.BLOCKED,
    reason,
    liveBillingBlocked: true,
  };
}
