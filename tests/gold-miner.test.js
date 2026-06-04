import { describe, it, expect } from 'vitest';
import { GoldMiner } from '../src/core/foundry/GoldMiner.js';

describe('GoldMiner', () => {
  it('identifies and stores high-quality praise interactions', () => {
    const miner = new GoldMiner();
    const result = miner.scan({ id: 'log1', text: 'This was a perfect generation!' });
    
    expect(result).toBe(true);
    const vault = miner.getVault();
    expect(vault.length).toBe(1);
    expect(vault[0].text).toContain('perfect');
  });

  it('ignores standard interactions', () => {
    const miner = new GoldMiner();
    const result = miner.scan({ id: 'log2', text: 'Generate a button for me.' });
    
    expect(result).toBe(false);
    expect(miner.getVault().length).toBe(0);
  });

  it('getStatus returns active grade', () => {
    const miner = new GoldMiner();
    const status = miner.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
