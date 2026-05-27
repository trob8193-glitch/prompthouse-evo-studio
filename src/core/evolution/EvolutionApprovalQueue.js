import fs from 'fs';
import path from 'path';
import { TRUTH_STATES } from './EvolutionPolicy.js';

const queueFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'evolution', 'approval_queue.json');

function readQueue(rootDir = process.cwd()) {
  const file = queueFile(rootDir);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}

function writeQueue(queue, rootDir = process.cwd()) {
  const file = queueFile(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(queue, null, 2), 'utf8');
  return queue;
}

export function listEvolutionApprovalQueue({ rootDir = process.cwd() } = {}) {
  return readQueue(rootDir);
}

export function enqueueEvolutionApproval({ rootDir = process.cwd(), runId, risk = 'MEDIUM', objective = '', changedFiles = [], approvalScope = 'self_evolution_merge' } = {}) {
  const queue = readQueue(rootDir);
  const item = {
    id: `approval_${Date.now()}`,
    runId,
    risk,
    objective,
    truthState: TRUTH_STATES.OWNER_APPROVAL_REQUIRED,
    proofPassed: true,
    changedFiles,
    approvalScope,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  queue.push(item);
  writeQueue(queue, rootDir);
  return item;
}

export function approveEvolutionQueueItem({ rootDir = process.cwd(), approvalId, actor = 'studio_owner' } = {}) {
  const queue = readQueue(rootDir);
  const item = queue.find(entry => entry.id === approvalId);
  if (!item) throw new Error(`Approval item not found: ${approvalId}`);
  item.truthState = TRUTH_STATES.APPROVED;
  item.approval = {
    granted: true,
    scope: item.approvalScope,
    actor,
    receiptId: `approval_receipt_${Date.now()}`,
    grantedAt: new Date().toISOString(),
  };
  writeQueue(queue, rootDir);
  return item;
}

export function rejectEvolutionQueueItem({ rootDir = process.cwd(), approvalId, actor = 'studio_owner', reason = 'Rejected by owner' } = {}) {
  const queue = readQueue(rootDir);
  const item = queue.find(entry => entry.id === approvalId);
  if (!item) throw new Error(`Approval item not found: ${approvalId}`);
  item.truthState = TRUTH_STATES.REJECTED;
  item.rejection = { actor, reason, rejectedAt: new Date().toISOString() };
  writeQueue(queue, rootDir);
  return item;
}
