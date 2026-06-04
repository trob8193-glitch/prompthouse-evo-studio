import { describe, it, expect } from 'vitest';
import { Arena } from '../src/core/agent/Arena.js';
import { FlightRecorder } from '../src/core/audit/FlightRecorder.js';
import { TestAutonomy } from '../src/core/autonomy/test_autonomy.js';
import { RevenueAutopilot } from '../src/core/commerce/RevenueAutopilot.js';
import { PatchProposalEngine } from '../src/core/evolution/PatchProposalEngine.js';
import { LevelSystem } from '../src/core/progression/LevelSystem.js';
import { RealityTwin } from '../src/core/reality/RealityTwin.js';

describe('Arena', () => {
  it('manages battles', () => {
    const arena = new Arena();
    expect(arena.startBattle('b1', ['agent1', 'agent2'])).toBe(true);
    expect(arena.runRound('b1')).toBe(true);
    expect(arena.endBattle('b1', 'agent1')).toBe(true);
    expect(arena.getBattle('b1').winner).toBe('agent1');
  });
  it('getStatus is Grade A', () => expect(new Arena().getStatus().grade).toBe('A'));
});

describe('FlightRecorder', () => {
  it('logs and clears events', () => {
    const fr = new FlightRecorder();
    fr.log('start', { id: 1 });
    expect(fr.getLogs().length).toBe(1);
    fr.clear();
    expect(fr.getLogs().length).toBe(0);
  });
  it('getStatus is Grade A', () => expect(new FlightRecorder().getStatus().grade).toBe('A'));
});

describe('TestAutonomy', () => {
  it('registers gates and evaluates scores', () => {
    const ta = new TestAutonomy();
    ta.registerGate('release', { requiredConfidence: 90 });
    expect(ta.evaluate('release', 95)).toBe(true);
    expect(ta.evaluate('release', 80)).toBe(false);
  });
  it('getStatus is Grade A', () => expect(new TestAutonomy().getStatus().grade).toBe('A'));
});

describe('RevenueAutopilot', () => {
  it('handles credits and debits', () => {
    const ra = new RevenueAutopilot();
    expect(ra.credit(100, 'sales')).toBe(true);
    expect(ra.getBalance()).toBe(100);
    expect(ra.debit(30, 'costs')).toBe(true);
    expect(ra.getBalance()).toBe(70);
    expect(ra.debit(200, 'overdraft')).toBe(false);
  });
  it('getStatus is Grade A', () => expect(new RevenueAutopilot().getStatus().grade).toBe('A'));
});

describe('PatchProposalEngine', () => {
  it('proposes, approves, and rejects patches', () => {
    const ppe = new PatchProposalEngine();
    const patchId = ppe.proposePatch('main.js', 'console.log("hi")');
    expect(ppe.approve(patchId)).toBe(true);
    
    const patch2 = ppe.proposePatch('test.js', '...');
    expect(ppe.reject(patch2)).toBe(true);
  });
  it('getStatus is Grade A', () => expect(new PatchProposalEngine().getStatus().grade).toBe('A'));
});

describe('LevelSystem', () => {
  it('adds XP and calculates levels', () => {
    const ls = new LevelSystem();
    ls.addXP(150);
    expect(ls.getStats().level).toBe(2);
    expect(ls.getStats().xp).toBe(150);
  });
  it('getStatus is Grade A', () => expect(new LevelSystem().getStatus().grade).toBe('A'));
});

describe('RealityTwin', () => {
  it('syncs state', () => {
    const rt = new RealityTwin();
    expect(rt.sync()).toBe(true);
    expect(rt.getSyncStatus().state).toBe('SYNCING');
  });
  it('getStatus is Grade A', () => expect(new RealityTwin().getStatus().grade).toBe('A'));
});
