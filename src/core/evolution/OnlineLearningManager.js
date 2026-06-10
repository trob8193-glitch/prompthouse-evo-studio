import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';
import db from '../db/quad_schema.js';

export class OnlineLearningManager {
  constructor() {
    this.memoryState = [];
    this._loadMemoryFromDB();
  }

  _loadMemoryFromDB() {
    try {
      const records = db.prepare('SELECT * FROM semantic_vectors ORDER BY created_at DESC LIMIT 1000').all();
      this.memoryState = records.map(r => ({
        id: r.id,
        signal: r.signal,
        content: r.content,
        vector: JSON.parse(r.vector_json),
        timestamp: new Date(r.created_at).getTime()
      }));
    } catch (e) {
      Log.error('Failed to load semantic memory from Edge DB: ' + e.message);
    }
  }

  /**
   * Generates a pseudo-vector (bag of words) for semantic matching
   */
  _vectorize(text) {
    const words = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const vector = {};
    for (const w of words) {
      if (w.length > 2) vector[w] = (vector[w] || 0) + 1;
    }
    return vector;
  }

  _cosineSimilarity(vecA, vecB) {
    const intersection = Object.keys(vecA).filter(k => vecB[k]);
    let dotProduct = 0;
    for (const k of intersection) dotProduct += vecA[k] * vecB[k];
    
    const magA = Math.sqrt(Object.values(vecA).reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(Object.values(vecB).reduce((sum, val) => sum + val * val, 0));
    
    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }

  /**
   * Process an incoming stream chunk and update the running semantic weights.
   */
  async ingestKnowledgeChunk(payload) {
    try {
      Log.info(`[OnlineLearning] Ingesting knowledge chunk: ${payload.id || 'anonymous'}`);
      
      const content = payload.context_summary || JSON.stringify(payload);
      const vector = this._vectorize(content);
      
      this.memoryState.push({
        id: payload.id || Date.now(),
        timestamp: Date.now(),
        signal: payload.signal_strength || 1.0,
        vector,
        content: content.slice(0, 500)
      });
      
      this._applyDecay();
      this._persistMemory();
      
      return { status: 'integrated', stabilityScore: this.calculateStability() };
    } catch (err) {
      Log.error(`Online learning error: ${err.message}`);
      throw err;
    }
  }

  searchContext(queryText, limit = 5) {
    const queryVec = this._vectorize(queryText);
    const now = Date.now();
    const scored = this.memoryState.map(mem => {
      // Recency multiplier (bonus for newer memories)
      const ageHours = (now - mem.timestamp) / (1000 * 60 * 60);
      const recencyBonus = Math.max(0.5, 1 - (ageHours * 0.01));
      
      const similarity = this._cosineSimilarity(queryVec, mem.vector);
      // Final rank incorporates semantic similarity, historical signal success, and recency
      const rank = similarity * Math.max(0.1, mem.signal) * recencyBonus;
      
      return { ...mem, score: similarity, rank };
    });
    
    return scored
      .filter(m => m.score > 0.1)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, limit);
  }
  
  _applyDecay() {
    const DECAY_RATE = 0.05;
    this.memoryState = this.memoryState.map(mem => ({
      ...mem,
      signal: mem.signal * (1 - DECAY_RATE)
    })).filter(mem => Math.abs(mem.signal) > 0.1);
    
    // Dynamic Concept Clustering (K-Means inspired)
    // If memory gets too large, organically merge the most similar concepts
    if (this.memoryState.length > 800) {
      for (let i = 0; i < this.memoryState.length; i++) {
        for (let j = i + 1; j < this.memoryState.length; j++) {
          const sim = this._cosineSimilarity(this.memoryState[i].vector, this.memoryState[j].vector);
          if (sim > 0.85) {
            // Merge concept j into concept i
            const mergedVector = { ...this.memoryState[i].vector };
            for (const [k, v] of Object.entries(this.memoryState[j].vector)) {
              mergedVector[k] = (mergedVector[k] || 0) + v;
            }
            this.memoryState[i].vector = mergedVector;
            this.memoryState[i].signal += this.memoryState[j].signal * 0.5;
            this.memoryState[i].content = `[Clustered Concept] ${this.memoryState[i].content}`;
            
            // Remove concept j
            this.memoryState.splice(j, 1);
            j--;
          }
        }
      }
    }
  }
  
  calculateStability() {
    const totalSignals = this.memoryState.reduce((acc, curr) => acc + curr.signal, 0);
    return Math.max(0.0, Math.min(1.0, 0.5 + (totalSignals / 100)));
  }
  
  _persistMemory() {
    try {
      const insert = db.prepare('INSERT OR REPLACE INTO semantic_vectors (id, signal, content, vector_json) VALUES (?, ?, ?, ?)');
      const tx = db.transaction((memories) => {
        for (const mem of memories) {
          insert.run(mem.id.toString(), mem.signal, mem.content, JSON.stringify(mem.vector));
        }
      });
      tx(this.memoryState);
    } catch (e) {
      Log.error('Failed to persist to Edge DB: ' + e.message);
    }
  }
}
