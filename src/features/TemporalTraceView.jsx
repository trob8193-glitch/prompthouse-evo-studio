import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, History, Search, Zap, Layers } from 'lucide-react';
import { Log } from '../core/autonomy/SovereignLogger.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

/**
 * PH EVO STUDIO — TEMPORAL TRACE VIEW (V4 RESTORED)
 * ═══════════════════════════════════════════════════════════════
 * Visualizes the 'Reasoning Lineage' of studio artifacts.
 * Traces the blended intelligence path for every production event.
 */

import { safeFetchBridge } from '../config/bridge-config.js';

export default function TemporalTraceView() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadTrace = async () => {
      try {
        const res = await safeFetchBridge('/api/bridge-contract-ledger');
        if (res.ok && mounted && res.data?.ledger) {
          // Map backend ledger format to TemporalTrace UI format
          const mapped = Array.isArray(res.data.ledger) ? res.data.ledger.map((entry, idx) => ({
            id: entry.id || idx,
            event: entry.action || entry.name || 'LEDGER_ENTRY',
            time: new Date(entry.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            logic: entry.truthState || entry.status || 'VERIFIED'
          })) : Object.keys(res.data.ledger).map((key, idx) => ({
             id: idx,
             event: `CONTRACT: ${key.toUpperCase()}`,
             time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
             logic: res.data.ledger[key]?.status || 'ACTIVE'
          }));
          
          if (mapped.length > 0) {
            setHistory(mapped);
          } else {
             setHistory([
               { id: 1, event: 'SINGULARITY_INITIALIZED', time: new Date().toLocaleTimeString(), logic: 'OMNIPOTENT_BASELINE' },
               { id: 2, event: 'AWAITING_NEW_EVENTS', time: new Date().toLocaleTimeString(), logic: 'IDLE_STREAM' }
             ]);
          }
        }
      } catch (err) {
        console.error("TemporalTrace load error:", err);
      }
    };
    loadTrace();
    const interval = setInterval(loadTrace, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <IDEPageLayout
      title="Temporal Trace History"
      description="Visualizes the reasoning lineage of studio artifacts. Infinite Ledger Connected."
      icon={Clock}
    >
      <div className="flex flex-col h-full bg-black/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">

      {/* Trace List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {history.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl group hover:border-indigo-500/30 transition-all"
          >
            <div className="mt-1"><History size={14} className="text-slate-600" /></div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-black text-white uppercase tracking-tighter">{item.event}</div>
                <div className="text-[8px] font-bold text-slate-600 uppercase">{item.time}</div>
              </div>
              <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">{item.logic}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Real-Time Pulse */}
      <div className="px-6 py-3 border-t border-slate-800 bg-indigo-500/5 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Live Reasoning Trace Active</span>
        </div>
      </div>
      </div>
    </IDEPageLayout>
  );
}
