import { create } from 'zustand';

/**
 * PH EVO STUDIO — SOVEREIGN STORE (ENTERPRISE GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Central state management for the entire studio. Manages
 * navigation, bridge connectivity, chat, metrics, and API config.
 */

const BRIDGE_URL = 'http://127.0.0.1:3001';

export const useSovereignStore = create((set, get) => ({
  // ─── Navigation ─────────────────────────────────────────────
  activePage: 'dashboard',
  sidebarCollapsed: false,

  setActivePage: (page) => set({ activePage: page }),
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
      const res = await fetch(`${BRIDGE_URL}/status`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error(`Bridge returned ${res.status}`);
      const data = await res.json();
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
      const res = await fetch(`${BRIDGE_URL}/api/metrics`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error(`Metrics returned ${res.status}`);
      const data = await res.json();
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

      const res = await fetch(`${BRIDGE_URL}/api/evo-lm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages.filter((m) => m.role !== 'system'),
          systemPrompt: 'You are PH Evo Studio — a sovereign-grade AI development platform. Help the user with prompt engineering, code generation, architecture planning, and studio operations. Be precise, technical, and production-focused.'
        }),
      });

      if (!res.ok) throw new Error(`Chat returned ${res.status}`);
      const data = await res.json();

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'No response received.',
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
      const res = await fetch(`${BRIDGE_URL}/api/config/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: { openai: state.apiConfig.openaiKey, vercel: state.apiConfig.vercelToken } }),
      });
      if (!res.ok) throw new Error(`Config save returned ${res.status}`);
      set({ apiConfigSaving: false });
      return true;
    } catch (err) {
      set({ apiConfigSaving: false, apiConfigError: err.message });
      return false;
    }
  },

  logToLedger: async (feature_id, action, proof_hash, truth_state = 'UNVERIFIED', iq_gain = 0) => {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/sovereign-ledger/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_id, action, proof_hash, truth_state, iq_gain }),
      });
      if (!res.ok) throw new Error(`Ledger log returned ${res.status}`);
      return await res.json();
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
      const res = await fetch(`${BRIDGE_URL}/api/maintenance/run`, { method: 'POST' });
      if (!res.ok) throw new Error(`Maintenance returned ${res.status}`);
      const data = await res.json();
      get().addNotification('Maintenance cycle completed.', 'success');
      return data;
    } catch (err) {
      get().addNotification(`Maintenance failed: ${err.message}`, 'error');
      return null;
    }
  },

  // ─── Global Sync ──────────────────────────────────────────
  syncInterval: null,
  runTruthProbe: async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/truth/probe`);
      if (!res.ok) throw new Error('Probe failed');
      const data = await res.json();
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

    // Run immediately (non-blocking) then every 8 seconds
    // No await — never blocks the UI thread
    const poll = () => {
      get().fetchBridgeStatus().catch(() => {});
      get().fetchMetrics().catch(() => {});
    };
    poll(); // initial probe
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
