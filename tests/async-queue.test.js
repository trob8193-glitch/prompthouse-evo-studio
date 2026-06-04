import { describe, it, expect } from 'vitest';
import { AsyncQueue } from '../src/core/automation/AsyncQueue.js';

describe('AsyncQueue', () => {
  it('enqueues and executes tasks based on concurrency', async () => {
    const queue = new AsyncQueue(2);
    let executedCount = 0;
    
    const taskFn = async () => {
      await new Promise(r => setTimeout(r, 10));
      executedCount++;
      return true;
    };

    queue.enqueue('t1', taskFn);
    queue.enqueue('t2', taskFn);
    queue.enqueue('t3', taskFn);

    expect(queue.getMetrics().queued).toBe(1); // 2 should be running immediately
    
    const metrics = await queue.drain();
    
    expect(executedCount).toBe(3);
    expect(metrics.completed).toBe(3);
    expect(metrics.failed).toBe(0);
  });

  it('handles failed tasks', async () => {
    const queue = new AsyncQueue(1);
    
    queue.enqueue('fail_task', async () => {
      throw new Error('Task failed manually');
    });

    const metrics = await queue.drain();
    
    expect(metrics.failed).toBe(1);
    expect(queue.getMetrics().failed).toBe(1);
  });

  it('getStatus returns active grade', () => {
    const queue = new AsyncQueue();
    const status = queue.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
