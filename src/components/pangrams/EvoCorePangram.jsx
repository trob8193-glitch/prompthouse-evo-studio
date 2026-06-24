import React from 'react';
import { Activity, Zap } from 'lucide-react';

export default function EvoCorePangram() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#020205]/90 rounded-3xl border border-[#00f0ff]/20 overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(0,240,255,0.05)]">
      {/* Core Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full border border-[#00f0ff]/10 animate-[spin_10s_linear_infinite] border-dashed" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-[#00f0ff]/20 animate-[spin_7s_linear_infinite_reverse]" />
        <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-[#00f0ff]/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] animate-pulse" />
      </div>
      
      {/* Central Core */}
      <div className="relative z-10 flex flex flex-col gap-4 items-center">
        <div className="w-24 h-24 bg-[#00f0ff]/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-[#00f0ff]/50 shadow-[0_0_40px_rgba(0,240,255,0.4)]">
          <Zap size={40} color="#00f0ff" className="animate-pulse" />
        </div>
        <div className="mt-6 font-black text-white tracking-[0.3em] uppercase text-sm drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
          Evo Core Online
        </div>
        <div className="mt-2 text-[#b4b4c4] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
          <Activity size={12} color="#00f0ff" /> 99.9% Quantum Efficiency
        </div>
      </div>

      {/* Telemetry Spokes */}
      <div className="absolute top-8 left-8 p-4 glass-extreme rounded-3xl border border-[#00f0ff]/30">
        <div className="text-[9px] text-[#00f0ff] font-bold tracking-widest uppercase mb-1">Synapse Load</div>
        <div className="text-xl font-black text-white">42.8 TH/z</div>
      </div>
      <div className="absolute bottom-8 right-8 p-4 glass-extreme rounded-3xl border border-[#00f0ff]/30">
        <div className="text-[9px] text-[#00f0ff] font-bold tracking-widest uppercase mb-1">Memory Matrix</div>
        <div className="text-xl font-black text-white">100% Bound</div>
      </div>
    </div>
  );
}
