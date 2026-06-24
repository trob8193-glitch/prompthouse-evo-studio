/**
 * PH EVO STUDIO — Deployment Receipts Service
 */

import crypto from 'crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'path';

const RECEIPTS_DIR = join(process.cwd(), '.prompthouse-data');
const RECEIPTS_FILE = join(RECEIPTS_DIR, 'deployment-receipts.jsonl');

const SENSITIVE_FIELDS = ['token', 'VERCEL_TOKEN', 'apiKey', 'secret', 'password', 'key'];

export function hashDeploymentPayload(payload) {
  if (!payload) return null;
  const sanitized = { ...payload };
  for (const field of SENSITIVE_FIELDS) delete sanitized[field];
  return crypto.createHash('sha256').update(JSON.stringify(sanitized)).digest('hex');
}

export function createDeploymentReceipt({ action, provider, status, truthState, message, deploymentUrl, request, response }) {
  const receipt = {
    id: `DR-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    action,
    provider: provider || 'unknown',
    status: status || 'unknown',
    truthState: truthState || null,
    message: message || null,
    deploymentUrl: deploymentUrl || null,
    requestHash: request ? hashDeploymentPayload(request) : null,
    responseHash: response ? hashDeploymentPayload(response) : null,
    createdAt: new Date().toISOString(),
  };

  if (!existsSync(RECEIPTS_DIR)) mkdirSync(RECEIPTS_DIR, { recursive: true });
  writeFileSync(RECEIPTS_FILE, JSON.stringify(receipt) + '\n', { flag: 'a' });

  return receipt;
}

export function listDeploymentReceipts(limit = 50) {
  if (!existsSync(RECEIPTS_FILE)) return [];
  const content = readFileSync(RECEIPTS_FILE, 'utf8').trim();
  if (!content) return [];
  const lines = content.split('\n').filter(Boolean);
  const receipts = lines.map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  receipts.reverse();
  return receipts.slice(0, limit);
}
