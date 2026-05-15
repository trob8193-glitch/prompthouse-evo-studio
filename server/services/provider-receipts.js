/**
 * PH EVO STUDIO — PROVIDER RECEIPT SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Append-only JSONL ledger for provider interaction receipts.
 * Never stores raw API keys. Hashes request/response payloads.
 */
import { existsSync, mkdirSync, readFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import crypto from 'crypto';
import { TRUTH_STATES } from './truth-labels.js';

export const receiptFilePath = join(process.cwd(), '.prompthouse-data', 'provider_receipts.jsonl');

/**
 * Hashes a payload for receipt storage.
 */
export function hashPayload(payload) {
  if (payload === null || payload === undefined) return null;
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 16);
}

/**
 * Creates and persists a provider receipt.
 */
export function createProviderReceipt(input = {}) {
  const receipt = {
    id: `rcpt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    provider: input.provider || 'local',
    action: input.action || 'unknown',
    status: input.status || 'local_only',
    truthState: input.truthState || TRUTH_STATES.LOCAL_ONLY,
    createdAt: new Date().toISOString(),
    requestHash: hashPayload(input.requestPayload),
    responseHash: hashPayload(input.responsePayload),
    message: input.message || '',
    metadata: input.metadata || {},
  };

  // Ensure directory exists
  const dir = dirname(receiptFilePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  // Append as JSONL
  appendFileSync(receiptFilePath, JSON.stringify(receipt) + '\n', 'utf8');

  return receipt;
}

/**
 * Lists recent provider receipts.
 */
export function listProviderReceipts(limit = 50) {
  if (!existsSync(receiptFilePath)) return [];

  const raw = readFileSync(receiptFilePath, 'utf8');
  const lines = raw.split('\n').filter(Boolean);

  const receipts = [];
  // Read from the end for most recent first
  for (let i = lines.length - 1; i >= 0 && receipts.length < limit; i--) {
    try {
      receipts.push(JSON.parse(lines[i]));
    } catch {
      // Skip malformed lines
    }
  }

  return receipts;
}
