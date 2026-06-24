import React from 'react';
import { Home, MessageSquare, Layout, Sparkles, X, ChevronRight } from 'lucide-react';

export default function StudioBeta({ onBack }) {
  return (
    <div className="w-full h-screen bg-white text-slate-800 font-sans overflow-hidden flex-col gap-4 relative" style={{ 
      backgroundImage: 'radial-gradient(circle at 100% 0%, #e0e7ff 0%, #f8fafc 50%, #fdf4ff 100%)' 
    }}>
      
      {/* HEADER */}
      <div className="h-20 bg-white/40 backdrop-blur-3xl flex items-center justify-between px-10 border-b border-slate-200/50 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Ethereal Studio</h1>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex gap-6 text-sm font-semibold text-slate-500">
            <span className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Workspace</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors pb-1">Analytics</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors pb-1">Models</span>
          </nav>
          <div className="w-px h-6 bg-slate-200"></div>
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex-row p-10 gap-10 max-w-[1600px] mx-auto w-full overflow-hidden">
        
        {/* SIDEBAR: GLASS WIDGETS */}
        <div className="w-72 flex-col gap-6">
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white">
            <button className="bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/40 w-full py-2 rounded font-bold uppercase tracking-widest text-xs mb-4" onClick={() => void('Launching beta...')}>Launch Component Beta</button>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Active Roster</h3>
            <div className="flex-col gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white/80 transition-all cursor-pointer">
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${i===1?'from-blue-400 to-indigo-400':i===2?'from-emerald-400 to-teal-400':'from-rose-400 to-orange-400'} shadow-md shrink-0 group-hover:scale-110 transition-transform`}></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-800">Assistant {i}</h4>
                    <p className="text-xs text-slate-500">Ready</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white flex-1 flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">System Health</h3>
            <div className="flex-1 flex-col justify-center gap-6">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">Compute</span><span className="text-slate-500">45%</span></div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[45%] rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">Memory</span><span className="text-slate-500">28%</span></div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[28%] rounded-full"></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="flex-1 bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border-white flex-col gap-4 overflow-hidden relative">
          
          <div className="flex-1 p-8 overflow-y-auto flex-col gap-6">
            <div className="max-w-[70%] bg-white p-6 rounded-3xl rounded-tl-none shadow-sm border-slate-100">
              <p className="text-slate-700 leading-relaxed">Good morning. The studio environment has been fully initialized and optimized for your glassmorphism workflow. How can I assist you with your design tasks today?</p>
            </div>
            <div className="max-w-[70%] self-end bg-linear-to-tr from-indigo-500 to-purple-600 text-white p-6 rounded-3xl rounded-tr-none shadow-lg shadow-indigo-500/20">
              <p className="leading-relaxed">This layout is incredibly !clean Can we add a new analytics module to the sidebar?</p>
            </div>
          </div>
          
          <div className="p-6 bg-white/50 border-t border-slate-100 backdrop-blur-md">
            <div className="relative flex items-center">
              <input type="text" className="w-full h-16 bg-white rounded-2xl pl-6 pr-16 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm border-slate-200" placeholder="Type a message..." />
              <button onClick={() => void('Sending message...')} className="absolute right-3 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl flex items-center justify-center transition-colors shadow-md shadow-indigo-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
