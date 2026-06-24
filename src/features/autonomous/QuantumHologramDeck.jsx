import React from 'react';

export default function QuantumHologramDeck() {
  return (
    <div className="w-full h-full flex flex-col gap-4 gap-4 items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-void"></div>
      
      {/* 3D Holographic Projection Base */}
      <div className="absolute bottom-[-10%] w-[800px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl" style={{ transform: 'rotateX(60deg)' }}></div>
      <div className="absolute bottom-[5%] w-[400px] h-[150px] border-4 border-cyan-500/30 rounded-full" style={{ transform: 'rotateX(75deg)' }}></div>
      <div className="absolute bottom-[5%] w-[450px] h-[170px] border-cyan-500/10 rounded-full animate-spin" style={{ transform: 'rotateX(75deg)', animationDuration: '10s' }}></div>
      
      {/* Projection Beams */}
      <div className="absolute bottom-[10%] w-[100px] h-[80vh] bg-linear-to-t from-cyan-500/20 to-transparent blur-md filter mix-blend-screen"></div>

      <div className="relative z-10 flex flex-col gap-4 gap-4 items-center justify-center w-full h-full p-12">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-cyan-500 tracking-tighter mb-4 text-center anim-hologram drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">
          QUANTUM DECK
        </h1>
        <p className="text-cyan-400/80 uppercase tracking-[0.5em] text-sm font-bold mb-12">Holographic Task Projection</p>

        <div className="grid grid-cols-3 gap-12 w-full max-w-4xl mt-12">
          {['Spawn Sentinels', 'Run Diagnostics', 'Collapse Waveform'].map((action, i) => (
            <div key={i} className="flex flex-col gap-4 items-center gap-6 group cursor-pointer">
              <div className="w-32 h-32 button-orbital flex items-center justify-center transform transition-transform group-hover:-translate-y-4 group-hover:scale-110">
                <div className="w-24 h-24 rounded-full bg-black/60 border-cyan-500/30 flex items-center justify-center glass-extreme backdrop-blur-md">
                   <span className="text-3xl">✦</span>
                </div>
              </div>
              <span className="text-sm font-bold text-dim uppercase tracking-widest group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_#00f0ff] transition-all text-center">
                {action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
