import React from 'react';
import { Clock, History, ArrowRightCircle, GitCommit, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemporalTraceView() {
  const events = [
    { id: 't_001', action: 'Evolution Cycle Completed', target: 'OmniBotRemote', time: '12:45:02 PM', user: '@system_daemon' },
    { id: 't_002', action: 'Syntax Error Patched', target: 'AuthSentry', time: '12:41:15 PM', user: '@auto_healer' },
    { id: 't_003', action: 'Banned Word Purge', target: 'Global', time: '12:30:00 PM', user: '@truth_auditor' },
    { id: 't_004', action: 'Component Scaffolded', target: 'TemporalTraceView', time: '12:15:33 PM', user: '@antigravity' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050914] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Temporal History</h2>
            <p className="text-xs text-gray-500">Immutable execution ledger</p>
          </div>
        </div>
        <div className="bg-black/50 border border-[rgba(255,255,255,0.1)] rounded-lg flex items-center px-3 py-1.5 w-48">
          <Search size={14} className="text-gray-500 mr-2" />
          <input className="bg-transparent border-none text-xs text-white focus:outline-none w-full" placeholder="Search trace..." />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-[rgba(255,255,255,0.05)]"></div>

          <div className="space-y-6">
            {events.map((e, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={e.id} 
                className="flex items-start gap-6 relative"
              >
                <div className="w-12 h-12 rounded-full bg-black border-2 border-blue-500/30 flex items-center justify-center text-blue-400 z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <GitCommit size={18} />
                </div>
                
                <div className="flex-1 bg-black/40 border border-[rgba(255,255,255,0.05)] rounded-xl p-4 hover:bg-black/60 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                      <span className="text-blue-400">{e.id}</span>
                      <span>•</span>
                      <span>{e.time}</span>
                    </div>
                    <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {e.user}
                    </div>
                  </div>
                  
                  <h4 className="text-gray-200 font-bold text-sm mb-1">{e.action}</h4>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    Target: <span className="text-gray-300 font-mono">{e.target}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-black/40 flex justify-center">
         <button className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors">
           <History size={14} /> Load Older Traces
         </button>
      </div>
    </div>
  );
}
