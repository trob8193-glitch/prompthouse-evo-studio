import { describe, it, expect } from 'vitest';
import { DreamState } from '../src/dream-state.js';
import { PatternAnalyzer } from '../src/pattern-analyzer.js';
import { PatternMiner } from '../src/pattern-miner.js';
import { ProofToValue } from '../src/proof-to-value.js';

describe('DreamState', () => {
  it('enters and exits dream state', () => {
    const ds = new DreamState();
    expect(ds.enterDreamState()).toBe(true);
    expect(ds.getStatus().dreaming).toBe(true);
    expect(ds.wakeUp()).toBe(true);
    expect(ds.getStatus().dreaming).toBe(false);
  });
  it('getStatus is Grade A', () => expect(new DreamState().getStatus().grade).toBe('A'));
});

describe('PatternAnalyzer', () => {
  it('analyzes code strings for patterns', () => {
    const pa = new PatternAnalyzer();
    const result = pa.analyze('async class MyClass {}');
    expect(result.complexity).toBe(4);
    expect(result.patterns).toContain('ASYNC_AWAIT');
    expect(result.patterns).toContain('OOP_CLASS');
  });
  it('getStatus is Grade A', () => expect(new PatternAnalyzer().getStatus().grade).toBe('A'));
});

describe('PatternMiner', () => {
  it('mines patterns from prompts', () => {
    const pm = new PatternMiner();
    const pid = pm.mine('Create a new button');
    expect(pid).toContain('creation_pattern');
    expect(pm.getPatterns().length).toBe(1);
    expect(pm.mine('what is the weather')).toBeNull();
  });
  it('getStatus is Grade A', () => expect(new PatternMiner().getStatus().grade).toBe('A'));
});

describe('ProofToValue', () => {
  it('calculates value based on complexity and quality', () => {
    const ptv = new ProofToValue();
    const valA = ptv.calculateValue({ complexity: 2, quality: 'A' });
    const valB = ptv.calculateValue({ complexity: 2, quality: 'B' });
    expect(valA).toBe(150); // 50 * 2 * 1.5
    expect(valB).toBe(120); // 50 * 2 * 1.2
  });
  it('getStatus is Grade A', () => expect(new ProofToValue().getStatus().grade).toBe('A'));
});
