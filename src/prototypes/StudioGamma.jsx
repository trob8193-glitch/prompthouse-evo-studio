import React from 'react';
import { Terminal, Gamepad2, Disc, PlaySquare, X, MonitorPlay } from 'lucide-react';

export default function StudioGamma({ onBack }) {
  return (
    <div className="w-full h-screen bg-[#0a001a] text-purple-400 font-mono overflow-hidden flex-col gap-4 relative" style={{ 
      backgroundImage: 'linear-gradient(180deg, #0a001a 0%, #1a0033 100%)' 
    }}>
      {/* SYNTHWAVE GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(transparent 95%, #ff00ff 100%), linear-gradient(90deg, transparent 95%, #ff00ff 100%)',
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg) translateY(100px) translateZ(-200px)'
      }}></div>
      
      {/* SCANLINES */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-10 mix-blend-overlay" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)'
      }}></div>

      <div className="relative z-10 flex-col gap-4 h-full">
        {/* HEADER */}
        <div className="h-24 border-b-4 border-pink-500 bg-[#1a0033]/90 flex items-center justify-between px-8" style={{ boxShadow: '0 4px 20px rgba(255,0,255,0.3)' }}>
          <div className="flex items-center gap-4">
            <Gamepad2 className="text-orange-500 w-10 h-10" />
            <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-linear-to-b from-orange-400 to-pink-600 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" style={{ fontFamily: '"Impact", sans-serif' }}>
              SYNTHWAVE COMMAND
            </h1>
          </div>
          <button onClick={onBack} className="w-12 h-12 bg-pink-600 hover:bg-pink-500 text-white font-black text-xl flex items-center justify-center border-4 border-pink-400 shadow-[0_0_15px_rgba(255,0,255,0.5)] transition-colors">
            <X />
          </button>
        </div>

        <div className="flex-1 p-8 flex gap-8">
          {/* SIDEBAR */}
          <div className="w-1/4 flex-col gap-8">
            <div className="flex-1 bg-[#1a0033]/80 border-4 border-purple-500 p-6 flex-col gap-4 shadow-[0_0_30px_rgba(128,0,255,0.2)]">
              <h2 className="text-xl font-bold text-orange-400 mb-6 border-b-2 border-orange-500/50 pb-2">ROSTER.SYS</h2>
              <div className="flex-col gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-purple-900/40 border-2 border-purple-500/50 hover:bg-pink-900/40 hover:border-pink-500 cursor-pointer transition-all group">
                    <div className="w-12 h-12 bg-black border-2 border-orange-500 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,165,0,0.5)]">
                      <MonitorPlay className="text-pink-500" />
                    </div>
                    <div>
                      <div className="text-white font-bold tracking-widest text-sm">UNIT_{i}</div>
                      <div className="text-orange-400 text-xs mt-1">IDLE</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN MODULES */}
          <div className="flex-1 flex-col gap-8">
            <div className="h-1/3 flex gap-8">
              <div className="flex-1 bg-black/80 border-4 border-pink-500 p-6 shadow-[inset_0_0_20px_rgba(255,0,255,0.2)] flex-col gap-4 justify-center items-center relative overflow-hidden">
                <div className="text-pink-500 text-xl font-bold mb-2">SYSTEM LOAD</div>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-t from-purple-500 to-orange-500">42%</div>
                <div className="absolute bottom-0 left-0 w-full h-4 bg-purple-900/50"><div className="h-full bg-pink-500 w-[42%]"></div></div>
              </div>
              <div className="flex-1 bg-black/80 border-4 border-orange-500 p-6 shadow-[inset_0_0_20px_rgba(255,165,0,0.2)] flex-col gap-4 justify-center items-center">
                <div className="text-orange-500 text-xl font-bold mb-2">MODULE STATUS</div>
                <div className="text-4xl font-black text-white">OPTIMAL</div>
              </div>
            </div>
            
            {/* TERMINAL */}
            <div className="flex-1 bg-black/90 border-4 border-purple-500 p-6 flex-col gap-4">
              <div className="flex-1 font-mono text-lg text-green-400">
                <p>C:\STUDIO\CORE&gt; INIT NEURAL_NET.EXE</p>
                <p className="mt-2 text-pink-400">LOADING... [||||||||||  ] 80%</p>
                <p className="mt-4 text-purple-300">Welcome to the future. Awaiting command sequence.</p>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="text-orange-500 text-xl font-bold">&gt;</span>
                <input type="text" className="flex-1 bg-transparent border-b-2 border-orange-500 outline-none text-white text-xl font-mono uppercase" placeholder="INSERT COIN..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
