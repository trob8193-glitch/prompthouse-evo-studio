import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), '.prompthouse-data');
const MEMORY_FILE = path.join(DATA_DIR, 'studio_memory.json');

function loadMemoryDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({ records: [] }));
  }
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
}

function saveMemoryDb(db) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(db, null, 2));
}

function generateId() {
  return `mem_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

export class StudioMemory {
  static search({ tenantId, query, namespace, includeDeprecated = false, limit = 10 }) {
    const db = loadMemoryDb();
    let results = db.records.filter(r => r.tenantId === tenantId);
    
    if (namespace) {
      results = results.filter(r => r.namespace === namespace);
    }
    
    if (!includeDeprecated) {
      results = results.filter(r => r.status === 'active');
    }

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(r => r.content.toLowerCase().includes(q) || r.tags?.some(t => t.toLowerCase().includes(q)));
    }

    // Sort by most recent first
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return results.slice(0, limit);
  }

  static propose({ tenantId, namespace, memoryType, riskLevel, proposedContent, reason, tags = [] }) {
    const db = loadMemoryDb();
    const record = {
      memoryId: generateId(),
      tenantId,
      namespace,
      memoryType,
      riskLevel,
      content: proposedContent,
      summary: reason,
      tags,
      version: 1,
      status: 'proposed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'gateway_propose'
    };
    db.records.push(record);
    saveMemoryDb(db);
    return { proposedMemory: record, conflicts: [], nextActions: ['AWAITING_APPROVAL'] };
  }

  static append({ tenantId, namespace, memoryType, riskLevel, content, reason, tags = [] }) {
    const db = loadMemoryDb();
    const record = {
      memoryId: generateId(),
      tenantId,
      namespace,
      memoryType,
      riskLevel,
      content,
      summary: reason,
      tags,
      version: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'gateway_append'
    };
    db.records.push(record);
    saveMemoryDb(db);
    return { memory: record, conflicts: [] };
  }

  static update({ tenantId, memoryId, newContent, reason }) {
    const db = loadMemoryDb();
    const existingIndex = db.records.findIndex(r => r.memoryId === memoryId && r.tenantId === tenantId);
    if (existingIndex === -1) {
      throw new Error(`Memory record ${memoryId} not found.`);
    }
    
    const existing = db.records[existingIndex];
    if (existing.status !== 'active') {
      throw new Error(`Cannot update memory record ${memoryId} because it is in status '${existing.status}'.`);
    }

    // Mark old as superseded
    existing.status = 'superseded';
    existing.updatedAt = new Date().toISOString();

    const record = {
      memoryId: generateId(),
      tenantId,
      namespace: existing.namespace,
      memoryType: existing.memoryType,
      riskLevel: existing.riskLevel,
      content: newContent,
      summary: reason,
      tags: existing.tags,
      version: existing.version + 1,
      status: 'active',
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      source: 'gateway_update'
    };
    
    db.records.push(record);
    saveMemoryDb(db);
    return { memory: record, previousVersion: existing, conflicts: [] };
  }

  static deprecate({ tenantId, memoryId, reason }) {
    const db = loadMemoryDb();
    const existingIndex = db.records.findIndex(r => r.memoryId === memoryId && r.tenantId === tenantId);
    if (existingIndex === -1) {
      throw new Error(`Memory record ${memoryId} not found.`);
    }

    const existing = db.records[existingIndex];
    existing.status = 'deprecated';
    existing.summary = reason || 'Deprecated by user request.';
    existing.updatedAt = new Date().toISOString();
    
    saveMemoryDb(db);
    return { memory: existing };
  }
}
