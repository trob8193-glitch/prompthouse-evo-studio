import { describe, it, expect } from 'vitest';
import { PatternLibrary } from '../src/core/memory/PatternLibrary.js';

describe('PatternLibrary', () => {
  it('saves and retrieves a pattern', () => {
    const lib = new PatternLibrary();
    lib.savePattern('greet', { template: 'Hello {{name}}', category: 'prompts' });

    const pattern = lib.getPattern('greet');
    expect(pattern.template).toBe('Hello {{name}}');
    expect(pattern.updatedAt).toBeDefined();
  });

  it('lists all stored patterns', () => {
    const lib = new PatternLibrary();
    lib.savePattern('a', { label: 'Alpha' });
    lib.savePattern('b', { label: 'Bravo' });

    const list = lib.listPatterns();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe('a');
  });

  it('removes a pattern', () => {
    const lib = new PatternLibrary();
    lib.savePattern('temp', { label: 'Temporary' });
    expect(lib.removePattern('temp')).toBe(true);
    expect(lib.getPattern('temp')).toBeNull();
  });

  it('getStatus returns active grade', () => {
    const lib = new PatternLibrary();
    const status = lib.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
