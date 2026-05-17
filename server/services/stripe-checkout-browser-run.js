/**
 * PH EVO STUDIO — Stripe Checkout Browser Run Service
 */

import fs from 'node:fs';
import { join } from 'path';
import { TRUTH_STATES } from './truth-labels.js';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
const RECORDS_FILE = join(DATA_DIR, 'stripe-browser-runs.jsonl');

export const STRIPE_BROWSER_RUN_STATUSES = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  TEST_PAYMENT_COMPLETED: 'TEST_PAYMENT_COMPLETED',
  CANCELLED: 'CANCELLED',
  ERROR: 'ERROR',
};

export function classifyStripeCheckoutBrowserReadiness() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key.trim()) return { ok: false, truthState: TRUTH_STATES.NEEDS_CREDENTIALS, mode: 'NO_KEY' };
  if (key.startsWith('sk_live_')) return { ok: false, truthState: TRUTH_STATES.BLOCKED, mode: 'LIVE_MODE_BLOCKED' };
  if (key.startsWith('sk_test_')) return { ok: true, truthState: TRUTH_STATES.LOCAL_ONLY, mode: 'TEST_MODE' };
  return { ok: false, truthState: TRUTH_STATES.BLOCKED, mode: 'UNKNOWN_MODE' };
}

export function createStripeBrowserRunRecord({ checkoutSessionId, checkoutUrl }) {
  const record = {
    id: `SBR-${Date.now()}`,
    checkoutSessionId,
    checkoutUrl,
    status: STRIPE_BROWSER_RUN_STATUSES.NOT_STARTED,
    createdAt: new Date().toISOString(),
  };
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(RECORDS_FILE, JSON.stringify(record) + '\n', 'utf8');
  return record;
}

export function updateStripeBrowserRunManualStatus(id, status, notes) {
  const update = { id, status, notes, updatedAt: new Date().toISOString() };
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(RECORDS_FILE, JSON.stringify(update) + '\n', 'utf8');
  return update;
}

export function listStripeBrowserRunRecords() {
  if (!fs.existsSync(RECORDS_FILE)) return [];
  const content = fs.readFileSync(RECORDS_FILE, 'utf8').trim();
  if (!content) return [];

  const entries = content.split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  const byId = new Map();
  for (const entry of entries) {
    if (byId.has(entry.id)) {
      Object.assign(byId.get(entry.id), entry);
    } else {
      byId.set(entry.id, { ...entry });
    }
  }

  return Array.from(byId.values());
}
