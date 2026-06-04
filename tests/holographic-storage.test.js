import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HolographicStorage } from '../src/core/memory/HolographicStorage.js';
import fs from 'fs';
import path from 'path';

describe('HolographicStorage', () => {
  const dbName = 'test_holographic.json';
  const dbPath = path.join(process.cwd(), '.quadbrain-db', dbName);

  beforeEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('initializes and saves data', async () => {
    const storage = new HolographicStorage(dbName);
    expect(storage.status).toBe('ACTIVE');
    
    await storage.store('doc1', 'This is a test of the vector storage.');
    
    expect(fs.existsSync(dbPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    expect(content.length).toBe(1);
    expect(content[0].id).toBe('doc1');
  });

  it('searches and ranks by cosine similarity', async () => {
    const storage = new HolographicStorage(dbName);
    await storage.store('doc1', 'The quick fox jumps.');
    await storage.store('doc2', 'A quick rabbit jumps.');
    await storage.store('doc3', 'Machine learning and vector embeddings are cool.');

    const results = await storage.search('quick fox jumps', 5);
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('doc1'); // Should be highest match
    
    if (results.length > 1) {
      expect(results[1].id).toBe('doc2'); // Should be second match
      expect(results[0].score).toBeGreaterThan(results[1].score);
    }
  });

  it('getStatus returns active grade', () => {
    const storage = new HolographicStorage(dbName);
    const status = storage.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
