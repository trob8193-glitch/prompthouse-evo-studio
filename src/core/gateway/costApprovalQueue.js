import fs from 'fs';
import path from 'path';

const queueFile = (rootDir = process.cwd()) => path.join(rootDir, '.prompthouse-data', 'cost-firewall', 'cost_review_queue.json');

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

export function enqueueCostReview({ rootDir = process.cwd(), orgId = 'default', endpoint = '', estimatedCost = 0, reason = '' } = {}) {
  const queue = readQueue(rootDir);
  const item = {
    id: `cost_review_${Date.now()}`,
    orgId,
    endpoint,
    estimatedCost,
    reason,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  queue.push(item);
  writeQueue(queue, rootDir);
  return item;
}

export function listCostReviewQueue({ rootDir = process.cwd(), status = null } = {}) {
  const queue = readQueue(rootDir);
  return status ? queue.filter(item => item.status === status) : queue;
}

export function markCostReview({ rootDir = process.cwd(), id, status = 'APPROVED', actor = 'studio_owner', note = '' } = {}) {
  const queue = readQueue(rootDir);
  const item = queue.find(entry => entry.id === id);
  if (!item) throw new Error(`Cost review item not found: ${id}`);
  item.status = status;
  item.actor = actor;
  item.note = note;
  item.updatedAt = new Date().toISOString();
  writeQueue(queue, rootDir);
  return item;
}
