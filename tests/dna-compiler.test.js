import { describe, it, expect } from 'vitest';
import { DNACompiler } from '../src/core/foundry/DNACompiler.js';

describe('DNACompiler', () => {
  it('compiles sequences into pipelines', () => {
    const compiler = new DNACompiler();
    const compiled = compiler.compile('seq1', ['step A', 'step B']);

    expect(compiled.id).toBe('seq1');
    expect(compiled.stages.length).toBe(2);
    expect(compiled.stages[0].executable).toContain('step A');
  });

  it('retrieves previously compiled sequences', () => {
    const compiler = new DNACompiler();
    compiler.compile('seq2', ['step X']);
    
    const retrieved = compiler.getCompiled('seq2');
    expect(retrieved).not.toBeNull();
    expect(retrieved.stages[0].executable).toContain('step X');
  });

  it('getStatus returns active grade', () => {
    const compiler = new DNACompiler();
    const status = compiler.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
