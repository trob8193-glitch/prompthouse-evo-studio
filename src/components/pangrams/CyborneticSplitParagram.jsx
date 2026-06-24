import React from 'react';
import { Columns, SplitSquareHorizontal } from 'lucide-react';

export default function CyborneticSplitParagram() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-black rounded-3xl overflow-hidden flex shadow-[0_0_50px_rgba(255,0,255,0.1)]">
      
      {/* Left Angled Panel */}
      <div 
        className="w-1/2 h-full bg-[#1a0033] relative z-10 border-r border-[#ff00ff]/50 backdrop-blur-3xl flex flex flex-col gap-4 justify-center p-12"
        style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)' }}
      >
        <div className="w-4/5">
          <div className="text-[#ff00ff] text-[10px] uppercase font-bold tracking-[0.3em] mb-4">Input Vector</div>
          <h2 className="text-3xl font-black text-white leading-tight mb-6">Asymmetric<br/>Logic Routing</h2>
          <div className="h-1 w-12 bg-[#ff00ff]" />
        </div>
      </div>

      {/* Right Angled Panel */}
      <div className="absolute inset-0 flex justify-end">
        <div 
          className="w-[60%] h-full bg-[#050010] p-12 flex flex flex-col gap-4 justify-center items-end text-right border-l border-[#00f0ff]/20"
          style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
        >
          <div className="text-[#00f0ff] text-[10px] uppercase font-bold tracking-[0.3em] mb-4">Output Vector</div>
          <div className="space-y-4 w-2/3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-3xl p-4 flex items-center justify-end gap-4 hover:bg-[#00f0ff]/10 transition-colors">
                 <span className="text-white text-sm font-bold">Node {i}</span>
                 <SplitSquareHorizontal size={18} color="#00f0ff" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Floating Icon */}
      <div className="absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 z-20 bg-black p-4 rounded-full border-2 border-white/20 shadow-2xl">
        <Columns size={32} color="#fff" />
      </div>

    </div>
  );
}
