import fs from 'fs';
import path from 'path';
import { LocalVectorDB } from '../memory/LocalVectorDB.js';

const DATA_DIR = () => path.join(process.cwd(), '.prompthouse-data');
const MEMORY_FILE = () => path.join(DATA_DIR(), 'online-learning-memory.jsonl');

function ensureDir() {
  const dir = DATA_DIR();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readMemory(limit = 100) {
  ensureDir();
  if (!fs.existsSync(MEMORY_FILE())) return [];
  const lines = fs.readFileSync(MEMORY_FILE(), 'utf8').trim().split('\n').filter(Boolean);
  return lines.slice(-limit).map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

function appendMemory(entry) {
  ensureDir();
  fs.writeFileSync(MEMORY_FILE(), JSON.stringify(entry) + '\n', { flag: 'a', encoding: 'utf8' });
}

export class OnlineLearningManager {
  constructor() {
    this.memoryCache = [];
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.memoryCache = readMemory(200);
    this.initialized = true;
  }

  recordInteraction(interaction) {
    this.initialize();
    const entry = {
      id: `interaction_${Date.now()}`,
      type: 'interaction',
      content: typeof interaction === 'string' ? interaction : JSON.stringify(interaction),
      timestamp: new Date().toISOString()
    };
    appendMemory(entry);
    this.memoryCache.push(entry);

    // [RAG FEED TETHER] Index interaction into LocalVectorDB
    try {
      const vdb = new LocalVectorDB();
      vdb.addDocument(entry.id, entry.content, { source: 'interaction' }).catch(() => { return; });
    } catch {}

    return true;
  }

  async ingestKnowledgeChunk(payload) {
    this.initialize();
    const entry = {
      id: payload.id || `knowledge_${Date.now()}`,
      type: 'knowledge',
      source: payload.source || 'unknown',
      content: payload.context_summary || JSON.stringify(payload),
      signalStrength: payload.signal_strength ?? 0.5,
      timestamp: new Date().toISOString()
    };
    appendMemory(entry);
    this.memoryCache.push(entry);

    // [RAG FEED TETHER] Index knowledge into LocalVectorDB
    try {
      const vdb = new LocalVectorDB();
      vdb.addDocument(entry.id, entry.content, { source: entry.source }).catch(() => { return; });
    } catch {}

    return {
      success: true,
      stabilityScore: Math.min(1.0, 0.5 + (this.memoryCache.length * 0.001)),
      processedAt: new Date().toISOString(),
      totalMemoryEntries: this.memoryCache.length
    };
  }

  searchContext(query, limit = 5) {
    this.initialize();
    if (!query || this.memoryCache.length === 0) return [];

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

    // Score each memory entry by term overlap
    const scored = this.memoryCache
      .filter(entry => entry.content)
      .map(entry => {
        const contentLower = (entry.content || '').toLowerCase();
        let score = 0;
        for (const term of queryTerms) {
          if (contentLower.includes(term)) score += 1;
        }
        return { ...entry, relevanceScore: score };
      })
      .filter(entry => entry.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return scored;
  }
}
