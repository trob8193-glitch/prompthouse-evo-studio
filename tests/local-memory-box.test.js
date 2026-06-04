import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalMemoryBox } from '../src/core/memory/local_memory_box.js';
import fs from 'fs';
import path from 'path';

describe('LocalMemoryBox', () => {
  const dbName = 'test_secure_box.json';
  const dbPath = path.join(process.cwd(), '.quadbrain-db', dbName);

  beforeEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('securely stores and retrieves data', async () => {
    const memoryBox = new LocalMemoryBox(dbName);
    expect(memoryBox.status).toBe('ACTIVE');

    const secretData = { apiKey: 'sk-test-12345', userId: 'user_99' };
    await memoryBox.secureStore('credentials', secretData);

    expect(fs.existsSync(dbPath)).toBe(true);
    const rawFileContent = fs.readFileSync(dbPath, 'utf8');
    
    // Ensure the raw file doesn't contain the plaintext
    expect(rawFileContent).not.toContain('sk-test-12345');
    
    const retrieved = await memoryBox.secureRetrieve('credentials');
    expect(retrieved).toEqual(secretData);
  });

  it('returns null for missing keys', async () => {
    const memoryBox = new LocalMemoryBox(dbName);
    const retrieved = await memoryBox.secureRetrieve('missing_key');
    expect(retrieved).toBeNull();
  });

  it('getStatus returns active grade', () => {
    const memoryBox = new LocalMemoryBox(dbName);
    const status = memoryBox.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
