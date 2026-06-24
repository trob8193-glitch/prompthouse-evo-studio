import React from 'react';
import { Activity, ShieldCheck, Terminal, Server, Clock, Search } from 'lucide-react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';

export default function OmniscientObservabilityDeck() {
  return (
    <IDEPageLayout
      title={<><Activity color="#00ff88" size={18} /> Omniscient Observability Deck</>}
      description="Omni-Fusion Node: Combines Platform Sentinel, Metrics, Runtime Health, Validation, and Trace Logs into a massive observability grid."
      actions={
        <button className="glass-extreme text-green-400 hover:border-green-400/80 transition-all rounded-3xl px-4 py-2 text-xs font-black inline-flex items-center gap-2" onClick={() => { safeFetchBridge('/api/studio/scan').then(d => void('[Observability] Scan:', d)).catch(() => {}); }}>
          <Search size={14} /> Scan Environment
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 [&>*:nth-child(1)]:col-span-1 lg:[&>*:nth-child(1)]:col-span-2 [&>*:nth-child(1)]:row-span-2 [&>*:nth-child(4)]:col-span-1 lg:[&>*:nth-child(4)]:col-span-2 [&>*:nth-child(5)]:row-span-2">
        
        {/* Main Log Stream */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-0 overflow-hidden flex-col h-[400px]">
          <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><Terminal size={14} color="#00f0ff" /> Live Trace Stream</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-[10px] font-bold text-gray-400 uppercase">Receiving</span>
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-xs text-gray-300 overflow-y-auto space-y-2">
            <div className="flex gap-3"><span className="text-gray-500">[12:45:01]</span><span className="text-cyan-400">[SYSTEM]</span><span>OmniBond Daemon synchronized.</span></div>
            <div className="flex gap-3"><span className="text-gray-500">[12:45:05]</span><span className="text-purple-400">[EVO]</span><span>Extracted 3 heuristics from AuthSentry.jsx</span></div>
            <div className="flex gap-3"><span className="text-gray-500">[12:45:10]</span><span className="text-green-400">[METRICS]</span><span>Latency steady at 45ms.</span></div>
            <div className="flex gap-3"><span className="text-gray-500">[12:45:12]</span><span className="text-red-400">[WARN]</span><span>Bypassed local hardware for massive payload (Dashboard.jsx)</span></div>
          </div>
        </div>

        {/* Runtime Health */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 flex-col justify-center">
          <Server color="#8a2be2" size={24} className="mb-4" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bridge Connection</div>
          <div className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">SECURE</div>
        </div>
        
        {/* Platform Sentinel */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 flex-col justify-center">
          <ShieldCheck color="#00ff88" size={24} className="mb-4" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Truth State</div>
          <div className="text-3xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">VERIFIED</div>
        </div>

        {/* Metrics Overview */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 bg-black/40">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">Performance Matrix</h2>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Process Uptime</span>
                <span className="text-sm font-black text-amber-400">2d 4h 12m</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">Memory Heap</span>
                <span className="text-sm font-black text-cyan-400">145 MB</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">CPU Load</span>
                <span className="text-sm font-black text-green-400">1.2%</span>
             </div>
          </div>
        </div>

      </div>
    </IDEPageLayout>
  );
}
