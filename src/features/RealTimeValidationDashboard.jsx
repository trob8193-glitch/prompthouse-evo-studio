import React from 'react';
import { Activity, Zap, CheckSquare, AlertTriangle, FastForward } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RealTimeValidationDashboard() {
  const events = [
    { type: 'pass', msg: 'Neural schema valid', time: '1s ago' },
    { type: 'pass', msg: 'AST parsed correctly', time: '4s ago' },
    { type: 'warn', msg: 'Dependency tree heavy (45MB)', time: '12s ago' },
    { type: 'pass', msg: 'Truth rules strictly enforced', time: '30s ago' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050914] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-400 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={24} className="text-cyan-400 animate-pulse" />
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Live Validation Engine</h2>
            <p className="text-xs text-cyan-500/70 font-mono">Stream: ACTIVE_SOCKET</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
           <FastForward size={12} /> Syncing
        </div>
      </div>

      <div className="flex-1 flex bg-black/20">
        <div className="w-1/3 border-r border-[rgba(255,255,255,0.05)] p-6 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
            <div className="w-32 h-32 rounded-full border-[8px] border-black border-t-cyan-400 border-r-cyan-400 animate-[spin_3s_linear_infinite] shadow-2xl relative z-10"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
               <span className="text-3xl font-black text-white font-mono">100</span>
               <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Score</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-6 text-center">Continuous health score based on architectural rules.</p>
        </div>
        
        <div className="flex-1 p-6 flex flex-col bg-black/40 relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_24px] pointer-events-none"></div>
          
          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Event Telemetry Stream</h3>
          
          <div className="space-y-3 z-10 overflow-y-auto pr-2 custom-scrollbar">
            {events.map((e, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex items-start justify-between bg-black/60 border border-[rgba(255,255,255,0.02)] rounded-lg p-3 hover:bg-black transition-colors"
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 ${e.type === 'pass' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {e.type === 'pass' ? <CheckSquare size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div>
                    <div className="text-sm font-mono text-gray-200">{e.msg}</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">{e.time}</div>
              </motion.div>
            ))}
            
            <div className="flex items-center gap-3 p-3 text-cyan-500">
               <Zap size={16} className="animate-pulse" />
               <div className="text-sm font-mono opacity-70">Awaiting next validation tick...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
