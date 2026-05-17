/**
 * PH EVO STUDIO — STRIPE CHECKOUT BROWSER RUN CLIENT
 * ═══════════════════════════════════════════════════════════════
 * Frontend bridge for Stripe browser run tracking.
 */

export const STRIPE_BROWSER_RUN_STATUSES = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  OPENED_IN_BROWSER: 'OPENED_IN_BROWSER',
  CHECKOUT_PAGE_RENDERED: 'CHECKOUT_PAGE_RENDERED',
  TEST_PAYMENT_COMPLETED: 'TEST_PAYMENT_COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  BLOCKED: 'BLOCKED',
});

const API_BASE = '/api/stripe/test-checkout/browser-run';


export async function getStripeCheckoutBrowserRunStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function listStripeBrowserRunRecords(limit = 10) {
  try {
    const res = await fetch(`${API_BASE}/records?limit=${limit}`);
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function createStripeBrowserRunRecord(approvalEnvelope, checkoutData) {
  try {
    const res = await fetch(`${API_BASE}/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerApproval: approvalEnvelope,
        checkoutSessionId: checkoutData.id,
        checkoutUrl: checkoutData.url,
        providerReceiptId: checkoutData.receiptId,
        ownerApprovalReceiptId: approvalEnvelope?.receiptId
      })
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function updateStripeBrowserRunManualStatus(id, status, note = '') {
  try {
    const res = await fetch(`${API_BASE}/manual-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, note })
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
