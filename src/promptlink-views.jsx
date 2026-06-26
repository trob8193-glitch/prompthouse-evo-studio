import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function PromptLinkViews() {
  const [bridges, setBridges] = useState([
    { id: '1', name: 'OpticNerve (Browser)', status: 'connected', latency: '12ms' },
    { id: '2', name: 'OmniMobile', status: 'connected', latency: '45ms' },
    { id: '3', name: 'External SlackBot', status: 'disconnected', latency: '-' }
  ]);
  
  const [tetherLogs, setTetherLogs] = useState([]);

  const pingBridge = (id) => {
    setTetherLogs(l => [`[Ping] Testing bridge ${id}...`, ...l].slice(0, 5));
    setTimeout(() => {
      setTetherLogs(l => [`[Pong] Bridge ${id} responded.`, ...l].slice(0, 5));
    }, 400);
  };

  return (
    <div className="p-6 bg-[#090b14] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-indigo-400">PromptLink Bridge</h2>
          <p className="text-sm text-gray-400 mt-1">Cross-matrix tether registry.</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {bridges.map(b => (
          <div key={b.id} className="flex items-center justify-between p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${b.status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
              <div>
                <div className="text-gray-200 font-bold">{b.name}</div>
                <div className="text-xs text-gray-500">Latency: {b.latency}</div>
              </div>
            </div>
            <button 
              onClick={() => pingBridge(b.id)}
              disabled={b.status !== 'connected'}
              className="px-4 py-1.5 text-xs bg-[rgba(139,92,246,0.1)] text-purple-400 border border-[rgba(139,92,246,0.3)] rounded hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30"
            >
              Ping
            </button>
          </div>
        ))}
      </div>

      <div className="bg-black/50 rounded-lg p-3 border border-[rgba(255,255,255,0.05)] min-h-[100px]">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Tether Logs</div>
        <AnimatePresence>
          {tetherLogs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-300 font-mono mb-1"
            >
              {log}
            </motion.div>
          ))}
          {tetherLogs.length === 0 && <div className="text-xs text-gray-600 italic">No recent tether events.</div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
