import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkspaceMemory } from '../src/core/memory/workspace_memory.js';
import fs from 'fs';
import path from 'path';

describe('WorkspaceMemory', () => {
  const dbName = 'test_workspace.json';
  const dbPath = path.join(process.cwd(), '.quadbrain-db', dbName);

  beforeEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  afterEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('persists layout across instances', () => {
    const mem1 = new WorkspaceMemory(dbName);
    mem1.saveLayout({ sidebar: 'open', width: 300 });

    const mem2 = new WorkspaceMemory(dbName);
    const layout = mem2.loadLayout();
    
    expect(layout).toEqual({ sidebar: 'open', width: 300 });
  });

  it('records session metrics', () => {
    const memory = new WorkspaceMemory(dbName);
    memory.recordSessionMetrics({ duration: 120, saves: 5 });
    
    expect(memory.state.sessionMetrics.length).toBe(1);
    expect(memory.state.sessionMetrics[0].duration).toBe(120);
    expect(memory.state.sessionMetrics[0].timestamp).toBeDefined();
  });

  it('updates open files', () => {
    const memory = new WorkspaceMemory(dbName);
    memory.setOpenFiles(['file1.js', 'file2.js']);
    
    const mem2 = new WorkspaceMemory(dbName);
    expect(mem2.state.openFiles).toEqual(['file1.js', 'file2.js']);
  });
  
  it('getStatus returns active grade', () => {
    const memory = new WorkspaceMemory(dbName);
    const status = memory.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
