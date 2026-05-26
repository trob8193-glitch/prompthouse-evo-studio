/**
 * Tests for the Antigravity Blended Agent daemon.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test the pure logic functions without fs side-effects.
// Mock fs and path so the module loads in vitest without touching disk.
vi.mock('fs', () => {
  const mockFs = {
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn((filePath) => {
      if (filePath.includes('receipts.json')) return '[]';
      if (filePath.includes('tasks.json')) return '[]';
      if (filePath.includes('package.json')) return JSON.stringify({
        name: 'prompthouse-evo-studio',
        scripts: { test: 'vitest', build: 'vite build', perfect: 'vitest && vite build' }
      });
      return '[]';
    }),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({ isDirectory: () => false })),
  };
  return {
    ...mockFs,
    default: mockFs
  };
});

vi.mock('path', () => ({
  join: (...args) => args.join('/'),
  default: { join: (...args) => args.join('/') },
}));

describe('Antigravity Blended Agent', () => {
  let agentModule;

  beforeEach(async () => {
    vi.resetModules();
    agentModule = await import('../src/antigravity-agent.js');
  });

  it('exports the expected API surface', () => {
    expect(agentModule.agentState).toBeDefined();
    expect(typeof agentModule.runAgentCycle).toBe('function');
    expect(typeof agentModule.buildAgentMetrics).toBe('function');
    expect(typeof agentModule.updateAgentState).toBe('function');
    expect(typeof agentModule.updateTetherStatus).toBe('function');
    expect(typeof agentModule.scheduleAgentDaemon).toBe('function');
    expect(typeof agentModule.clearAgentDaemon).toBe('function');
    expect(typeof agentModule.getAgentTasks).toBe('function');
    expect(typeof agentModule.approveAgentTask).toBe('function');
    expect(typeof agentModule.rejectAgentTask).toBe('function');
    expect(typeof agentModule.handshakeWithDaemon).toBe('function');
    expect(typeof agentModule.detectProviders).toBe('function');
    expect(typeof agentModule.buildBlendedPrompt).toBe('function');
  });

  it('has correct initial agent state', () => {
    const state = agentModule.agentState;
    expect(state.active).toBe(false);
    expect(state.daemonEnabled).toBe(false);
    expect(state.running).toBe(false);
    expect(state.cycleCount).toBe(0);
    expect(state.providers.evo_lm.available).toBe(true);
    expect(state.tether.connected).toBe(false);
  });

  it('updateAgentState merges patches and sets lastUpdatedAt', async () => {
    // Artificial wait to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 5));
    const before = agentModule.agentState.lastUpdatedAt;
    agentModule.updateAgentState({ active: true, cycleCount: 5 });
    
    expect(agentModule.agentState.active).toBe(true);
    expect(agentModule.agentState.cycleCount).toBe(5);
    expect(agentModule.agentState.lastUpdatedAt).not.toBe(before);
  });

  it('detectProviders returns provider status based on env vars', () => {
    // No env vars set, so claude/gemini should be unconfigured
    const providers = agentModule.detectProviders();
    expect(providers.evo_lm.available).toBe(true);
    expect(providers.evo_lm.status).toBe('local');
    // claude and gemini depend on env, which are empty in test
    expect(providers.claude_opus.status).toBe('unconfigured');
  });

  it('runAgentCycle produces a valid cycle result with receipt', () => {
    const result = agentModule.runAgentCycle({ trigger: 'test' });
    expect(result.id).toBeDefined();
    expect(result.status).toBe('completed');
    expect(result.startedAt).toBeDefined();
    expect(result.completedAt).toBeDefined();
    expect(Array.isArray(result.proposals)).toBe(true);
    expect(result.scan).toBeDefined();
    expect(Array.isArray(result.scan.insights)).toBe(true);
    expect(result.providerResults).toBeDefined();
  });

  it('handshakeWithDaemon updates handshake state for nightforge', () => {
    const nfState = { cycleCount: 42, lastCycleStatus: 'completed' };
    const result = agentModule.handshakeWithDaemon('nightforge', nfState);
    expect(result.daemonId).toBe('nightforge');
    expect(result.reachable).toBe(true);
    expect(agentModule.agentState.handshakes.nightforge.connected).toBe(true);
    expect(agentModule.agentState.handshakes.nightforge.cycleCount).toBe(42);
  });

  it('handshakeWithDaemon marks unreachable when state is null', () => {
    const result = agentModule.handshakeWithDaemon('crucible', null);
    expect(result.reachable).toBe(false);
    expect(agentModule.agentState.handshakes.crucible.connected).toBe(false);
  });

  it('updateTetherStatus records IDE connection', () => {
    const tether = agentModule.updateTetherStatus({ connected: true, ideVersion: 'antigravity-ide-v1' });
    expect(tether.connected).toBe(true);
    expect(tether.ideVersion).toBe('antigravity-ide-v1');
    expect(tether.lastPingAt).toBeDefined();
  });

  it('buildAgentMetrics returns complete metrics object', () => {
    const metrics = agentModule.buildAgentMetrics();
    expect(typeof metrics.totalCycles).toBe('number');
    expect(typeof metrics.successfulCycles).toBe('number');
    expect(typeof metrics.failedCycles).toBe('number');
    expect(typeof metrics.cyclesToday).toBe('number');
    expect(metrics.providers).toBeDefined();
    expect(metrics.tether).toBeDefined();
    expect(metrics.handshakes).toBeDefined();
  });

  it('buildBlendedPrompt produces a non-empty string with workspace context', () => {
    const scan = { issues: [{ severity: 'high', type: 'test_issue', detail: 'A test issue' }], insights: ['10 files'], scannedAt: new Date().toISOString() };
    const handshakes = { nightforge: { connected: true, cycleCount: 5, lastCycleStatus: 'completed' } };
    const prompt = agentModule.buildBlendedPrompt(scan, handshakes);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('Antigravity Blended Agent');
    expect(prompt).toContain('Issues found: 1');
    expect(prompt).toContain('NightForge Daemon Status');
  });

  it('scheduleAgentDaemon and clearAgentDaemon manage daemon lifecycle', () => {
    agentModule.scheduleAgentDaemon(60);
    expect(agentModule.agentState.active).toBe(true);
    expect(agentModule.agentState.daemonEnabled).toBe(true);
    expect(agentModule.agentState.intervalMinutes).toBe(60);

    agentModule.clearAgentDaemon();
    expect(agentModule.agentState.active).toBe(false);
    expect(agentModule.agentState.daemonEnabled).toBe(false);
  });
});
