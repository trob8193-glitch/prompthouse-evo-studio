import { describe, it, expect } from 'vitest';
import { RecursiveSwarm } from '../src/core/automation/RecursiveSwarm.js';

describe('RecursiveSwarm', () => {
  it('executes a swarm of agents', async () => {
    const swarm = new RecursiveSwarm();
    
    swarm.spawnAgent('a1', async () => 'Result 1');
    swarm.spawnAgent('a2', async () => 'Result 2');
    
    expect(swarm.getMetrics().totalAgents).toBe(2);
    
    const results = await swarm.executeSwarm();
    
    expect(results).toContain('Result 1');
    expect(results).toContain('Result 2');
    expect(swarm.getMetrics().completed).toBe(2);
  });

  it('recurses until max depth or completion', async () => {
    const swarm = new RecursiveSwarm(3);
    
    const taskFn = async (input, depth) => {
      if (input >= 5) return { done: true, value: input };
      return { done: false, value: input + 2 };
    };

    const result = await swarm.recurse(taskFn, 0);
    
    expect(result.result).toBe(6); // 0 -> 2 -> 4 -> 6 (hits max depth 3 before reaching 5, input to depth 3 is 6)
    expect(result.halted).toBe(true);
    expect(result.depth).toBe(3);
    
    const swarm2 = new RecursiveSwarm(5);
    const result2 = await swarm2.recurse(taskFn, 0);
    
    expect(result2.result).toBe(6); // 0 -> 2 -> 4 -> 6 (done is true)
    expect(result2.halted).toBe(false);
  });

  it('getStatus returns active grade', () => {
    const swarm = new RecursiveSwarm();
    const status = swarm.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
