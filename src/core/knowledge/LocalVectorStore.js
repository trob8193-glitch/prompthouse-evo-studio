import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { Log } from '../autonomy/SovereignLogger.js';

function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
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

export class LocalVectorStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.vectors = [];
    this.ensureFile();
    this.load();
  }

  ensureFile() {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, JSON.stringify([]), 'utf8');
    }
  }

  load() {
    try {
      this.vectors = JSON.parse(readFileSync(this.filePath, 'utf8'));
    } catch (e) {
      Log.error(`[VectorStore] Failed to load from ${this.filePath}`, e);
      this.vectors = [];
    }
  }

  save() {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.vectors), 'utf8');
    } catch (e) {
      Log.error(`[VectorStore] Failed to save to ${this.filePath}`, e);
    }
  }

  /**
   * Adds a new document to the vector store
   * @param {string} id - Unique identifier (e.g., file path or chunk ID)
   * @param {string} content - Raw text content
   * @param {number[]} embedding - The vector embedding array
   * @param {object} metadata - Optional metadata
   */
  addDocument(id, content, embedding, metadata = {}) {
    // Remove existing if it matches ID to act as upsert
    this.vectors = this.vectors.filter(v => v.id !== id);
    this.vectors.push({ id, content, embedding, metadata, timestamp: Date.now() });
    this.save();
  }

  /**
   * Clears the store.
   */
  clear() {
    this.vectors = [];
    this.save();
  }

  /**
   * Queries the store for similar documents using Cosine Similarity
   * @param {number[]} queryEmbedding - The vector embedding of the query
   * @param {number} topK - Number of results to return
   * @returns {Array} Sorted array of top K matches
   */
  query(queryEmbedding, topK = 3) {
    if (this.vectors.length === 0) return [];
    
    const scored = this.vectors.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    
    // Strip embeddings from the return payload to save memory
    return scored.slice(0, topK).map(doc => {
      const { embedding, ...rest } = doc;
      return rest;
    });
  }
}
