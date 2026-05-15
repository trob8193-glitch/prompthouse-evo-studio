/**
 * PH EVO STUDIO — DEPLOYMENT RECEIPTS SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Append-only JSONL receipt log for deployment actions.
 * Never stores secrets. Blocked attempts create blocked receipts.
 */
import fs from 'node:fs';
import { join } from 'path';
import crypto from 'crypto';

const DATA_DIR = join(process.cwd(), '.prompthouse-data');
export const deploymentReceiptFilePath = join(DATA_DIR, 'deployment_receipts.jsonl');

/**
 * Hash a deployment payload for receipt integrity (no secrets).
 */
export function hashDeploymentPayload(payload) {
  const safe = { ...payload };
  delete safe.token;
  delete safe.secret;
  delete safe.apiKey;
  delete safe.VERCEL_TOKEN;
  return crypto.createHash('sha256').update(JSON.stringify(safe)).digest('hex').slice(0, 16);
}

/**
 * Create and persist a deployment receipt.
 */
export function createDeploymentReceipt(input) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const receipt = {
    id: `DR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    action: input.action || 'readiness_check',
    provider: input.provider || 'local',
    status: input.status || 'local_only',
    truthState: input.truthState || 'LOCAL_ONLY',
    createdAt: new Date().toISOString(),
    requestHash: hashDeploymentPayload(input.request || {}),
    responseHash: input.response ? hashDeploymentPayload(input.response) : null,
    deploymentUrl: input.deploymentUrl || null,
    commitSha: input.commitSha || null,
    message: input.message || '',
    metadata: input.metadata || {},
  };

  fs.writeFileSync(deploymentReceiptFilePath, JSON.stringify(receipt) + '\n', { flag: 'a', encoding: 'utf8' });
  return receipt;
}

/**
 * List recent deployment receipts.
 */
export function listDeploymentReceipts(limit = 50) {
  if (!fs.existsSync(deploymentReceiptFilePath)) return [];
  const lines = fs.readFileSync(deploymentReceiptFilePath, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(-limit);

  const receipts = [];
  for (const line of lines) {
    try { receipts.push(JSON.parse(line)); } catch { /* skip malformed */ }
  }
  return receipts.reverse();
}
