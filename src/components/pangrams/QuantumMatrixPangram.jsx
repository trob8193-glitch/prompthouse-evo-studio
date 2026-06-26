import React from 'react';
import { Box } from 'lucide-react';

export default function QuantumMatrixPangram() {
  const cells = Array.from({ length: 64 });

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#0a0a1a] rounded-3xl border border-[#0ff]/30 overflow-hidden perspective-[1000px]">
      <div className="absolute inset-0 bg-linear-to-t from-black to-transparent z-10 pointer-events-none" />
      
      <div 
        className="grid grid-cols-8 gap-2 p-12 h-[800px] -translate-y-1/4"
        style={{ transform: 'rotateX(60deg) scale(1.5)' }}
      >
        {cells.map((_, i) => (
          <div 
            key={i} 
            className="bg-[#0ff]/5 border border-[#0ff]/20 rounded-md transition-all duration-1000 hover:bg-[#0ff]/40 hover:scale-110 cursor-pointer"
            style={{ 
              height: '40px',
              animation: `pulse ${((globalThis.crypto?crypto.getRandomValues(new Uint32Array(1))[0]/4294967295:Date.now()%1000/1000)) * 4 + 2}s infinite alternate`
            }}
          />
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
        <div className="bg-black/50 p-6 rounded-2xl border border-[#0ff]/50 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,255,0.2)]">
          <Box size={40} color="#0ff" className="mx-auto mb-4" />
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2">Quantum Matrix</h2>
          <p className="text-[#0ff] text-xs font-mono">DIMENSION: Z-INDEX MULTIPLEXING</p>
        </div>
      </div>
    </div>
  );
}
