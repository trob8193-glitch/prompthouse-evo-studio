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
  health_status: { score: 1.0, driftCount: 0, lastScan: null },
  is_healing: false,
  active_state: {}, 
  is_hud_open: false,
  active_mode: 'PATH_OF_REALITY',
  subjectKey: (typeof localStorage !== 'undefined') ? (localStorage.getItem('ph_evo_client_id') || 'unidentified_subject') : 'terminal_subject',

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
    
    // Physical Push to Ledger via Bridge
    try {
      await fetch('http://127.0.0.1:3001/api/evolution/log-realization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (e) {
      console.warn('[WitnessStore] Failed to anchor realization to ledger:', e.message);
    }
  },

  updateTruth: (filePath, report) => set((state) => ({
    truth_scores: { ...state.truth_scores, [filePath]: report }
  })),

  runDoctorScan: async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/doctor/scan');
      const data = await res.json();
      if (data.success) {
        set({ health_status: { 
          score: 1.0 - (data.scanResults.driftCount * 0.1), 
          driftCount: data.scanResults.driftCount,
          lastScan: data.timestamp 
        }});
      }
      return data;
    } catch (err) {
      console.error('[WitnessStore] Scan failed:', err);
      return { success: false };
    }
  },

  triggerEvoDoctor: async (targetFiles = []) => {
    set({ is_healing: true });
    try {
      const res = await fetch('http://127.0.0.1:3001/api/doctor/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetFiles })
      });
      const data = await res.json();
      set({ is_healing: false });
      get().runDoctorScan(); // Refresh after healing
      return data;
    } catch (err) {
      set({ is_healing: false });
      return { success: false };
    }
  },

  triggerEvoEngineer: async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/engineer/evolve', { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  triggerEvoUIEngineer: async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/ui-engineer/evolve', { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  snapshotState: (storeState) => set({ active_state: storeState }),

  toggleHud: () => set((state) => ({ is_hud_open: !state.is_hud_open })),

  setMode: (mode) => set({ active_mode: mode })
}));
