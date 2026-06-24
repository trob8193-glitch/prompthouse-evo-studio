import React from 'react';
import { Layers } from 'lucide-react';

export default function HolographicDeckParagram() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#020617] rounded-3xl border border-[#4ade80]/20 overflow-hidden flex items-center justify-center">
      {/* Background blobs for blur effect */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#4ade80]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#00f0ff]/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-2xl perspective-[1000px]">
        {/* Card 3 (Back) */}
        <div className="absolute top-0 left-12 right-12 h-64 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 transform translate-y-8 -translate-z-20 scale-90 opacity-50" />
        
        {/* Card 2 (Middle) */}
        <div className="absolute top-0 left-6 right-6 h-64 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 transform translate-y-4 -translate-z-10 scale-95 opacity-80" />
        
        {/* Card 1 (Front) */}
        <div className="relative h-64 bg-black/40 backdrop-blur-2xl rounded-2xl border border-[#4ade80]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 flex flex flex-col gap-4 justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Layers color="#4ade80" />
              <h3 className="text-white font-black tracking-widest uppercase">Holo-Deck</h3>
            </div>
            <span className="px-3 py-1 bg-[#4ade80]/10 text-[#4ade80] text-[10px] rounded-full border border-[#4ade80]/30 font-bold uppercase tracking-widest">Active</span>
          </div>
          
          <div>
            <div className="text-4xl font-black text-white mb-2">Layered Reality</div>
            <p className="text-gray-400 text-sm">Glassmorphic occlusion handles depth perception.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
