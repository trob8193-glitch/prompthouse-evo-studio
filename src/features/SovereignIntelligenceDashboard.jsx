import React, { useState } from 'react';
import { Eye, Clock, Shield, Terminal, Settings, Zap } from 'lucide-react';
import EvoEyesView from './EvoEyesView';
import TemporalTraceView from './TemporalTraceView';

/**
 * PH EVO STUDIO — SOVEREIGN INTELLIGENCE DASHBOARD (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * The primary UI hub of the foundry. Integrates all autonomous 
 * vision and history processors into a single, high-density 
 * command interface.
 */

const SovereignIntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState('eyes');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-mono">
      {/* Sovereign Navigation */}
      <nav className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter">PH_EVO_STUDIO</h1>
            <p className="text-[10px] text-amber-500/80 font-bold tracking-widest uppercase">Omnipotent Baseline Active</p>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { id: 'eyes', icon: Eye, label: 'EVO_EYES' },
            { id: 'trace', icon: Clock, label: 'TEMPORAL_TRACE' },
            { id: 'deck', icon: Terminal, label: 'COMMAND_DECK' },
            { id: 'omega', icon: Zap, label: 'OMEGA_FOUNDRY' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 border ${
                activeTab === tab.id 
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-transparent border-transparent hover:bg-slate-800 text-slate-400'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-[11px] font-bold tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Settings size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
        </div>
      </nav>

      {/* Main Vision Portal */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'eyes' && <EvoEyesView />}
        {activeTab === 'trace' && <TemporalTraceView />}
        {activeTab === 'deck' && (
          <div className="p-20 text-center opacity-50 border-2 border-dashed border-slate-800 rounded-xl">
             <Terminal size={48} className="mx-auto mb-4" />
             <p className="text-sm font-bold tracking-widest">COMMAND_DECK_INITIALIZING...</p>
          </div>
        )}
        {activeTab === 'omega' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 bg-amber-500/5 p-6 rounded-xl border border-amber-500/20 text-center">
              <Zap size={32} className="text-amber-500 mx-auto mb-2" />
              <h2 className="text-xl font-black mb-1">SINGULARITY_CORE_ONLINE</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">The foundry is now operating at maximum logic density. All WebWevo background threads are synchronized.</p>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="p-2 px-4 border-t border-slate-800 bg-slate-900/80 text-[10px] flex justify-between items-center text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> SYSTEM_OK</span>
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> SHADOW_PROTOCOL_ACTIVE</span>
        </div>
        <div className="flex gap-4 font-bold">
          <span className="text-slate-600">RESONANCE: 0.9997</span>
          <span className="text-amber-500/50">IQ: 2,450,000</span>
        </div>
      </footer>
    </div>
  );
};

export default SovereignIntelligenceDashboard;
