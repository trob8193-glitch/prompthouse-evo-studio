import { create } from 'zustand';
import { Log } from './core/autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — SOVEREIGN STORE (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * The primary state engine for the studio. Manages all sentient
 * agent states, mission status, and visual resonance metrics.
 */

export const useSovereignStore = create((set, get) => ({
  // Studio State
  status: 'OMNIPOTENT',
  iq_baseline: 165.0,
  activeTab: 'orchard',
  resonance: 0.99,

  // Bot Roster
  bots: [],
  activeBot: null,

  // Mission State
  missions: [],
  activeMission: null,

  // Actions
  setActiveTab: (tab) => {
    Log.info(`🧿 [Store] Switching Tab: ${tab}`);
    set({ activeTab: tab });
  },

  addMission: (mission) => {
    set((state) => ({ missions: [...state.missions, mission] }));
  },

  setBots: (bots) => {
    set({ bots });
    if (bots.length > 0 && !get().activeBot) {
      set({ activeBot: bots[0] });
    }
  },

  updateResonance: (val) => set({ resonance: val })
}));
