import { describe, it, expect } from 'vitest';
import { CognitiveCompressor } from '../src/core/optimization/CognitiveCompressor.js';

describe('CognitiveCompressor', () => {
  it('compresses whitespace in basic mode', () => {
    const compressor = new CognitiveCompressor();
    const input = '  Hello    world  \n\n  foo   bar  ';
    const result = compressor.compress(input, 'basic');
    expect(result).toBe('Hello world foo bar');
  });

  it('strips comments in aggressive mode', () => {
    const compressor = new CognitiveCompressor();
    const input = 'const a = 1; // this is a comment\nconst b = 2; /* block comment */';
    const result = compressor.compress(input, 'aggressive');
    expect(result).not.toContain('this is a comment');
    expect(result).not.toContain('block comment');
    expect(result).toContain('const a = 1;');
  });

  it('handles null and empty inputs gracefully', () => {
    const compressor = new CognitiveCompressor();
    expect(compressor.compress(null)).toBeNull();
    expect(compressor.compress('')).toBe('');
  });

  it('getStatus returns active grade', () => {
    const compressor = new CognitiveCompressor();
    const status = compressor.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
