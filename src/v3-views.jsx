import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignStore } from './store.js';

// Restored View Imports
import SovereignChat from './features/SovereignChat';
import RareCapabilities from './features/RareCapabilities';
import EvoEyesView from './features/EvoEyesView';

/**
 * PH EVO STUDIO — V3 MODULAR VIEWS (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Dynamic modular view engine. Renders the tactical, intelligence,
 * and history modules based on the active mission state.
 */

export default function V3Views() {
  const { activeTab } = useSovereignStore();

  return (
    <div className="h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {activeTab === 'chat' && <SovereignChat />}
          {activeTab === 'capabilities' && <RareCapabilities />}
          {activeTab === 'vision' && <EvoEyesView />}
          
          {activeTab === 'orchard' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">The Orchard</div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Connectome Active • Syncing Forest</div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export const BotStageView = () => {
  const metrics = useSovereignStore((s) => s.metrics);
  return (
    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Bot Execution Stage</h2>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-black/40 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Active Thread</div>
          <div className="text-lg font-mono text-indigo-400">foundry_orchestrator.js:L127</div>
        </div>
        <div className="p-6 bg-black/40 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Cycles Completed</div>
          <div className="text-2xl font-black text-white">{metrics?.uptime ? Math.floor(metrics.uptime / 60) : 0}</div>
        </div>
      </div>
      <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
        <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">Reality Log</div>
        <div className="text-xs text-indigo-300/70 font-medium">System state synchronized with Bridge 127.0.0.1:3001. No simulation detected.</div>
      </div>
    </div>
  );
};

export const MasterPromptVaultView = () => {
  const [isSyncing, setIsSyncing] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Master Prompt Vault</h2>
        <div className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${isSyncing ? 'bg-indigo-900/50 text-indigo-400 border-indigo-500/30 animate-pulse' : 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30'}`}>
          {isSyncing ? 'SYNCING...' : 'VERIFIED'}
        </div>
      </div>
      <div className="space-y-4">
        {['System Archetype', 'Nuclear Truth Gate', 'Evo Core Manifest', 'Logic Density Auditor'].map((item, idx) => (
          <div key={item} className="flex items-center justify-between p-4 bg-black/20 border border-slate-800/50 rounded-xl hover:border-indigo-500/30 transition-colors cursor-pointer group">
            <span className="text-slate-400 font-bold text-sm group-hover:text-white transition-colors">{item}</span>
            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${isSyncing && idx === 0 ? 'bg-indigo-900/50 text-indigo-400 animate-pulse' : 'bg-emerald-900/50 text-emerald-400'}`}>
              {isSyncing && idx === 0 ? 'LOADING' : 'LOCKED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AgentCtlView = () => {
  const bridgeData = useSovereignStore((s) => s.bridgeData);
  return (
    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Agent Control Deck</h2>
      <div className="p-6 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-500/20 mb-6">
        <div className="text-xs text-indigo-100 font-bold uppercase mb-1">Sovereign IQ</div>
        <div className="text-4xl font-black text-white">{(bridgeData?.iq_metrics?.baseline / 1000000 || 2.0).toFixed(1)}M</div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <span className="text-xs text-emerald-400 font-bold">Autonomous Builder</span>
          <span className="text-[10px] text-emerald-500 font-black uppercase">Active</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg opacity-50">
          <span className="text-xs text-slate-400 font-bold">NightForge Daemon</span>
          <span className="text-[10px] text-slate-500 font-black uppercase">Idle</span>
        </div>
      </div>
    </div>
  );
};

export const BotRosterView = () => {
  return (
    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl">
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Bot Roster</h2>
      <div className="grid grid-cols-3 gap-4">
        {['Foundry', 'Architect', 'Sentinel'].map((bot) => (
          <div key={bot} className="aspect-square bg-black/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 mb-3 border border-slate-700" />
            <div className="text-[10px] text-white font-black uppercase tracking-wider">{bot}</div>
            <div className="text-[8px] text-slate-500 font-bold mt-1 uppercase">v1.0.4</div>
          </div>
        ))}
      </div>
    </div>
  );
};

