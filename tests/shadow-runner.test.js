import { describe, it, expect } from 'vitest';
import { ShadowRunner } from '../src/core/automation/ShadowRunner.js';

describe('ShadowRunner', () => {
  it('runs a task successfully', async () => {
    const runner = new ShadowRunner();
    
    const res = await runner.run('t1', async () => 'Success');
    
    expect(res.success).toBe(true);
    expect(res.result).toBe('Success');
    
    const logs = runner.getExecutionLog();
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('COMPLETED');
  });

  it('enforces timeouts', async () => {
    const runner = new ShadowRunner(50); // 50ms timeout
    
    const res = await runner.run('t2', async () => {
      await new Promise(r => setTimeout(r, 100)); // takes 100ms
      return 'Late';
    });
    
    expect(res.success).toBe(false);
    expect(res.error).toContain('timed out');
    
    const logs = runner.getExecutionLog();
    expect(logs[0].status).toBe('FAILED');
  });

  it('getStatus returns active grade', () => {
    const runner = new ShadowRunner();
    const status = runner.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
