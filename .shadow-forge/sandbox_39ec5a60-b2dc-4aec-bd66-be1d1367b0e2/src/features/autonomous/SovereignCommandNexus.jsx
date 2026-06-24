import React, { useState } from 'react';
import { getBridgeUrl } from '../../lib/api/config.js';

export default function SovereignCommandNexus() {
  return (
    <div className="w-full h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-black text-neon-cyan tracking-tighter uppercase flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse-slow shadow-[0_0_15px_#00f0ff]"></span>
            Sovereign Command Nexus
          </h2>
          <p className="text-sm text-dim tracking-widest uppercase mt-1">Global Overmind Control</p>
        </div>
        <div className="glass-extreme px-6 py-3 rounded-full flex items-center gap-4 border-neon-glow">
          <span className="text-xs font-bold text-white uppercase tracking-widest">Nexus Status</span>
          <span className="text-neon-cyan font-mono text-lg">ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* Core Node */}
        <div className="col-span-1 md:col-span-2 glass-extreme rounded-3xl p-8 relative overflow-hidden flex-col justify-between anim-hologram">
          <div className="absolute inset-0 bg-grid-scan opacity-20 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Central Node Uplink</h3>
            <p className="text-dim text-sm max-w-md">The master routing interface. All localized agent thoughts and remote LLM tethers pass through this quantum intersection.</p>
          </div>
          
          <div className="relative z-10 flex items-center justify-center py-12">
            <div className="w-48 h-48 rounded-full border-dashed border-cyan-500/50 flex items-center justify-center animate-spin" style={{ animationDuration: '10s' }}>
              <div className="w-32 h-32 rounded-full bg-cyan-900/30 border flex items-center justify-center border-neon-glow" style={{ animationDirection: 'reverse', animationDuration: '5s' }}>
                <div className="w-16 h-16 rounded-full bg-cyan-400 shadow-[0_0_30px_#00f0ff] animate-pulse-slow"></div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-end">
            <div className="flex gap-4">
              <button className="button-orbital px-8 py-3 text-white font-bold tracking-wider text-sm" onClick={() => { fetch(`${getBridgeUrl()}/api/evolution/kill-switch/engage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Manual nexus wipe' }) }).catch(() => {}); }}>INITIATE WIPE</button>
              <button className="glass-extreme px-8 py-3 text-neon-cyan font-bold tracking-wider text-sm border-neon-glow hover:bg-cyan-900/20 transition-all" onClick={() => { fetch(`${getBridgeUrl()}/status`).then(r => r.json()).then(d => console.log('[Nexus] Route traffic check:', d)).catch(() => {}); }}>ROUTE TRAFFIC</button>
            </div>
            <div className="text-right">
              <div className="text-xs text-dim uppercase">Throughput</div>
              <div className="text-2xl font-mono text-neon-cyan">84.2 TB/s</div>
            </div>
          </div>
        </div>

        {/* Side panels */}
        <div className="col-span-1 flex-col gap-6">
          <div className="glass-extreme rounded-3xl p-6 flex-1 relative overflow-hidden border-neon-glow border-t-4 border-t-cyan-400">
             <h3 className="text-sm font-bold text-dim uppercase tracking-widest mb-4">Active Tethers</h3>
             <div className="space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-3xl bg-black/40 border-white/5 hover:border-cyan-500/30 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></div>
                     <span className="text-sm text-white font-mono">Tether-00{i}</span>
                   </div>
                   <span className="text-xs text-cyan-400">Stable</span>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="glass-extreme rounded-3xl p-6 flex-1 bg-linear-to-br from-indigo-900/20 to-purple-900/20">
             <h3 className="text-sm font-bold text-neon-violet uppercase tracking-widest mb-4">Resilience Core</h3>
             <div className="h-full flex-col gap-4 items-center justify-center">
               <div className="text-5xl font-black text-neon-violet mb-2">99.9%</div>
               <div className="text-xs text-dim uppercase">Singularity Integrity</div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
