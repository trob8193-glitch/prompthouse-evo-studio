import { create } from 'zustand';

import { Log } from '../core/autonomy/SovereignLogger.js';
import { safeFetchBridge } from '../config/bridge-config.js';

/**
 * PH EVO STUDIO — EVO STUDIO WITNESS STORE
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
    const payload = { ...p, subjectKey };
    set((state) => ({ 
      prompts: [payload, ...state.prompts].slice(0, 50) 
    }));
    safeFetchBridge('/api/witness/telemetry', {
      method: 'POST',
      body: JSON.stringify({ type: 'PROMPT', subjectKey, payload })
    }).catch(e => console.warn('Failed to persist prompt telemetry:', e));
  },

  logTrace: (t) => {
    const subjectKey = get().subjectKey;
    const payload = { ...t, subjectKey };
    set((state) => ({ 
      traces: [payload, ...state.traces].slice(0, 100) 
    }));
    safeFetchBridge('/api/witness/telemetry', {
      method: 'POST',
      body: JSON.stringify({ type: 'TRACE', subjectKey, payload })
    }).catch(e => console.warn('Failed to persist trace telemetry:', e));
  },

  logRealization: async (realization) => {
    const { subjectKey } = get();
    // EDGE: Synchronize realization with the Evo Studio Ledger
    const entry = {
      type: 'COGNITIVE_REALIZATION',
      subjectKey,
      realization,
      timestamp: Date.now()
    };
    
    // Physical Push to Ledger via Bridge
    try {
      await safeFetchBridge('/api/evolution/log-realization', {
        method: 'POST',
        body: JSON.stringify(entry)
      });
    } catch (e) {
      console.warn('[WitnessStore] Failed to anchor realization to ledger:', e.message);
    }
  },

  updateTruth: (filePath, report) => {
    const subjectKey = get().subjectKey;
    set((state) => ({
      truth_scores: { ...state.truth_scores, [filePath]: report }
    }));
    safeFetchBridge('/api/witness/telemetry', {
      method: 'POST',
      body: JSON.stringify({ type: 'TRUTH_SCORE', subjectKey, payload: { filePath, report } })
    }).catch(e => console.warn('Failed to persist truth score telemetry:', e));
  },

  fetchHistory: async () => {
    try {
      const [promptsRes, tracesRes, truthRes] = await Promise.all([
        safeFetchBridge('/api/witness/telemetry?type=PROMPT'),
        safeFetchBridge('/api/witness/telemetry?type=TRACE&limit=100'),
        safeFetchBridge('/api/witness/telemetry?type=TRUTH_SCORE')
      ]);
      
      const truth_scores = {};
      if (truthRes?.data?.logs) {
        truthRes.data.logs.forEach(log => {
          if (log.filePath && log.report) truth_scores[log.filePath] = log.report;
        });
      }

      set({ 
        prompts: promptsRes?.data?.logs || [],
        traces: tracesRes?.data?.logs || [],
        truth_scores: Object.keys(truth_scores).length > 0 ? truth_scores : get().truth_scores
      });
    } catch (e) {
      console.warn('[WitnessStore] Failed to fetch history:', e.message);
    }
  },

  runDoctorScan: async () => {
    try {
      const res = await safeFetchBridge('/api/doctor/scan');
      const data = res.data;
      if (res.ok && data?.success) {
        set({ health_status: { 
          score: 1.0 - (data.scanResults.driftCount * 0.1), 
          driftCount: data.scanResults.driftCount,
          lastScan: data.timestamp 
        }});
      }
      return data;
    } catch (err) {
      Log.error('[WitnessStore] Scan failed:', err);
      return { success: false };
    }
  },

  triggerEvoDoctor: async (targetFiles = []) => {
    set({ is_healing: true });
    try {
      const res = await safeFetchBridge('/api/doctor/heal', {
        method: 'POST',
        body: JSON.stringify({ targetFiles })
      });
      const data = res.data;
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
      const res = await safeFetchBridge('/api/engineer/evolve', { method: 'POST' });
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  triggerEvoUIEngineer: async () => {
    try {
      const res = await safeFetchBridge('/api/ui-engineer/evolve', { method: 'POST' });
      return res.data;
    } catch (err) {
      return { success: false };
    }
  },

  snapshotState: (storeState) => set({ active_state: storeState }),

  toggleHud: () => set((state) => ({ is_hud_open: !state.is_hud_open })),

  setMode: (mode) => set({ active_mode: mode })
}));
