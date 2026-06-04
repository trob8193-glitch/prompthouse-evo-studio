import { describe, it, expect } from 'vitest';
import { KnowledgeDistiller } from '../src/core/memory/KnowledgeDistiller.js';

describe('KnowledgeDistiller', () => {
  it('extracts keywords excluding stop words', () => {
    const distiller = new KnowledgeDistiller();
    const text = 'The quick brown fox jumps over the lazy dog and the fox is fast.';
    const keywords = distiller.extractKeywords(text);
    
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('is');
    expect(keywords).not.toContain('and');
    expect(keywords).toContain('fox');
    expect(keywords).toContain('quick');
  });

  it('distills interactions into patterns', () => {
    const distiller = new KnowledgeDistiller();
    const logData = ['User requested a new component.', 'Agent created the React component successfully.'];
    
    const pattern = distiller.distillInteraction(logData);
    
    expect(pattern).toBeDefined();
    expect(pattern.id).toMatch(/^pattern_/);
    expect(pattern.keywords.length).toBeGreaterThan(0);
    expect(pattern.confidenceScore).toBeGreaterThan(0);
    expect(pattern.summary).toContain('Interaction involving');
  });

  it('getStatus returns active grade', () => {
    const distiller = new KnowledgeDistiller();
    const status = distiller.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
