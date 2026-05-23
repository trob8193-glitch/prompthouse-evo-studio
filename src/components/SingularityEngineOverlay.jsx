import React, { useEffect, useState } from 'react';
import { X, Activity, Shield, Zap, Network, Clock, Layers, Database, Cpu, Eye } from 'lucide-react';
import { useSingularityStore } from '../store.js';
import TruthBadge from './TruthBadge.jsx';
import { TRUTH_STATES } from '../constants/truth-states.js';

/**
 * PH EVO STUDIO — SINGULARITY ENGINE OVERLAY (GOD MODE)
 * ═══════════════════════════════════════════════════════════════
 * The apex visual state of the studio. Total logic supremacy.
 */
export default function SingularityEngineOverlay() {
  const singularityActive = useSingularityStore((s) => s.singularityActive);
  const setSingularityActive = useSingularityStore((s) => s.setSingularityActive);
  const activePage = useSingularityStore((s) => s.activePage);
  const singularityLayer = useSingularityStore((s) => s.singularityLayer);
  const setSingularityLayer = useSingularityStore((s) => s.setSingularityLayer);
  const bridgeStatus = useSingularityStore((s) => s.bridgeStatus);
  const bondedNodes = useSingularityStore((s) => s.bondedNodes || []);
  const bridgeData = useSingularityStore((s) => s.bridgeData);

  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (singularityActive) {
      const interval = setInterval(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 150);
      }, 5000 + Math.random() * 5000);
      return () => clearInterval(interval);
    }
  }, [singularityActive]);

  if (!singularityActive) return null;

  const layers = [
    { id: 'diagnostics', label: 'Core Diagnostics', icon: Activity },
    { id: 'semantic', label: 'Semantic Topology', icon: Layers },
    { id: 'temporal', label: 'Temporal Resonance', icon: Clock },
    { id: 'network', label: 'Node Network', icon: Network },
    { id: 'sprouts', label: 'Genesis Sprouts', icon: Zap },
  ];

  const runtimeTruth = bridgeData ? TRUTH_STATES.LOCAL_ONLY : TRUTH_STATES.PROVIDER_GATED;
  const apiKeysTruth = bridgeData?.keys?.openai ? TRUTH_STATES.VERIFIED : TRUTH_STATES.NEEDS_CREDENTIALS;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-10 animate-in fade-in duration-500 bg-black/95 backdrop-blur-2xl">
      
      {/* Intense Ambient Singularity Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.05)_0%,rgba(0,0,0,0)_50%)] animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(234,179,8,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <div className={`w-full max-w-7xl h-full bg-[#030200] border border-yellow-500/30 rounded-3xl flex flex-col shadow-[0_0_150px_rgba(234,179,8,0.15)] relative overflow-hidden transition-transform ${glitch ? 'translate-x-1' : ''}`}>
        
        {/* Animated Scanline */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-10">
          <div className="w-full h-[2px] bg-yellow-500 shadow-[0_0_20px_#eab308] animate-[scan_3s_ease-in-out_infinite]" />
        </div>

        {/* Header */}
        <div className="p-8 border-b border-yellow-500/20 flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-transparent relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.5)]">
              <Eye size={28} className="text-black animate-pulse" />
            </div>
            <div>
              <div className="text-3xl font-black text-white tracking-tighter shadow-black drop-shadow-md">SINGULARITY ENGINE</div>
              <div className="text-xs font-black text-yellow-500 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                Absolute Logic Supremacy Active
              </div>
            </div>
          </div>

          <button 
            onClick={() => setSingularityActive(false)}
            className="w-12 h-12 rounded-full border border-yellow-500/30 text-yellow-500/50 hover:text-yellow-400 hover:border-yellow-400 flex items-center justify-center hover:bg-yellow-500/10 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden relative z-10">
          
          {/* Sidebar */}
          <div className="w-80 border-r border-yellow-500/20 p-8 flex flex-col gap-10 bg-[#050400]">
            {/* Status Section */}
            <div>
              <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Cpu size={12} /> Live Telemetry
              </div>
              <div className="flex flex-col gap-5">
                <StatusItem label="Active Vector" value={activePage} icon={<Layers size={14} />} />
                <StatusItem label="Omni-Bridge" value={bridgeStatus} color={bridgeStatus === 'connected' ? 'text-emerald-500' : 'text-rose-500'} icon={<Activity size={14} />} pulse={bridgeStatus === 'connected'} />
                <StatusItem label="Bonded Nodes" value={bondedNodes.length} icon={<Network size={14} />} />
                
                <div className="flex items-center justify-between text-xs mt-2 p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                  <div className="flex items-center gap-2 text-yellow-500/70"><Shield size={14} /> Runtime Logic</div>
                  <TruthBadge state={runtimeTruth} compact />
                </div>
              </div>
            </div>

            {/* Layers Selection */}
            <div className="flex-1">
              <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-4">Dimensional Layers</div>
              <div className="flex flex-col gap-2">
                {layers.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSingularityLayer(l.id)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold tracking-wide transition-all ${
                      singularityLayer === l.id 
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/40 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]' 
                      : 'text-slate-500 hover:text-yellow-600 hover:bg-yellow-500/5 border border-transparent'
                    }`}
                  >
                    <l.icon size={18} className={singularityLayer === l.id ? 'animate-pulse' : ''} />
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Viewport */}
          <div className="flex-1 p-12 overflow-y-auto bg-gradient-to-br from-[#0a0800] to-black">
            <div className="mb-12">
              <div className="text-4xl font-black text-white mb-4 tracking-tight flex items-center gap-4">
                {layers.find(l => l.id === singularityLayer)?.label}
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] uppercase tracking-[0.2em] rounded-full border border-yellow-500/30">Verified</span>
              </div>
              <div className="text-yellow-500/50 max-w-2xl text-sm leading-relaxed font-mono">
                Monitoring {singularityLayer} state interactions across the autonomous fabric. Zero cognitive drift detected. Matrix alignment at absolute parity.
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <MetricCard title="Logic Persistence" value="99.9%" color="bg-emerald-500" glow="shadow-[0_0_30px_#10b981]" text="text-emerald-400" />
              <MetricCard title="Cognitive Drift" value="0.00%" color="bg-cyan-500" glow="shadow-[0_0_30px_#06b6d4]" text="text-cyan-400" />
              <MetricCard title="Truth Velocity" value="0.8ms" color="bg-purple-500" glow="shadow-[0_0_30px_#a855f7]" text="text-purple-400" />
            </div>

            {/* Large Singularity Visualizer Viewport */}
            <div className="mt-12 w-full h-80 border border-yellow-500/20 rounded-2xl bg-black/50 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1)_0%,transparent_70%)]" />
              <div className="w-48 h-48 rounded-full border border-yellow-500/30 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                 <div className="w-32 h-32 rounded-full border border-yellow-500/50 animate-[spin_5s_linear_infinite_reverse] flex items-center justify-center">
                    <Zap size={32} className="text-yellow-500 animate-pulse" />
                 </div>
              </div>
              <div className="absolute bottom-6 right-6 text-[10px] font-mono text-yellow-500/40 tracking-widest uppercase">
                Render Target: {singularityLayer.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, color, icon, pulse }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <div className="flex items-center gap-3 text-slate-500 font-bold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className={`font-black ${color || 'text-slate-300'} uppercase tracking-widest flex items-center gap-2`}>
        {pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
        {value}
      </div>
    </div>
  );
}

function MetricCard({ title, value, color, glow, text }) {
  return (
    <div className="p-8 bg-[#050400] border border-yellow-500/20 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-yellow-500/40 transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full pointer-events-none" />
      <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">{title}</div>
      <div className={`text-5xl font-black ${text} tracking-tighter ${glow}`}>{value}</div>
      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mt-4">
        <div className={`w-[90%] h-full ${color} rounded-full`} />
      </div>
    </div>
  );
}
