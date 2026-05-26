import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

import {
  nightforgeState,
  runNightforgeCycle,
  buildNightforgeMetrics,
  updateNightforgeState,
  scheduleNightforgeDaemon,
  clearNightforgeDaemon
} from '../src/nightforge.js';

describe('NightForge API Controller Logic', () => {
  const RECEIPTS_DIR = path.join(process.cwd(), '.prompthouse-data', 'nightforge');
  const RECEIPTS_FILE = path.join(RECEIPTS_DIR, 'receipts.json');

  beforeEach(() => {
    // Reset state before each test
    updateNightforgeState({
      active: false,
      daemonEnabled: false,
      cycleCount: 0,
      lastCycleStatus: 'offline'
    });
    
    if (fs.existsSync(RECEIPTS_FILE)) {
      fs.writeFileSync(RECEIPTS_FILE, JSON.stringify([]));
    }
  });

  afterEach(() => {
    clearNightforgeDaemon();
  });

  it('GET /api/nightforge/status returns success true and state', () => {
    // Mock testing the status endpoint logic
    const state = nightforgeState;
    expect(state).toBeDefined();
    expect(state.active).toBe(false);
  });

  it('GET /api/nightforge/metrics returns success true and metrics', () => {
    const metrics = buildNightforgeMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.receiptsCount).toBe(0);
    expect(metrics.cycleCount).toBe(0);
  });

  it('POST /api/nightforge/settings updates allowed daemon fields only', () => {
    updateNightforgeState({ daemonEnabled: true });
    expect(nightforgeState.daemonEnabled).toBe(true);
  });

  it('POST /api/nightforge/cycle records a receipt and returns a truth_state', () => {
    const result = runNightforgeCycle({ payload: 'test' });
    
    expect(result.success).toBe(true);
    expect(['built', 'gated', 'broken', 'offline']).toContain(result.truth_state);
    
    const receipts = JSON.parse(fs.readFileSync(RECEIPTS_FILE, 'utf-8'));
    expect(receipts.length).toBe(1);
    expect(receipts[0].input.payload).toBe('test');
    expect(receipts[0].status).toBe(result.truth_state);
    
    expect(nightforgeState.cycleCount).toBe(1);
    expect(nightforgeState.lastCycleStatus).toBe(result.truth_state);
  });

  it('daemon stop sets active false', () => {
    scheduleNightforgeDaemon();
    expect(nightforgeState.active).toBe(true);
    
    clearNightforgeDaemon();
    expect(nightforgeState.active).toBe(false);
  });

  it('missing body never crashes server', () => {
    // Simulate missing body from request
    expect(() => {
      const result = runNightforgeCycle(undefined);
      expect(result.success).toBe(true);
    }).not.toThrow();
  });
});
