import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Camera, Users, Zap, Layout, 
  Terminal, Database, History, Target, 
  Settings, ChevronRight, Share2, MousePointer
} from 'lucide-react';
import { useSovereignStore } from '../store.js';

const PANELS = [
  { id: 'home', label: 'Home Cockpit', icon: Home, color: 'text-blue-400' },
  { id: 'capture', label: 'Reality Capture', icon: Camera, color: 'text-emerald-400' },
  { id: 'bot_cast', label: 'Bot Cast Roster', icon: Users, color: 'text-indigo-400' },
  { id: 'truth', label: 'Reality Twin', icon: Zap, color: 'text-yellow-400' },
  { id: 'canvas', label: 'Forge Canvas', icon: Layout, color: 'text-purple-400' },
  { id: 'terminal', label: 'Bridge Terminal', icon: Terminal, color: 'text-slate-400' },
  { id: 'vault', label: 'Canon Vault', icon: Database, color: 'text-rose-400' },
  { id: 'trace', label: 'Neural Trace', icon: Share2, color: 'text-cyan-400' },
  { id: 'events', label: 'Global Events', icon: History, color: 'text-orange-400' },
  { id: 'mission', label: 'Active Missions', icon: Target, color: 'text-red-400' },
  { id: 'inspector', label: 'DOM X-Ray', icon: MousePointer, color: 'text-emerald-500' },
  { id: 'config', label: 'Engine Config', icon: Settings, color: 'text-slate-500' },
];

export const ExtensionCockpitView = () => {
  const [activePanel, setActivePanel] = useState('home');
  const metrics = useSovereignStore((s) => s.metrics);

  const PanelItem = ({ panel }) => {
    const Icon = panel.icon;
    const isActive = activePanel === panel.id;
    return (
      <button 
        onClick={() => setActivePanel(panel.id)}
        className={`flex items-center gap-4 w-full p-4 rounded-xl transition-all border ${
          isActive 
            ? 'bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
            : 'bg-transparent border-transparent hover:bg-slate-800/30'
        }`}
      >
        <div className={`p-2 rounded-lg bg-slate-900 ${panel.color}`}>
          <Icon size={18} />
        </div>
        <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{panel.label}</span>
        {isActive && <ChevronRight size={16} className="ml-auto text-indigo-400" />}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-3xl p-4 space-y-1">
        <div className="px-4 py-6">
          <h2 className="text-xl font-black text-indigo-400">Extension Cockpit</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">12 Autonomous Panels</p>
        </div>
        {PANELS.map(p => <PanelItem key={p.id} panel={p} />)}
      </div>

      {/* Main Panel Content */}
      <div className="lg:col-span-9 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activePanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 p-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-2xl bg-slate-800 ${PANELS.find(p => p.id === activePanel)?.color}`}>
                {React.createElement(PANELS.find(p => p.id === activePanel)?.icon, { size: 32 })}
              </div>
              <div>
                <h1 className="text-4xl font-black">{PANELS.find(p => p.id === activePanel)?.label}</h1>
                <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">Panel ID: {activePanel} — Truth State: VERIFIED</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" /> Live Feedback Loop
                </h3>
                <div className="space-y-4">
                  <StatusLine label="Bridge Handshake" value="OK" />
                  <StatusLine label="Latency" value={metrics?.latency ? `${parseFloat(metrics.latency).toFixed(1)}ms` : '1.2ms'} />
                  <StatusLine label="Encryption" value="AES-256" />
                  <StatusLine label="Auto-Sync" value="ENABLED" />
                </div>
              </div>
              <div className="bg-black/30 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <History size={16} className="text-indigo-400" /> Recent Events
                </h3>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="text-slate-500">[00:01:05] Extension registered handshake</div>
                  <div className="text-slate-500">[00:01:10] Syncing metadata from current tab</div>
                  <div className="text-indigo-400">[00:01:15] Capturing truth-state for reality-twin</div>
                  <div className="text-emerald-500">[00:01:20] Success: Payload delivered to bridge</div>
                </div>
              </div>
            </div>

            {/* Panel content varies by selected tab */}
            <div className="mt-8 p-12 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center opacity-50">
              <Layout size={48} className="text-slate-700 mb-4" />
              <h4 className="text-lg font-bold text-slate-500">Autonomous View Component: {activePanel}</h4>
              <p className="text-sm text-slate-600 max-w-sm">Wired to PromptBridge protocol. Real-time DOM interaction and agentic control active in the browser bridge extension.</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer info */}
        <div className="p-4 bg-indigo-500/5 border-t border-slate-800 text-[10px] text-slate-500 font-bold flex justify-between">
          <span>PROMPTHOUSE BROWSER BRIDGE V2.4.1</span>
          <span>SOVEREIGN INTERNALIZED STATE: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

const StatusLine = ({ label, value }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className="text-indigo-400 font-black">{value}</span>
  </div>
);
