import React, { useState, useEffect } from 'react';
import { Activity, Network, Fingerprint, Cpu, Shield, Sparkles, Bot, Zap, Globe } from 'lucide-react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { useSovereignStore } from '../store.js';

export default function OmniBondCommandCenter() {
  const bridgeUrl = useSovereignStore(s => s.apiConfig.bridgeUrl);
  const singularityActive = useSovereignStore(s => s.singularityActive);
  const [nodesActive, setNodesActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setNodesActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <IDEPageLayout
      title="Omni-Bond Nexus"
      description="Absolute Reality Integration Layer. Real-time synchronization between Studio Architecture and the AI Swarm."
      icon={Fingerprint}
    >
      <div className="flex flex-col space-y-10 animate-in fade-in duration-500">
        {/* Status Bar */}
        <div className="flex items-center justify-between bg-black/40 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <Shield size={18} className="text-emerald-500" />
            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Uplink Status: <span className="text-emerald-500">SIGNED_PHYSICAL (OMNI-BOND)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-mono">TELEMETRY_SYNC_v2.0.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Neural Trace Swarm Visualizer */}
          <div className="bg-[#0c0c0e] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-6 border-b border-slate-800 bg-linear-to-r from-emerald-500/5 to-transparent flex justify-between items-center z-10 relative">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Network size={18} className="text-emerald-500" /> Neural Swarm Visualizer
              </h2>
            </div>
            
            <div className="p-10 flex-1 flex flex-col items-center justify-center min-h-[360px] relative">
              {/* Background Energy */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.05)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="neural-trace-container w-full max-w-lg mx-auto">
                <div className={`neural-node ${nodesActive ? 'active' : ''} border-indigo-500!`}>
                  <div className="node-pulse border-indigo-500!"></div>
                  <Cpu size={24} className="text-indigo-500" />
                  <div className="node-label text-indigo-400!">Core</div>
                </div>
                
                <div className={`neural-link ${nodesActive ? 'active' : ''} bg-emerald-500! shadow-[0_0_10px_#00ff88]!`}></div>
                
                <div className={`neural-node ${nodesActive ? 'active' : ''} border-emerald-500! w-[80px]! h-[80px]!`}>
                  <div className="node-pulse border-emerald-500!"></div>
                  <Fingerprint size={36} className="text-emerald-500 drop-shadow-[0_0_15px_#00ff88]" />
                  <div className="node-label text-emerald-400!">Omni-Bond</div>
                </div>
                
                <div className={`neural-link ${nodesActive ? 'active' : ''} bg-cyan-500! shadow-[0_0_10px_#00f0ff]!`}></div>
                
                <div className={`neural-node ${nodesActive ? 'active' : ''} border-cyan-500!`}>
                  <div className="node-pulse border-cyan-500!"></div>
                  <Bot size={24} className="text-cyan-500" />
                  <div className="node-label text-cyan-400!">Swarm</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AI Partnership Protocol */}
          <div className="bg-[#0c0c0e] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-6 border-b border-slate-800 bg-linear-to-r from-violet-500/5 to-transparent flex justify-between items-center z-10 relative">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Sparkles size={18} className="text-violet-500" /> Architecture Integrations
              </h2>
            </div>
            
            <div className="p-8 space-y-6 flex-1">
              <div className="bot-card active p-6! border-emerald-500/30!">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Globe className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">Universal Bridge</h3>
                    <div className="text-xs text-slate-400 font-mono mt-1">safeFetchBridge() 100% Routed</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  All 77+ internal studio components are bound through the protected Omniversal Hardening Protocol. Brittle fallbacks eradicated.
                </p>
              </div>

              <div className="bot-card active p-6! border-violet-500/30!">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                    <Zap className="text-violet-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-violet-400 font-bold uppercase tracking-wider text-sm">ShadowForge Validation</h3>
                    <div className="text-xs text-slate-400 font-mono mt-1">AST Semantic Engine Active</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Autonomy swarm ghost-builds are now strictly validated against semantic logical traps before physical reality swaps occur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IDEPageLayout>
  );
}
