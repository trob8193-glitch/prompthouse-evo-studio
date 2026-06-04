import { describe, it, expect } from 'vitest';
import { RealityTwinRoutes } from '../src/core/api/reality_twin_routes.js';
import { ScopeManager } from '../src/core/api/scopes.js';
import { TrainingCapture } from '../src/core/api/training_capture.js';
import { TrainingJobQueue } from '../src/core/api/training_job_queue.js';

// --- RealityTwinRoutes ---
describe('RealityTwinRoutes', () => {
  it('creates and updates twins', () => {
    const twin = new RealityTwinRoutes();
    expect(twin.createTwin('t1', { phase: 1 })).toBe(true);
    expect(twin.updateState('t1', { score: 100 })).toBe(true);
    
    const state = twin.getState('t1');
    expect(state.phase).toBe(1);
    expect(state.score).toBe(100);
    expect(twin.getHistory('t1').length).toBe(2);
  });

  it('getStatus is Grade A', () => {
    expect(new RealityTwinRoutes().getStatus().grade).toBe('A');
  });
});

// --- ScopeManager ---
describe('ScopeManager', () => {
  it('checks permissions correctly', () => {
    const sm = new ScopeManager();
    expect(sm.hasPermission(['read', 'write'], 'write')).toBe(true);
    expect(sm.hasPermission(['read'], 'write')).toBe(false);
    expect(sm.hasPermission(['admin'], 'training')).toBe(true); // Admin override
  });

  it('retrieves scopes', () => {
    const sm = new ScopeManager();
    expect(sm.getScope('read').level).toBe(1);
    expect(sm.listScopes().length).toBe(5);
  });

  it('getStatus is Grade A', () => {
    expect(new ScopeManager().getStatus().grade).toBe('A');
  });
});

// --- TrainingCapture ---
describe('TrainingCapture', () => {
  it('captures and flushes interactions', () => {
    const tc = new TrainingCapture();
    expect(tc.capture({ input: 'test' })).toBe(true);
    expect(tc.capture({})).toBe(false); // Invalid
    
    const data = tc.flush();
    expect(data.length).toBe(1);
    expect(tc.flush().length).toBe(0);
  });

  it('getStatus is Grade A', () => {
    expect(new TrainingCapture().getStatus().grade).toBe('A');
  });
});

// --- TrainingJobQueue ---
describe('TrainingJobQueue', () => {
  it('enqueues, starts, and completes jobs', () => {
    const jq = new TrainingJobQueue();
    expect(jq.enqueue('job1', { epochs: 10 })).toBe(true);
    expect(jq.getJob('job1').status).toBe('QUEUED');
    
    expect(jq.startJob('job1')).toBe(true);
    expect(jq.getJob('job1').status).toBe('RUNNING');
    
    expect(jq.completeJob('job1', { loss: 0.1 })).toBe(true);
    expect(jq.getJob('job1').status).toBe('COMPLETED');
    expect(jq.getJob('job1').result.loss).toBe(0.1);
  });

  it('filters by status', () => {
    const jq = new TrainingJobQueue();
    jq.enqueue('j1', {}); jq.enqueue('j2', {});
    jq.startJob('j1');
    
    expect(jq.listByStatus('QUEUED').length).toBe(1);
    expect(jq.listByStatus('RUNNING').length).toBe(1);
  });

  it('getStatus is Grade A', () => {
    expect(new TrainingJobQueue().getStatus().grade).toBe('A');
  });
});
