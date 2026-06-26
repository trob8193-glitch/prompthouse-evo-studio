import React from 'react';
import { Activity, Cpu, Server, Network, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsView() {
  const metrics = [
    { label: 'CPU Load', value: '14%', icon: Cpu, color: 'text-indigo-400', progress: 14 },
    { label: 'Mem Allocation', value: '2.1 GB', icon: Server, color: 'text-purple-400', progress: 65 },
    { label: 'Event Bus', value: '8.4k/s', icon: Activity, color: 'text-cyan-400', progress: 84 },
    { label: 'Uplink Health', value: '99.9%', icon: Network, color: 'text-emerald-400', progress: 99 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050914] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Observability Matrix</h2>
            <p className="text-xs text-gray-500">Live Studio Telemetry</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-bold uppercase tracking-widest">
           <Activity size={12} className="animate-pulse" /> All Systems Nominal
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={m.label} 
            className="bg-black/40 border border-[rgba(255,255,255,0.05)] p-5 rounded-xl hover:bg-black/60 transition-colors"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <m.icon size={14} className={m.color} />
                {m.label}
              </div>
              <div className={`text-xl font-black font-mono ${m.color}`}>
                {m.value}
              </div>
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${m.progress}%` }}
                 transition={{ duration: 1, delay: i * 0.1 }}
                 className={`h-full ${m.color.replace('text', 'bg')}`}
               />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 p-6 flex gap-4 overflow-hidden">
         <div className="flex-1 bg-black/40 border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full transform scale-150"></div>
            <div className="flex items-center justify-between z-10 mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Network Throughput</h3>
              <TrendingUp size={14} className="text-blue-400" />
            </div>
            <div className="flex-1 flex items-end gap-1 z-10 opacity-70">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: ['20%', '80%', '40%', '90%', '30%'][i % 5] }}
                  transition={{ repeat: Infinity, duration: 1.5 + (i % 3) * 0.5, ease: "easeInOut" }}
                  className="flex-1 bg-linear-to-t from-blue-500/20 to-blue-400 rounded-t-sm"
                />
              ))}
            </div>
         </div>
         
         <div className="w-1/3 bg-black/40 border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Anomaly Detection</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <AlertCircle size={20} />
              </div>
              <div className="text-emerald-400 font-bold text-sm">0 Anomalies</div>
              <div className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Last 24 Hours</div>
            </div>
         </div>
      </div>
    </div>
  );
}
