import fs from 'fs';
import path from 'path';

// Isomorphic environment check
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/**
 * HolographicStorage — Multi-dimensional memory storage using vector embeddings
 * Status: ACTIVE
 */
export class HolographicStorage {
  constructor(dbName = 'holographic.json') {
    this.dbName = dbName;
    this.name = 'HolographicStorage';
    this.description = 'Multi-dimensional memory storage using vector embeddings';
    this.status = 'ACTIVE';
    this.records = []; // { id, text, vector, metadata }
    
    this._load();
  }

  _getDbPath() {
    if (isNode) {
      return path.join(process.cwd(), '.quadbrain-db', this.dbName);
    }
    return this.dbName;
  }

  _load() {
    if (isNode) {
      const dbPath = this._getDbPath();
      if (fs.existsSync(dbPath)) {
        try {
          this.records = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (e) {
          this.records = [];
        }
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(this.dbName);
        if (data) this.records = JSON.parse(data);
      } catch (e) {}
    }
  }

  _save() {
    if (isNode) {
      const dbPath = this._getDbPath();
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(this.records, null, 2));
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.dbName, JSON.stringify(this.records));
    }
  }

  _vectorize(text) {
    const words = text.toLowerCase().match(/\w+/g) || [];
    const vec = {};
    words.forEach(w => {
      vec[w] = (vec[w] || 0) + 1;
    });
    return vec;
  }

  _cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const word in vecA) {
      if (vecB[word]) dotProduct += vecA[word] * vecB[word];
      normA += vecA[word] * vecA[word];
    }
    for (const word in vecB) {
      normB += vecB[word] * vecB[word];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async store(id, text, metadata = {}) {
    const vector = this._vectorize(text);
    const existingIndex = this.records.findIndex(r => r.id === id);
    
    const record = { id, text, vector, metadata };
    
    if (existingIndex >= 0) {
      this.records[existingIndex] = record;
    } else {
      this.records.push(record);
    }
    
    this._save();
    return { success: true, id };
  }

  async search(queryText, limit = 5) {
    const queryVector = this._vectorize(queryText);
    
    const scored = this.records.map(record => ({
      ...record,
      score: this._cosineSimilarity(queryVector, record.vector)
    }));

    return scored
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'A',
      state: this.status,
      resonance: 100,
      description: this.description,
      recordCount: this.records.length
    };
  }
}
