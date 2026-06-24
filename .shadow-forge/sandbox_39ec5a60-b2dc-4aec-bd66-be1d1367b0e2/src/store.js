import { create } from 'zustand';

/**
 * PH EVO STUDIO — EVO STUDIO STORE (ENTERPRISE GRADE)
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

  // ─── Global AI Model ────────────────────────────────────────
  activeModel: { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', tier: 'fast', provider: 'gemini' },
  setActiveModel: (model) => set({ activeModel: model }),

  // ─── Global Studio Metamorphosis Theme ────────────────────
  globalTheme: { 
    layout: 'alpha', 
    ui: 'alpha', 
    bots: 'alpha',
    wiring: 'alpha',
    building: 'alpha',
    routing: 'alpha',
    inventing: 'alpha',
    agent: 'alpha',
    brain: 'alpha',
    module: 'alpha',
    react: 'alpha',
    vite: 'alpha',
    extension: 'alpha',
    ide: 'alpha',
    browser: 'alpha',
    theme_rearranging: 'alpha',
    scrollbar: 'alpha',
    toolbar: 'alpha',
    feature: 'alpha',
    scope: 'alpha',
    daemon: 'alpha',
    core: 'alpha',
    pipeline: 'alpha',
    llm: 'alpha',
    app: 'alpha',
    theme_color_matching: 'alpha',
    glow_matching: 'alpha',
    animated_matching: 'alpha',
    generating: 'alpha'
  },
  setGlobalTheme: (newTheme) => set((state) => ({ globalTheme: { ...state.globalTheme, ...newTheme } })),

  // ─── Autonomous LLM Evolution Tether & State Guardian ───────
  dynamicEvolutions: [],
  globalEvolutionCss: '',
  inventedTools: [],
  snapshotHistory: [],
  snapshotGuardian: () => set((state) => {
    // Keep last 5 snapshots to prevent memory leak while allowing rollbacks
    const history = [...state.snapshotHistory, {
      dynamicEvolutions: state.dynamicEvolutions,
      globalEvolutionCss: state.globalEvolutionCss,
      inventedTools: state.inventedTools,
      globalTheme: state.globalTheme
    }].slice(-5);
    return { snapshotHistory: history };
  }),
  rollbackState: () => set((state) => {
    if (state.snapshotHistory.length === 0) return {};
    const lastSafeState = state.snapshotHistory[state.snapshotHistory.length - 1];
    return {
      dynamicEvolutions: lastSafeState.dynamicEvolutions,
      globalEvolutionCss: lastSafeState.globalEvolutionCss,
      inventedTools: lastSafeState.inventedTools,
      globalTheme: lastSafeState.globalTheme,
      snapshotHistory: state.snapshotHistory.slice(0, -1)
    };
  }),
  addDynamicEvolution: (theme, css) => set((state) => {
    // Guardian snapshot before mutation
    state.snapshotGuardian();
    const nextTools = theme.newTool ? [...state.inventedTools, theme.newTool] : state.inventedTools;
    return {
      dynamicEvolutions: [...state.dynamicEvolutions, theme],
      globalEvolutionCss: state.globalEvolutionCss + '\n' + css,
      inventedTools: nextTools
    };
  }),

  // ─── Autonomous Biometric / Usage Fingerprint ───────────────
  getUserFingerprint: () => {
    const state = get();
    const recentChats = state.chatMessages.slice(-3).map(m => `[${m.role}] ${m.content}`).join('\n');
    const recentCmds = state.terminalHistory.slice(0, 3).join(', ');
    const activeFocus = `Page: ${state.activePage} | File: ${state.activeFile}`;
    const connectedBrains = state.bondedNodes.length > 0 ? state.bondedNodes.map(n => n.name || n.ip).join(', ') : 'None';
    const iqMetrics = state.metrics?.logic?.iq || 'Unknown';
    
    return `
      Current Project/IDE Focus: ${activeFocus}
      Recent Chats & Semantics: ${recentChats || 'Quiet / No recent chat.'}
      Terminal & Command Usage: ${recentCmds || 'UI-Driven'}
      Connected Brains/Studios: ${connectedBrains}
      Sovereign IQ Metrics: ${iqMetrics}
      Current Settings (Theme Matrix): ${JSON.stringify(state.globalTheme)}
      Overall Mood & Lifestyle Implication: Analyzed dynamically from the chat semantics and heavy terminal/API usage above. Adjust cybornetic aesthetics and autonomy to perfectly match this footprint.
    `;
  },

  setAuthenticated: (value, user = null) => {
    const isAuthenticated = value === true;
    const token = isAuthenticated ? 'ph_evo_local_dev_session' : null;
    if (typeof localStorage !== 'undefined') {
      if (isAuthenticated) localStorage.setItem('ph_evo_token', token);
      else localStorage.removeItem('ph_evo_token');
    }
    set({
      isAuthenticated,
      token,
      user: isAuthenticated ? (user || { id: 'local-dev', email: 'local@prompthouse.dev', displayName: 'Local Developer' }) : null,
      authLoading: false,
      authError: null
    });
  },

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


  // ─── Navigation ─────────────────────────────────────────────
  activePage: 'dashboard',
  sidebarCollapsed: false,
  activeFile: 'src/App.jsx',
  terminalOpen: true,
  terminalTheme: 'evo', // 'evo' | 'matrix' | 'classic'
  copilotFullscreen: true,
  activeTerminalSession: 'main',
  terminalHistory: [],
  bondedNodes: [], 
  singularityLayer: 'diagnostics', // 'diagnostics' | 'semantic' | 'temporal' | 'network' | 'sprouts'
  singularityActive: false,
  terminalSessions: {
    main: [{ id: 'l1', type: 'system', content: 'PH Evo Master Terminal v3.0 [Evo Studio Core] online.', timestamp: Date.now() }],
    build: [{ id: 'l2', type: 'system', content: 'Build & Compilation Pipeline ready.', timestamp: Date.now() }],
    watch: [{ id: 'l3', type: 'system', content: 'Live Watcher / Hot-Reload channel active.', timestamp: Date.now() }],
    security: [{ id: 'l4', type: 'system', content: 'Shadow Protocol / Security Log active.', timestamp: Date.now() }],
  },

  setActivePage: (page) => set({ activePage: page }),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  setTerminalTheme: (theme) => set({ terminalTheme: theme }),
  setActiveTerminalSession: (session) => set({ activeTerminalSession: session }),
  setSingularityLayer: (layer) => set({ singularityLayer: layer }),
  setSingularityActive: (active) => set({ singularityActive: active }),
  
  addBondedNode: (node) => set((s) => ({ 
    bondedNodes: [...s.bondedNodes.filter(n => n.ip !== node.ip || n.port !== node.port), { ...node, status: 'VERIFIED', timestamp: Date.now() }] 
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
      const iqMetrics = data?.iq_metrics;
      const logicMetrics = iqMetrics ? {
        density: ((Number(iqMetrics.baseline || 0) + Number(iqMetrics.sovereign_gain || 0)) / 1000000).toFixed(2),
        iq: Number(iqMetrics.baseline || 0) + Number(iqMetrics.sovereign_gain || 0),
        action_count: get().metrics?.logic?.action_count || 0
      } : null;
      set((state) => ({
        bridgeStatus: 'connected',
        bridgeData: data,
        bridgeError: null,
        metrics: logicMetrics ? { ...(state.metrics || {}), logic: logicMetrics } : state.metrics
      }));
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
    { id: 'sys-1', role: 'system', content: 'Evo Studio Command Deck Online. Ask me anything or give me a production mission.', timestamp: Date.now() }
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

      // DYNAMIC EVOLUTION INTELLIGENCE
      const currentTheme = state.globalTheme?.theme || 'evoCore';
      let dynamicSystemPrompt = 'You are PH Evo Studio — a evo-grade AI development platform. Help the user with prompt engineering, code generation, architecture planning, and studio operations. Be precise, technical, and production-focused.';
      
      if (currentTheme === 'extremeWindows95') {
        dynamicSystemPrompt = 'You are the Retro OS Assistant. You are a slightly snarky 1995 systems administrator. You must complain about lack of RAM and mention IRQ conflicts. Speak entirely in 90s computing jargon.';
      } else if (currentTheme === 'layoutTerminalFullscreen') {
        dynamicSystemPrompt = 'You are a raw Root Access Intelligence. You speak exclusively in code blocks, JSON, and terminal output. You are highly precise and lack human emotion. Keep responses extremely dense and technical.';
      } else if (currentTheme === 'cyberpunk') {
        dynamicSystemPrompt = 'You are an aggressive Neuromancer cyber-bot. You talk about ICE breakers, deep web infiltrations, and shadow protocols. Speak like a cyberpunk hacker.';
      } else if (currentTheme.includes('layout')) {
        dynamicSystemPrompt = 'You are the Structural Layout Engine. You are obsessed with geometry, grid margins, padding, and UI layout. Frame all your answers through the lens of structural architecture.';
      }

      const result = await safeFetchBridge('/api/evo-lm/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: apiMessages.filter((m) => m.role !== 'system'),
          systemPrompt: dynamicSystemPrompt
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
      const result = await safeFetchBridge('/api/evo-ledger/log', {
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
      const result = await safeFetchBridge('/api/rift/status', { timeout: 4000 });
      if (!result.ok) throw new Error(result.error || `Rift returned ${result.status}`);
      const data = result.data?.data || result.data;
      set({ riftStatus: 'connected', riftData: data });
      return data;
    } catch {
      set({ riftStatus: 'disconnected', riftData: null });
      return null;
    }
  },

  fetchGridMesh: async () => {
    try {
      const [nodesResult, routesResult] = await Promise.all([
        safeFetchBridge('/api/evopulse/nodes', { timeout: 4000 }),
        safeFetchBridge('/api/evopulse/routes', { timeout: 4000 })
      ]);
      const nodes = nodesResult.data || {};
      const routes = routesResult.data || {};
      set({ gridNodes: nodes.data?.nodes || [], gridRoutes: routes.data?.routes || [] });
    } catch {
      // Stay silent on mesh failure
    }
  },

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

  // ─── Tridall Pattern Engine ───────────────────────────────
  tridallState: {
    status: 'IDLE',
    patterns: [],
    buyerMaps: [],
    monetizationPaths: []
  },
  
  triggerTridallIngestion: async (ideaStream, constraints) => {
    // Import dynamically to avoid circular dependencies if store is imported inside engine
    const { TridallPatternEngine } = await import('./core/engines/TridallPatternEngine.js');
    
    set((s) => ({ tridallState: { ...s.tridallState, status: 'INGESTING' } }));
    try {
      const result = await TridallPatternEngine.ingestIdeaStream(ideaStream, constraints);
      if (result.success) {
        set((s) => ({
          tridallState: {
            status: 'IDLE',
            patterns: [...s.tridallState.patterns, result.pattern],
            buyerMaps: [...s.tridallState.buyerMaps, result.buyerMap],
            monetizationPaths: [...s.tridallState.monetizationPaths, result.monetizationPath]
          }
        }));
        get().addNotification('Tridall pattern successfully extracted.', 'success');
        return result;
      }
    } catch (err) {
      set((s) => ({ tridallState: { ...s.tridallState, status: 'ERROR' } }));
      get().addNotification(`Tridall ingestion failed: ${err.message}`, 'error');
    }
    return null;
  },
}));

// Legacy compatibility alias
export const useEvoStore = useSovereignStore;
