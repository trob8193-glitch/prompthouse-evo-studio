import { create } from 'zustand';

// Sovereign Global State Engine
export const useEvoStore = create((set, get) => ({
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
    try { localStorage.setItem('ph_vault_v3', JSON.stringify(newVault)); } catch(e){}
  },
  setHistory: (newHistory) => {
    set({ history: newHistory });
    try { localStorage.setItem('ph_history_v3', JSON.stringify(newHistory)); } catch(e){}
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
  addToVault: (prompt) => set((state) => {
    const updated = [prompt, ...state.vault];
    try { localStorage.setItem('ph_vault_v3', JSON.stringify(updated)); } catch(e){}
    return { vault: updated };
  }),
  
  updateVaultItem: (id, updates) => set((state) => {
    const updated = state.vault.map(p => p.id === id ? { ...p, ...updates } : p);
    try { localStorage.setItem('ph_vault_v3', JSON.stringify(updated)); } catch(e){}
    return { vault: updated };
  }),

  // History Operators
  addToHistory: (event) => set((state) => {
    const updated = [event, ...state.history].slice(0, 50); // Keep last 50
    try { localStorage.setItem('ph_history_v3', JSON.stringify(updated)); } catch(e){}
    return { history: updated };
  }),

  // Initialization Protocol
  initializeStore: () => {
    try {
      const savedVault = JSON.parse(localStorage.getItem('ph_vault_v3')) || [];
      const savedHistory = JSON.parse(localStorage.getItem('ph_history_v3')) || [];
      const savedAnim = JSON.parse(localStorage.getItem('ph_anim_v3')) || { intensity: 100, reduced: false, cinematic: true };
      
      set({ 
        vault: savedVault, 
        history: savedHistory, 
        strictness: 'autonomous', 
        singularityActive: false, 
        omegaActive: false, 
        evolutionLevel: 'S+++++',
        animationIntensity: savedAnim.intensity,
        reducedMotion: savedAnim.reduced,
        cinematicMode: savedAnim.cinematic
      });
    } catch (e) {
      console.warn("Evo Store Initialization Warning: Storage inaccessible.");
    }
  }
}));
