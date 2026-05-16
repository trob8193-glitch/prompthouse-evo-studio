/**
 * PH EVO STUDIO — Provider Receipts Service
 * Creates, persists, and lists cryptographic provider action receipts.
 */

import crypto from 'crypto';
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
export const receiptFilePath = join(DATA_DIR, 'provider-receipts.jsonl');

/**
 * Hashes a payload to a 16-char hex string. Returns null for null/undefined.
 */
export function hashPayload(payload) {
  if (payload === null || payload === undefined) return null;
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 16);
}

/**
 * Creates a provider receipt and appends it to the JSONL file.
 */
export function createProviderReceipt({ provider, action, status, truthState, message, requestPayload, responsePayload }) {
  const receipt = {
    id: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    provider,
    action,
    status,
    truthState,
    message: message || null,
    requestHash: hashPayload(requestPayload) || null,
    responseHash: hashPayload(responsePayload) || null,
    createdAt: new Date().toISOString(),
  };

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  appendFileSync(receiptFilePath, JSON.stringify(receipt) + '\n', 'utf8');

  return receipt;
}

/**
 * Lists provider receipts from the JSONL file.
 * Returns most recent first, limited to `limit` entries.
 */
export function listProviderReceipts(limit = 100) {
  if (!existsSync(receiptFilePath)) return [];
  const lines = readFileSync(receiptFilePath, 'utf8').trim().split('\n').filter(Boolean);
  const receipts = lines.map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  receipts.reverse();
  return receipts.slice(0, limit);
}
