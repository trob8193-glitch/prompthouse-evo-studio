import React, { useState } from 'react';
import { Palette, Sparkles, Layout, Type, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeEvolutionDashboard() {
  const [activeTheme, setActiveTheme] = useState('cyber_glass');

  const themes = [
    { id: 'cyber_glass', name: 'Cyber Glass', colors: ['#00f0ff', '#ff0055', '#050914'] },
    { id: 'monochrome_void', name: 'Void Mono', colors: ['#ffffff', '#888888', '#000000'] },
    { id: 'synthwave', name: 'Synthwave', colors: ['#f9a826', '#ff007f', '#2b0f4c'] },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-400 to-rose-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Theme Evolution</h2>
            <p className="text-xs text-gray-500">Autonomous UI Aesthetic Generation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20 cursor-pointer">
          <Sparkles size={14} /> Synthesize New
        </div>
      </div>

      <div className="flex-1 p-6 flex gap-6 overflow-hidden">
        {/* Theme List */}
        <div className="w-64 flex flex-col gap-3">
          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Generated Schemes</h3>
          {themes.map(t => (
            <div 
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${activeTheme === t.id ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-black/40 border-[rgba(255,255,255,0.05)] hover:border-orange-500/30'}`}
            >
              <div className="text-sm font-bold text-gray-200 mb-2">{t.name}</div>
              <div className="flex gap-2">
                {t.colors.map(c => (
                  <div key={c} className="w-6 h-6 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: c }}></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Live Preview Pane */}
        <div className="flex-1 bg-black/60 border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-[0.03]"></div>
          
          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 z-10 flex items-center gap-2">
            <Layout size={12} /> Component Preview Matrix
          </h3>
          
          <div className="flex-1 flex flex-col items-center justify-center z-10 gap-8">
            {/* Sample Dashboard Card */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[40px] rounded-full pointer-events-none"></div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                   <Droplets size={20} />
                 </div>
                 <div>
                   <div className="text-white font-bold text-lg">Sample Interface</div>
                   <div className="text-orange-200/60 text-xs">Aesthetic parameters active</div>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <div className="h-2 bg-white/10 rounded-full w-full"></div>
                 <div className="h-2 bg-white/10 rounded-full w-4/5"></div>
                 <div className="h-2 bg-white/10 rounded-full w-5/6"></div>
               </div>
               
               <div className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors text-center cursor-pointer">
                 Interactive Element
               </div>
            </div>
            
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                 <Type size={14} /> Inter, sans-serif
               </div>
               <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                 <Layout size={14} /> Rounded-2xl (16px)
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
