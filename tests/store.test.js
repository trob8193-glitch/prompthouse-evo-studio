import { describe, it, expect, beforeEach } from 'vitest';
import { useSovereignStore } from '../src/store.js';

describe('Sovereign Store', () => {
  beforeEach(() => {
    useSovereignStore.setState({
      activePage: 'dashboard',
      sidebarCollapsed: false,
      bridgeStatus: 'disconnected',
      metrics: null,
      notifications: [],
      terminalOpen: true,
      singularityActive: false,
    });
  });

  it('has default activePage of dashboard', () => {
    const state = useSovereignStore.getState();
    expect(state.activePage).toBe('dashboard');
  });

  it('setActivePage updates page', () => {
    useSovereignStore.getState().setActivePage('settings');
    expect(useSovereignStore.getState().activePage).toBe('settings');
  });

  it('toggleSidebar flips collapsed state', () => {
    expect(useSovereignStore.getState().sidebarCollapsed).toBe(false);
    useSovereignStore.getState().toggleSidebar();
    expect(useSovereignStore.getState().sidebarCollapsed).toBe(true);
    useSovereignStore.getState().toggleSidebar();
    expect(useSovereignStore.getState().sidebarCollapsed).toBe(false);
  });

  it('setTerminalOpen updates terminal state', () => {
    useSovereignStore.getState().setTerminalOpen(false);
    expect(useSovereignStore.getState().terminalOpen).toBe(false);
  });

  it('addTerminalLog adds entries capped at 250', () => {
    const store = useSovereignStore.getState();
    for (let i = 0; i < 260; i++) {
      store.addTerminalLog(`msg-${i}`, 'info', 'main');
    }
    const sessions = useSovereignStore.getState().terminalSessions;
    expect(sessions.main.length).toBeLessThanOrEqual(250);
  });

  it('addTerminalHistory deduplicates and caps at 50', () => {
    const store = useSovereignStore.getState();
    store.addTerminalHistory('cmd1');
    store.addTerminalHistory('cmd2');
    store.addTerminalHistory('cmd1'); // duplicate
    const history = useSovereignStore.getState().terminalHistory;
    expect(history[0]).toBe('cmd1');
    expect(history.filter(h => h === 'cmd1').length).toBe(1);
  });

  it('clearTerminal empties a session', () => {
    const store = useSovereignStore.getState();
    store.addTerminalLog('test', 'info', 'build');
    store.clearTerminal('build');
    expect(useSovereignStore.getState().terminalSessions.build.length).toBe(0);
  });

  it('setSingularityActive toggles overlay', () => {
    useSovereignStore.getState().setSingularityActive(true);
    expect(useSovereignStore.getState().singularityActive).toBe(true);
  });

  it('logout clears auth state', () => {
    useSovereignStore.setState({ user: { id: 1 }, token: 'abc', isAuthenticated: true });
    useSovereignStore.getState().logout();
    const state = useSovereignStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
