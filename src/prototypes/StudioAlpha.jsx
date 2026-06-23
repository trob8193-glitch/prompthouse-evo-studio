import React from 'react';
import { Terminal, Cpu, Zap, Activity, Grid, Layers, X, ShieldAlert } from 'lucide-react';

export default function StudioAlpha({ onBack }) {
  return (
    <div className="w-full h-screen bg-[#050505] text-cyan-400 font-mono overflow-hidden flex-col gap-4" style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #050505 100%)' }}>
      
      {/* HEADER */}
      <div className="h-16 border-b-2 border-cyan-500/30 bg-black/80 flex items-center justify-between px-6 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
        <div className="flex items-center gap-4">
          <Zap className="text-magenta-500 animate-pulse" />
          <h1 className="text-xl font-black tracking-[0.2em] text-white" style={{ textShadow: '0 0 10px rgba(0,255,255,0.8)' }}>NEON_GENESIS // STUDIO</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-xs tracking-widest text-cyan-500/70 border-cyan-500/30 px-3 py-1 bg-cyan-900/20">
            SYS.STATUS <span className="text-green-400 font-bold animate-pulse">ONLINE</span>
          </div>
          <button onClick={onBack} className="hover:text-red-500 transition-colors">
            <X />
          </button>
        </div>
      </div>

      <div className="flex-1 flex-row overflow-hidden">
        {/* SIDEBAR: BOTS */}
        <div className="w-80 border-r-2 border-cyan-500/30 bg-black/60 p-4 flex-col gap-4 overflow-y-auto" style={{ boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.5)' }}>
          <div className="text-[10px] uppercase tracking-widest text-magenta-400 border-b border-magenta-500/30 pb-2 mb-2 flex items-center gap-2">
            <Grid size={12} /> Roster Nodes
          </div>
          
          {[1,2,3,4,5].map(i => (
            <div key={i} className="group relative border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-900/30 p-3 flex items-start gap-4 cursor-pointer transition-all hover:border-cyan-400">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              <div className="w-12 h-12 border-cyan-500/50 flex items-center justify-center bg-black relative overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                <div className="absolute inset-0 bg-cyan-500/20 animate-pulse mix-blend-screen"></div>
                <Cpu className="text-cyan-400 w-6 h-6" />
                {/* Glitch line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/50 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white tracking-widest group-hover:text-cyan-300">NODE_{i}00X</h3>
                <p className="text-[10px] text-cyan-600 mt-1">SYS_MAINTENANCE</p>
                <div className="h-1 w-full bg-cyan-950 mt-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-magenta-500 w-2/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN TERMINAL */}
        <div className="flex-1 p-6 flex-col gap-6 bg-transparent">
          
          <div className="grid grid-cols-3 gap-6 h-48">
            <div className="border-magenta-500/30 bg-magenta-950/10 p-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 text-magenta-500/30"><Activity /></div>
               <h3 className="text-[10px] uppercase tracking-widest text-magenta-400">Core Temp</h3>
               <div className="text-4xl font-black text-white mt-4 tracking-tighter">84.2°C</div>
               <p className="text-xs text-red-400 mt-2 animate-pulse">CRITICAL WARNING</p>
            </div>
            <div className="border-cyan-500/30 bg-cyan-950/10 p-4 relative">
               <div className="absolute top-0 right-0 p-2 text-cyan-500/30"><Layers /></div>
               <h3 className="text-[10px] uppercase tracking-widest text-cyan-400">Memory Allocation</h3>
               <div className="text-4xl font-black text-white mt-4 tracking-tighter">12.4 TB</div>
               <div className="w-full h-2 bg-cyan-900 mt-4"><div className="h-full bg-cyan-400 w-4/5"></div></div>
            </div>
            <div className="border-cyan-500/30 bg-cyan-950/10 p-4 relative">
               <div className="absolute top-0 right-0 p-2 text-cyan-500/30"><ShieldAlert /></div>
               <h3 className="text-[10px] uppercase tracking-widest text-cyan-400">Threat Detection</h3>
               <div className="text-4xl font-black text-white mt-4 tracking-tighter">0.00%</div>
               <p className="text-xs text-cyan-600 mt-2">ALL SYSTEMS CLEAR</p>
            </div>
          </div>

          <div className="flex-1 border-cyan-500/30 bg-black flex-col gap-4 relative shadow-[0_0_30px_rgba(0,255,255,0.05)]">
            <div className="h-8 border-b border-cyan-500/30 flex items-center px-4 gap-2 bg-cyan-950/20">
              <Terminal size={14} className="text-cyan-500" />
              <span className="text-[10px] tracking-widest text-cyan-500 uppercase">Interactive Shell</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex-col gap-2">
              <div className="text-cyan-600 text-xs">{'>'} Initializing Neural Link... OK</div>
              <div className="text-cyan-600 text-xs">{'>'} Loading Models... [100%]</div>
              <div className="text-white text-sm mt-4 bg-cyan-900/30 p-2 border-l-2 border-cyan-400 inline-block w-max">Hello, Architect. Ready for input.</div>
            </div>
            <div className="h-14 border-t border-cyan-500/30 flex items-center px-4 bg-cyan-950/10">
              <span className="text-cyan-500 font-bold mr-2">{'>'}</span>
              <input type="text" className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-cyan-800" placeholder="ENTER COMMAND..." />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
