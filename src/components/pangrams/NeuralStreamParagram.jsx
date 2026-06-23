import React from 'react';
import { Cpu, Terminal } from 'lucide-react';

export default function NeuralStreamParagram() {
  const streams = Array.from({ length: 12 });

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#000505] rounded-3xl border border-[#00ffcc]/20 overflow-hidden flex shadow-[0_0_40px_rgba(0,255,204,0.05)]">
      {/* Background Matrix Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 204, .3) 25%, rgba(0, 255, 204, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 204, .3) 75%, rgba(0, 255, 204, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 204, .3) 25%, rgba(0, 255, 204, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 204, .3) 75%, rgba(0, 255, 204, .3) 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }} />
      
      {/* Neural Streams */}
      <div className="flex-1 flex justify-between px-8 py-0 relative z-10">
        {streams.map((_, i) => (
          <div key={i} className="h-full w-px bg-linear-to-b from-transparent via-[#00ffcc]/50 to-transparent relative">
            <div 
              className="absolute w-1.5 h-16 bg-[#00ffcc] blur-[2px] rounded-full left-[-2.5px]" 
              style={{ top: `${Math.random() * 100}%`, animation: `pulse ${2 + Math.random() * 2}s infinite` }}
            />
          </div>
        ))}
      </div>

      {/* Foreground HUD */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-end z-20 bg-linear-to-t from-[#000505] to-transparent">
        <div className="glass-extreme p-6 rounded-2xl border border-[#00ffcc]/30 backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Terminal size={16} color="#00ffcc" />
            <span className="text-xs font-black text-[#00ffcc] uppercase tracking-[0.2em]">Data Stream</span>
          </div>
          <div className="text-white font-mono text-sm opacity-80">
            &gt; Neural net synced<br/>
            &gt; Awaiting logic parameters...
          </div>
        </div>

        <div className="glass-extreme p-6 rounded-2xl border border-[#00ffcc]/30 backdrop-blur-2xl flex flex-col items-end">
          <Cpu size={24} color="#00ffcc" className="mb-2" />
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Processors</div>
          <div className="text-2xl font-black text-white">ACTIVE</div>
        </div>
      </div>
    </div>
  );
}
