import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function EvoDuelEngineView() {
  const [activeDuel, setActiveDuel] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const bots = [
    'CopilotBot', 'DesignBot', 'BackendBot', 'DeployBot', 'SecurityBot', 'RefactorBot'
  ];

  const startDuel = () => {
    setActiveDuel('Running Prompt: "Architect AGI Core"');
    setLogs(['Arena initialized.', 'Bots loading context vectors...']);
    setTimeout(() => setLogs(l => [...l, '[BackendBot] Generated scalable Node.js skeleton.']), 1000);
    setTimeout(() => setLogs(l => [...l, '[CopilotBot] Injected auto-retry logic.']), 2000);
    setTimeout(() => setLogs(l => [...l, '[SecurityBot] Flaw detected in Copilot retry: unbounded loop.']), 3000);
    setTimeout(() => setLogs(l => [...l, 'Duel Complete. Winner: BackendBot (Grade A)']), 4500);
    setTimeout(() => setActiveDuel(null), 6000);
  };

  return (
    <div className="p-6 bg-[#0B0F19] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-500 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-red-400 to-orange-400">Evo Duel Arena</h2>
          <p className="text-sm text-gray-400 mt-1">Competitive Evaluation Engine (21 Bot Roster)</p>
        </div>
        <button 
          onClick={startDuel}
          disabled={!!activeDuel}
          className="px-6 py-2 bg-[rgba(239,68,68,0.1)] text-red-400 border border-[rgba(239,68,68,0.3)] rounded-md hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
        >
          {activeDuel ? 'Duel in Progress...' : 'Start Battle'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {bots.map((bot, i) => (
          <motion.div 
            key={bot}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-lg border flex flex-col items-center justify-center ${activeDuel ? 'border-red-500/50 bg-red-500/10' : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]'}`}
          >
            <div className="text-lg font-bold text-gray-300">{bot}</div>
            <div className="text-xs text-gray-500 mt-1">Evo Score: {Math.floor(Math.random() * 20 + 80)}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-black/50 border border-[rgba(255,255,255,0.05)] rounded-lg p-4 font-mono text-sm h-48 overflow-y-auto">
        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-gray-300 mb-2 border-l-2 border-red-500/50 pl-2"
            >
              <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </motion.div>
          ))}
          {logs.length === 0 && <div className="text-gray-600 text-center mt-16">Arena Idle. Awaiting prompt.</div>}
        </AnimatePresence>
      </div>
    </div>
  );
}
