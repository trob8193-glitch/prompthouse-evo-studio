import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { LocalVectorStore } from '../knowledge/LocalVectorStore.js';
import express from 'express';
import { broadcastEvent } from '../../server/utils/ws-helpers.js';

export default function attachRagRoutes(app, deps) {
  const { ai, DATA_DIR, maybeRequireAuthOrMaster, resolveWorkspacePath } = deps;
  
  // Initialize the Vector Store
  const vectorDbPath = join(DATA_DIR, 'vectors.json');
  const vectorStore = new LocalVectorStore(vectorDbPath);

  /**
   * INGEST: Chunk a file and store embeddings
   */
  app.post('/api/rag/ingest', express.json(), maybeRequireAuthOrMaster, async (req, res) => {
    try {
      const { filepath } = req.body;
      if (!filepath) return res.status(400).json({ error: 'filepath required' });

      const absPath = resolveWorkspacePath(filepath);
      if (!existsSync(absPath)) return res.status(404).json({ error: 'File not found' });

      const content = readFileSync(absPath, 'utf8');
      
      // Simple chunking strategy (e.g. 500 lines or 2000 chars)
      // For now, we embed the whole file if small, or split by double newlines.
      const maxLen = 3000;
      const chunks = [];
      let currentChunk = '';
      
      for (const line of content.split('\n')) {
        if (currentChunk.length + line.length > maxLen) {
          chunks.push(currentChunk);
          currentChunk = line + '\n';
        } else {
          currentChunk += line + '\n';
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      let ingested = 0;
      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i];
        if (!text.trim()) continue;
        
        const response = await ai.embed(text);
        if (response.success && response.embedding) {
          vectorStore.addDocument(
            `${filepath}#chunk-${i}`,
            text,
            response.embedding,
            { filepath, chunkIndex: i, lines: text.split('\n').length }
          );
          ingested++;
        }
      }

      broadcastEvent('rag_ingestion_complete', { filepath, ingestedChunks: ingested });
      res.json({ success: true, ingestedChunks: ingested, file: filepath });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * QUERY: Search the vector store for semantic matches
   */
  app.post('/api/rag/query', express.json(), maybeRequireAuthOrMaster, async (req, res) => {
    try {
      const { query, topK = 3 } = req.body;
      if (!query) return res.status(400).json({ error: 'query required' });

      // Embed the query
      const response = await ai.embed(query);
      if (!response.success || !response.embedding) {
        return res.status(500).json({ error: 'Failed to generate query embedding', details: response.error });
      }

      // Search the local store
      const results = vectorStore.query(response.embedding, parseInt(topK));
      
      res.json({ results });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * CLEAR: Wipe the vector store (useful during dev)
   */
  app.delete('/api/rag/clear', maybeRequireAuthOrMaster, (req, res) => {
    vectorStore.clear();
    res.json({ success: true, message: 'Vector store cleared' });
  });
}
