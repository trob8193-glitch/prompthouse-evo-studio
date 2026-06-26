import React from 'react';
import { Shield, ShieldAlert, Cpu, Database, Network } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProofCenterView() {
  const metrics = [
    { title: 'Data Integrity', value: '100%', icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Neural Tethers', value: 'Secured', icon: Network, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
    { title: 'Runtime Engine', value: 'Verified', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-fuchsia-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out z-10"></div>
      
      <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-gray-200 font-bold tracking-wider text-sm uppercase">Global Proof Center</h2>
            <p className="text-xs text-gray-500">Continuous Security Validation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-6 bg-black/20">
        {metrics.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={m.title} 
            className="bg-black/60 border border-[rgba(255,255,255,0.02)] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className={`p-3 rounded-full mb-3 ${m.bg} ${m.color}`}>
              <m.icon size={20} />
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{m.title}</div>
            <div className={`text-lg font-black tracking-wider ${m.color}`}>{m.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative bg-black/40">
        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full transform scale-150"></div>
        <div className="z-10 w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <ShieldAlert size={32} className="text-indigo-400 animate-pulse" />
        </div>
        <h3 className="z-10 text-xl font-bold text-white tracking-widest uppercase text-center mb-2">Constant Surveillance</h3>
        <p className="z-10 text-xs text-gray-400 text-center max-w-xs leading-relaxed">
          The singularity engine is actively monitoring all cross-module boundaries for truth drift or unverified logic states.
        </p>
      </div>
    </div>
  );
}
