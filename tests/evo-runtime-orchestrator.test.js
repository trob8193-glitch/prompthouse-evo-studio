import { describe, it, expect } from 'vitest';
import { EvoRuntimeOrchestrator } from '../src/core/foundry/evo-runtime-orchestrator.js';

describe('EvoRuntimeOrchestrator', () => {
  it('starts new evolution cycles', () => {
    const orchestrator = new EvoRuntimeOrchestrator();
    expect(orchestrator.startCycle('c1')).toBe(true);
    expect(orchestrator.startCycle('c1')).toBe(false); // Already running
    
    const cycle = orchestrator.getCycle('c1');
    expect(cycle.state).toBe('INITIALIZING');
  });

  it('transitions cycles through valid states', () => {
    const orchestrator = new EvoRuntimeOrchestrator();
    orchestrator.startCycle('c2');
    
    expect(orchestrator.transition('c2', 'EXECUTING')).toBe(true);
    expect(orchestrator.getCycle('c2').state).toBe('EXECUTING');
    
    expect(orchestrator.transition('c2', 'INVALID_STATE')).toBe(false);
  });

  it('records finished timestamp on completion', () => {
    const orchestrator = new EvoRuntimeOrchestrator();
    orchestrator.startCycle('c3');
    orchestrator.transition('c3', 'COMPLETED');
    
    const cycle = orchestrator.getCycle('c3');
    expect(cycle.state).toBe('COMPLETED');
    expect(cycle.finishedAt).toBeDefined();
  });

  it('getStatus returns active grade', () => {
    const orchestrator = new EvoRuntimeOrchestrator();
    const status = orchestrator.getStatus();
    expect(status.grade).toBe('A');
    expect(status.state).toBe('ACTIVE');
  });
});
