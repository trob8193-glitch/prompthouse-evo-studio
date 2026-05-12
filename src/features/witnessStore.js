import { create } from 'zustand';

/**
 * PH EVO STUDIO — SOVEREIGN WITNESS STORE
 * ═══════════════════════════════════════════════════════════════
 * Central hub for real-time telemetry: prompts, traces, truth scores.
 */

export const useWitnessStore = create((set, get) => ({
  prompts: [], // { id, timestamp, payload, response, subjectKey }
  traces: [],  // { id, path, status, timestamp, subjectKey }
  truth_scores: {}, // { file_path: { score, violations } }
  active_state: {}, 
  is_hud_open: false,
  active_mode: 'PATH_OF_REALITY',
  subjectKey: localStorage.getItem('ph_evo_client_id') || 'unidentified_subject',

  logPrompt: (p) => {
    const subjectKey = get().subjectKey;
    set((state) => ({ 
      prompts: [{ ...p, subjectKey }, ...state.prompts].slice(0, 50) 
    }));
  },

  logTrace: (t) => {
    const subjectKey = get().subjectKey;
    set((state) => ({ 
      traces: [{ ...t, subjectKey }, ...state.traces].slice(0, 100) 
    }));
  },

  logRealization: async (realization) => {
    const { subjectKey } = get();
    // EDGE: Synchronize realization with the Sovereign Ledger
    const entry = {
      type: 'COGNITIVE_REALIZATION',
      subjectKey,
      realization,
      timestamp: Date.now()
    };
    
    // Physical Push to Ledger (via bridge or internal instance)
    
  },

  updateTruth: (filePath, report) => set((state) => ({
    truth_scores: { ...state.truth_scores, [filePath]: report }
  })),

  snapshotState: (storeState) => set({ active_state: storeState }),

  toggleHud: () => set((state) => ({ is_hud_open: !state.is_hud_open })),

  setMode: (mode) => set({ active_mode: mode })
}));
