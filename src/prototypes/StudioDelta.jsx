import React from 'react';
import { Hexagon, Network, Activity, Globe, X } from 'lucide-react';

export default function StudioDelta({ onBack }) {
  return (
    <div className="w-full h-screen bg-[#02110c] text-emerald-400 font-sans overflow-hidden flex-col gap-4 relative" style={{ 
      backgroundImage: 'radial-gradient(ellipse at center, #04241a 0%, #010a07 100%)' 
    }}>
      
      {/* ORGANIC BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[100px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-900/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 flex-col h-full p-6 gap-6">
        
        {/* HEADER */}
        <div className="h-20 bg-[#051c14]/60 backdrop-blur-md rounded-[40px] border-emerald-500/20 flex items-center justify-between px-8 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-950 rounded-full flex items-center justify-center border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Network className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-light tracking-widest text-emerald-100">BIOME<span className="font-bold text-emerald-400">.STUDIO</span></h1>
          </div>
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-emerald-950/50 hover:bg-emerald-900 flex items-center justify-center text-emerald-500 hover:text-emerald-300 transition-colors border-emerald-500/30">
            <X />
          </button>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* SIDEBAR / ORGANISM LIST */}
          <div className="w-1/4 bg-[#051c14]/40 backdrop-blur-sm rounded-[40px] border-teal-500/10 p-6 flex-col gap-4 shadow-inner overflow-y-auto no-scrollbar">
            <h2 className="text-sm text-teal-600/80 uppercase tracking-widest mb-6 px-4">Symbiotic Clusters</h2>
            
            <div className="flex-col gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-[#02110c]/80 rounded-[30px] p-4 flex items-center gap-4 cursor-pointer border-transparent hover:border-emerald-500/30 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-emerald-500/50 scale-110 group-hover:scale-125 transition-transform opacity-50 animate-pulse"></div>
                    <Hexagon className="text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-emerald-100 font-medium">Cluster Alpha-{i}</div>
                    <div className="text-xs text-teal-600 mt-1 flex items-center gap-1"><Activity size={10}/> Metabolizing</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN ORGANIC WORKSPACE */}
          <div className="flex-1 flex-col gap-6">
            
            {/* GRAPHS / CELLS */}
            <div className="h-1/3 flex gap-6">
              <div className="flex-1 bg-[#051c14]/40 backdrop-blur-sm rounded-[40px] border-teal-500/10 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-64 h-64 border-emerald-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-48 h-48 border-teal-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="text-center relative z-10">
                  <div className="text-5xl font-light text-emerald-100 mb-2">98.4%</div>
                  <div className="text-sm text-teal-600 tracking-widest uppercase">Neural Cohesion</div>
                </div>
              </div>
              <div className="w-1/3 bg-[#051c14]/40 backdrop-blur-sm rounded-[40px] border-teal-500/10 p-8 flex-col gap-4 justify-center items-center">
                <Globe className="text-teal-500 w-12 h-12 mb-4 opacity-50" />
                <div className="text-emerald-400 text-lg">Global Sync</div>
              </div>
            </div>

            {/* FLUID CHAT */}
            <div className="flex-1 bg-[#051c14]/60 backdrop-blur-md rounded-[40px] border-emerald-500/20 p-8 flex-col gap-4 relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex-1 overflow-y-auto flex-col gap-6 no-scrollbar pb-20">
                <div className="self-start bg-[#02110c] border-emerald-500/20 text-emerald-100 p-5 rounded-[30px] rounded-tl-sm max-w-[70%]">
                  The biomatrix has successfully integrated your request. Neural pathways are routing optimal solutions now.
                </div>
                <div className="self-end bg-emerald-900/30 border-emerald-500/40 text-emerald-50 p-5 rounded-[30px] rounded-tr-sm max-w-[70%] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  Excellent. Initiate the deep learning sequence on Cluster Alpha-2.
                </div>
              </div>
              
              <div className="absolute bottom-8 left-8 right-8">
                <input type="text" className="w-full h-16 bg-[#02110c]/80 backdrop-blur-xl border-emerald-500/30 rounded-full px-8 text-emerald-100 placeholder-teal-800 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all" placeholder="Communicate with the swarm..." />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
