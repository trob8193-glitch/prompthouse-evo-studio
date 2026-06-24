import fs from 'fs';
import path from 'path';

/**
 * PH EVO STUDIO — LOCAL VECTOR DB
 * ═══════════════════════════════════════════════════════════════
 * A 100% sovereign embedding store using cosine similarity.
 * No external cloud DBs. Powered by local embeddings (via Ollama).
 */

export class LocalVectorDB {
  constructor(dbName = 'evo_local_vectors') {
    this.dbDir = path.resolve(process.cwd(), '.prompthouse-data', 'vectors');
    this.dbPath = path.join(this.dbDir, `${dbName}.json`);
    
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ version: '1.0', records: [] }), 'utf8');
    }

    this.cache = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
  }

  save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.cache, null, 2), 'utf8');
  }

  // Generate an embedding array locally using Ollama (nomic-embed-text)
  async getEmbedding(text) {
    try {
      const res = await fetch('http://127.0.0.1:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: text
        })
      });
      if (!res.ok) throw new Error('Ollama embedding failed');
      const data = await res.json();
      return data.embedding;
    } catch (e) {
      // Fallback: Extremely naive pseudo-embedding for testing if no model is found
      return Array.from({ length: 768 }, (_, i) => (text.charCodeAt(i % text.length) || 0) / 255.0);
    }
  }

  async addDocument(id, text, metadata = {}) {
    const vector = await this.getEmbedding(text);
    
    const existingIdx = this.cache.records.findIndex(r => r.id === id);
    const record = { id, text, vector, metadata, timestamp: Date.now() };
    
    if (existingIdx >= 0) {
      this.cache.records[existingIdx] = record;
    } else {
      this.cache.records.push(record);
    }
    
    this.save();
    return record;
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(queryText, topK = 3) {
    const queryVector = await this.getEmbedding(queryText);
    
    const results = this.cache.records.map(record => ({
      ...record,
      score: this.cosineSimilarity(queryVector, record.vector)
    }));

    // Remove the vector array from results to save memory
    results.forEach(r => delete r.vector);
    
    // Sort descending by score
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
