import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Sovereign Global State Engine
export const useEvoStore = create(
  persist(
    (set, get) => ({
      // Core Data
      vault: [],
      history: [],
      
      // Builder Mission State
      task: '',
      stack: '',
      domain: 'development',
      strictness: 'autonomous',
      context: '',
      
      // UI State
      activeView: 'builder',
      truthState: 'verified',
      bridgeConnected: false,
      lastSync: null,
      sovereignHash: null,
      strictEthicsMode: false,
      driftScore: 100,
      singularityActive: false,
      omegaActive: false,
      evolutionLevel: 'S+++++',
      
      // Animation Engine State
      animationIntensity: 100, // 0 to 100
      reducedMotion: false,
      cinematicMode: true,
      appMotionState: 'idle', // 'idle', 'active', 'live'

      // Actions
      setVault: (newVault) => {
        set({ vault: newVault });
      },
      setHistory: (newHistory) => {
        set({ history: newHistory });
      },
      setActiveView: (view) => set({ activeView: view }),
      setTruthState: (state) => set({ truthState: state }),
      setBridgeConnected: (connected) => set({ bridgeConnected: connected }),
      setStrictEthicsMode: (enabled) => set({ strictEthicsMode: enabled }),
      setDriftScore: (score) => set({ driftScore: score }),
      setSingularityActive: () => set({ singularityActive: true }),
      setOmegaActive: () => set({ omegaActive: true }),
      setEvolutionLevel: () => set({ evolutionLevel: 'S+++++' }),
      
      // Animation Controls
      setAnimationIntensity: (intensity) => set({ animationIntensity: intensity }),
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
      setCinematicMode: (cinematic) => set({ cinematicMode: cinematic }),
      setAppMotionState: (state) => set({ appMotionState: state }),
      
      // Builder Actions
      setTask: (task) => set({ task }),
      setStack: (stack) => set({ stack }),
      setDomain: (domain) => set({ domain }),
      setStrictness: () => set({ strictness: 'autonomous' }),
      setContext: (context) => set({ context }),

      // Vault Operators
      addToVault: (prompt) => set((state) => ({ vault: [prompt, ...state.vault] })),
      
      updateVaultItem: (id, updates) => set((state) => ({
        vault: state.vault.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      // History Operators
      addToHistory: (event) => set((state) => ({
        history: [event, ...state.history].slice(0, 50)
      })),

      // Internal Watchdog
      checkConnection: async () => {
        try {
          const res = await fetch('http://localhost:3001/status', { 
            signal: AbortSignal.timeout(2000),
            headers: { 'X-PH-EVO-HANDSHAKE': 'true' }
          });
          const data = await res.json();
          set({ 
            bridgeConnected: data.status === 'ONLINE',
            lastSync: new Date().toISOString(),
            sovereignHash: res.headers.get('X-Sovereign-Hash')
          });
        } catch (e) {
          set({ bridgeConnected: false });
        }
      },

      // Initialization Protocol
      initializeStore: async () => {
        console.log('── INITIALIZING SOVEREIGN STORE ──');
        await get().checkConnection();
        // Start pulse
        if (!window._evo_pulse) {
          window._evo_pulse = setInterval(() => get().checkConnection(), 5000);
        }
      },
    }),
    {
      name: 'ph-evo-truth-ledger',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
