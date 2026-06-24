import React from 'react';
import { Target } from 'lucide-react';

export default function OrbitalHUDLayout() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-black rounded-3xl border border-[#ff0055]/30 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#ff0055]/10 via-black to-black" />
      
      {/* Orbital Rings */}
      <div className="relative w-[450px] h-[450px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[#ff0055]/20 border-t-[#ff0055]/80 animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border border-white/10 border-b-white/50 animate-[spin_12s_linear_infinite_reverse]" />
        <div className="absolute inset-12 rounded-full border border-[#ff0055]/10 border-l-[#ff0055] animate-[spin_4s_linear_infinite]" />
        
        {/* Center Target */}
        <div className="relative z-10 bg-black/80 p-6 rounded-full border border-[#ff0055]/50 backdrop-blur-xl shadow-[0_0_50px_rgba(255,0,85,0.3)]">
          <Target size={48} color="#ff0055" />
        </div>
      </div>

      {/* Floating HUD Elements */}
      <div className="absolute top-10 left-10 text-[#ff0055] font-mono text-xs opacity-70">
        SYS.ORBITAL_VELOCITY = [ 34.2, 89.1, -12.4 ]<br/>
        RADAR.CONTACT = TRUE<br/>
        SHIELD.HARMONICS = STABLE
      </div>

      <div className="absolute bottom-10 right-10 text-right">
        <div className="text-[10px] text-white/50 font-bold tracking-[0.3em] uppercase">Target Lock</div>
        <div className="text-3xl font-black text-[#ff0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.8)]">100%</div>
      </div>
    </div>
  );
}
