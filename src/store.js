import { create } from 'zustand';

/**
 * PH EVO STUDIO — SOVEREIGN STORE (ENTERPRISE GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Central state management for the entire studio. Manages
 * navigation, bridge connectivity, chat, metrics, and API config.
 */

import { BRIDGE_URL, safeFetchBridge } from './config/bridge-config.js';

const getInitialToken = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('ph_evo_token') || null;
  }
  return null;
};

export const useSovereignStore = create((set, get) => ({
  // ─── Authentication ─────────────────────────────────────────
  user: null,
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  authLoading: false,
  authError: null,

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const result = await safeFetchBridge('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = result.data;
      if (!result.ok) throw new Error(result.error || 'Login failed');
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ph_evo_token', data.token);
      }
      set({ user: data.user, token: data.token, isAuthenticated: true, authLoading: false });
      return true;
    } catch (err) {
      set({ authError: err.message, authLoading: false });
      return false;
    }
  },

  register: async (email, password, displayName) => {
    set({ authLoading: true, authError: null });
    try {
      const result = await safeFetchBridge('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName })
      });
      const data = result.data;
      if (!result.ok) throw new Error(result.error || 'Registration failed');
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ph_evo_token', data.token);
      }
      set({ user: data.user, token: data.token, isAuthenticated: true, authLoading: false });
      return true;
    } catch (err) {
      set({ authError: err.message, authLoading: false });
      return false;
    }
  },

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ph_evo_token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const result = await safeFetchBridge('/api/auth/me');
      if (result.ok) {
        const data = result.data;
        set({ user: data.user, isAuthenticated: true });
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    }
  },

  // ─── Navigation ─────────────────────────────────────────────
  activePage: 'dashboard',
  sidebarCollapsed: false,
  activeFile: 'src/App.jsx',
  terminalOpen: true,
  terminalTheme: 'sovereign', // 'sovereign' | 'matrix' | 'classic'
  activeTerminalSession: 'main',
  terminalHistory: [],
  bondedNodes: [], 
  singularityLayer: 'diagnostics', // 'diagnostics' | 'semantic' | 'temporal' | 'network' | 'sprouts'
  singularityActive: false,
  terminalSessions: {
    main: [{ id: 'l1', type: 'system', content: 'PH Evo Master Terminal v3.0 [Sovereign Core] online.', timestamp: Date.now() }],
    build: [{ id: 'l2', type: 'system', content: 'Build & Compilation Pipeline ready.', timestamp: Date.now() }],
    watch: [{ id: 'l3', type: 'system', content: 'Live Watcher / Hot-Reload channel active.', timestamp: Date.now() }],
    security: [{ id: 'l4', type: 'system', content: 'Shadow Protocol / Security Log active.', timestamp: Date.now() }],
  },

  setActivePage: (page) => set({ activePage: page }),
  setActiveFile: (file) => set({ activeFile: file }),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  setTerminalTheme: (theme) => set({ terminalTheme: theme }),
  setActiveTerminalSession: (session) => set({ activeTerminalSession: session }),
  setSingularityLayer: (layer) => set({ singularityLayer: layer }),
  setSingularityActive: (active) => set({ singularityActive: active }),
  
  addBondedNode: (node) => set((s) => ({ 
    bondedNodes: [...s.bondedNodes.filter(n => n.ip !== node.ip || n.port !== node.port), { ...node, status: 'VERIFIED', timestamp: Date.now() }] 
  })),
  removeBondedNode: (ip, port) => set((s) => ({ 
    bondedNodes: s.bondedNodes.filter(n => n.ip !== ip || n.port !== port) 
  })),
  
  refreshNodeMesh: async () => {
    try {
      const result = await safeFetchBridge('/api/intelligence/nodes/probe');
      const data = result.data;
      if (data.success) {
        set({ bondedNodes: data.nodes });
      }
    } catch (err) {
      console.warn('[Store] Node mesh refresh failed:', err.message);
    }
  },
  
  addTerminalLog: (content, type = 'info', session = 'main') => set((s) => ({
    terminalSessions: {
      ...s.terminalSessions,
      [session]: [...(s.terminalSessions[session] || []), { id: `log-${Date.now()}`, type, content, timestamp: Date.now() }].slice(-250)
    }
  })),
  
  addTerminalHistory: (cmd) => set((s) => ({
    terminalHistory: [...new Set([cmd, ...s.terminalHistory])].slice(0, 50)
  })),
  
  clearTerminal: (session) => set((s) => ({
    terminalSessions: {
      ...s.terminalSessions,
      [session]: []
    }
  })),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ─── Evolution Runtime ─────────────────────────────────────
  evolutionProfile: null,
  evolutionRuntime: null,
  setEvolutionProfile: (profile) => set({ evolutionProfile: profile || null }),
  applyEvolutionRuntime: (runtime) => set((state) => ({
    evolutionRuntime: runtime || null,
    sidebarCollapsed: typeof runtime?.layoutHints?.sidebarCollapsed === 'boolean'
      ? runtime.layoutHints.sidebarCollapsed
      : state.sidebarCollapsed
  })),

  // ─── Bridge Connection ──────────────────────────────────────
  bridgeStatus: 'disconnected', // 'connected' | 'disconnected' | 'error'
  bridgeData: null,
  bridgeError: null,

  fetchBridgeStatus: async () => {
    try {
      const result = await safeFetchBridge('/status', { timeout: 5000 });
      if (!result.ok) throw new Error(result.error || 'Bridge disconnected');
      const data = result.data;
      set({ bridgeStatus: 'connected', bridgeData: data, bridgeError: null });
      return data;
    } catch (err) {
      set({ bridgeStatus: 'error', bridgeError: err.message });
      return null;
    }
  },

  // ─── System Metrics ─────────────────────────────────────────
  metrics: null,
  metricsLoading: false,

  fetchMetrics: async () => {
    set({ metricsLoading: true });
    try {
      const result = await safeFetchBridge('/api/metrics');
      if (!result.ok) throw new Error(result.error || 'Metrics unavailable');
      const data = result.data;
      set({ metrics: data, metricsLoading: false });
      return data;
    } catch (err) {
      set({ metricsLoading: false });
      return null;
    }
  },

  // ─── AI Chat ────────────────────────────────────────────────
  chatMessages: [
    { id: 'sys-1', role: 'system', content: 'Sovereign Command Deck Online. Ask me anything or give me a production mission.', timestamp: Date.now() }
  ],
  chatLoading: false,
  chatError: null,

  sendChatMessage: async (userText) => {
    const state = get();
    const userMsg = { id: `user-${Date.now()}`, role: 'user', content: userText, timestamp: Date.now() };
    set({ chatMessages: [...state.chatMessages, userMsg], chatLoading: true, chatError: null });

    try {
      const apiMessages = state.chatMessages
        .filter((m) => m.role !== 'system' || m.id === 'sys-1')
        .concat(userMsg)
        .map((m) => ({ role: m.role === 'system' ? 'system' : m.role, content: m.content }));

      const result = await safeFetchBridge('/api/evo-lm/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: apiMessages.filter((m) => m.role !== 'system'),
          systemPrompt: 'You are PH Evo Studio — a sovereign-grade AI development platform. Help the user with prompt engineering, code generation, architecture planning, and studio operations. Be precise, technical, and production-focused.'
        }),
      });

      if (!result.ok) throw new Error(result.error || 'Chat error');
      const data = result.data;
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: typeof data.message === 'object' ? (data.message.message || JSON.stringify(data.message)) : (data.message || 'No response received.'),
        truthState: data.truth_state || 'UNKNOWN',
        timestamp: Date.now(),
      };

      set((s) => ({ chatMessages: [...s.chatMessages, botMsg], chatLoading: false }));
      
      // Log to ledger
      state.logToLedger('chat', 'message_sent', null, 'VERIFIED', 1);

      return botMsg;
    } catch (err) {
      const errMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Connection error: ${err.message}. Make sure the bridge server is running (npm run bridge).`,
        truthState: 'ERROR',
        timestamp: Date.now(),
      };
      set((s) => ({ chatMessages: [...s.chatMessages, errMsg], chatLoading: false, chatError: err.message }));
      return errMsg;
    }
  },

  clearChat: () => set({
    chatMessages: [
      { id: 'sys-1', role: 'system', content: 'Chat cleared. Ready for new mission.', timestamp: Date.now() }
    ],
    chatError: null,
  }),

  // ─── API Configuration ─────────────────────────────────────
  apiConfig: {
    openaiKey: '',
    vercelToken: '',
    model: 'gpt-3.5-turbo',
    bridgeUrl: BRIDGE_URL,
  },
  apiConfigSaving: false,
  apiConfigError: null,

  updateApiConfig: (partial) => set((s) => ({
    apiConfig: { ...s.apiConfig, ...partial },
  })),

  saveApiKeys: async () => {
    const state = get();
    set({ apiConfigSaving: true, apiConfigError: null });
    try {
      const result = await safeFetchBridge('/api/config/keys', {
        method: 'POST',
        body: JSON.stringify({ keys: { openai: state.apiConfig.openaiKey, vercel: state.apiConfig.vercelToken } }),
      });
      if (!result.ok) throw new Error(result.error || 'Failed to save config');
      set({ apiConfigSaving: false });
      return true;
    } catch (err) {
      set({ apiConfigSaving: false, apiConfigError: err.message });
      return false;
    }
  },

  logToLedger: async (feature_id, action, proof_hash, truth_state = 'UNVERIFIED', iq_gain = 0) => {
    try {
      const result = await safeFetchBridge('/api/sovereign-ledger/log', {
        method: 'POST',
        body: JSON.stringify({ feature_id, action, proof_hash, truth_state, iq_gain }),
      });
      if (!result.ok) throw new Error(result.error || 'Ledger log failed');
      return result.data;
    } catch (err) {
      console.warn('[Store] Ledger log failed:', err.message);
      return null;
    }
  },

  // ─── Notifications ──────────────────────────────────────────
  notifications: [],

  addNotification: (msg, type = 'info') => {
    const id = `notif-${Date.now()}`;
    set((s) => ({ notifications: [...s.notifications, { id, msg, type, timestamp: Date.now() }].slice(-20) }));
    // Auto-dismiss after 5s
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, 5000);
  },

  // ─── Maintenance ────────────────────────────────────────────
  runMaintenance: async () => {
    try {
      const result = await safeFetchBridge('/api/maintenance/run', { method: 'POST' });
      if (!result.ok) throw new Error(result.error || 'Maintenance cycle failed');
      const data = result.data;
      get().addNotification('Maintenance cycle completed.', 'success');
      return data;
    } catch (err) {
      get().addNotification(`Maintenance failed: ${err.message}`, 'error');
      return null;
    }
  },

  // ─── Rift Grid & EvoPulse ──────────────────────────────────
  riftStatus: 'disconnected',
  riftData: null,
  gridNodes: [],
  gridRoutes: [],

  fetchRiftStatus: async () => {
    try {
      const res = await fetch('http://127.0.0.1:3002/status', { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`Rift returned ${res.status}`);
      const data = await res.json();
      set({ riftStatus: 'connected', riftData: data });
      return data;
    } catch {
      set({ riftStatus: 'disconnected', riftData: null });
      return null;
    }
  },

  fetchGridMesh: async () => {
    try {
      const [nodesRes, routesRes] = await Promise.all([
        fetch('http://127.0.0.1:3002/api/evopulse/nodes'),
        fetch('http://127.0.0.1:3002/api/evopulse/routes')
      ]);
      const nodes = await nodesRes.json();
      const routes = await routesRes.json();
      set({ gridNodes: nodes.data?.nodes || [], gridRoutes: routes.data?.routes || [] });
    } catch {
      // Stay silent on mesh failure
    }
  },

  // ─── Global Sync ──────────────────────────────────────────
  syncInterval: null,
  runTruthProbe: async () => {
    try {
      const result = await safeFetchBridge('/api/truth/probe');
      if (!result.ok) throw new Error(result.error || 'Probe failed');
      const data = result.data;
      set({ bridgeData: { ...get().bridgeData, probes: data.results } });
      return data.results;
    } catch (err) {
      console.warn('[Store] Truth probe failed:', err.message);
      return null;
    }
  },

  startGlobalSync: () => {
    const state = get();
    if (state.syncInterval) return;

    const poll = () => {
      get().fetchBridgeStatus().catch(() => {});
      get().fetchMetrics().catch(() => {});
      get().fetchRiftStatus().catch(() => {});
      get().fetchGridMesh().catch(() => {});
    };
    poll(); 
    const interval = setInterval(poll, 8000);
    set({ syncInterval: interval });
  },
  stopGlobalSync: () => {
    const state = get();
    if (state.syncInterval) {
      clearInterval(state.syncInterval);
      set({ syncInterval: null });
    }
  },
}));

// Legacy compatibility alias
export const useEvoStore = useSovereignStore;
