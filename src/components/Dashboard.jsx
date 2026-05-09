import React from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Activity, Shield, Zap, TrendingUp, Cpu, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const StudioDashboard = () => {
  const [iq, setIq] = React.useState(2354500); // Sovereign IQ baseline

  const [ops, setOps] = React.useState([
    { id: 1, type: 'Intelligence Vein', desc: 'Ingesting truth-verified PromptLink data streams...', status: 'ACTIVE' },
    { id: 2, type: 'Foundry Engine', desc: 'DatasetForge: SYNTHESIZING', status: 'ACTIVE' }
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIq(prev => prev + Math.floor(Math.random() * 50));
      
      // Randomly change status or desc of an op
      setOps(prev => prev.map(op => {
        if (Math.random() > 0.7) {
          const descriptions = [
            'Ingesting truth-verified PromptLink data streams...',
            'Synthesizing DatasetForge corpuses...',
            'Auditing execution queue for anomalies...',
            'Compacting logic structures via Singularity Core...',
            'Running Truth Probe on external APIs...'
          ];
          return { ...op, desc: descriptions[Math.floor(Math.random() * descriptions.length)] };
        }
        return op;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 p-2"
    >
      <header className="flex justify-between items-center mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-500"
          >
            FOUNDRY OS
          </motion.h1>
          <p className="text-slate-500 mt-2 font-mono text-xs tracking-[0.3em] uppercase opacity-70">Recursive Autonomy & Sovereign Intelligence Deck</p>
        </div>
        <div className="flex gap-6">
          <StatusBadge status="verified" label="OS: HARDENED" />
          <StatusBadge status="executing" label="BRIDGE: ACTIVE" />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* IQ Metric Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="xl:col-span-4 bg-gradient-to-br from-indigo-900 via-violet-950 to-black rounded-[40px] p-10 text-white shadow-[0_20px_50px_rgba(79,70,229,0.15)] relative overflow-hidden border border-indigo-500/20"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 opacity-60">
              <TrendingUp size={20} className="text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Sovereign IQ Baseline</span>
            </div>
            <h2 className="text-7xl font-black mb-2 tracking-tighter tabular-nums">{(iq / 1000000).toFixed(1)}M</h2>
            <div className="h-1.5 w-full bg-white/10 rounded-full mt-8 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ duration: 2, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
              />
            </div>
            <p className="text-xs opacity-50 mt-4 font-mono tracking-wider">Maturity Status: LEVEL 117 / OMEGA</p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Cpu size={240} />
          </div>
        </motion.div>

        <div className="xl:col-span-8 space-y-10">
          <section className="bg-slate-900/30 backdrop-blur-3xl border border-slate-800/50 rounded-[40px] p-10 shadow-2xl">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-white tracking-tight">
              <Activity size={24} className="text-indigo-500" /> ACTIVE SOVEREIGN OPS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ops.map(op => (
                <div key={op.id} className="p-8 bg-black/40 rounded-3xl border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-500 uppercase font-black tracking-widest group-hover:text-indigo-400">{op.type}</span>
                    <div className={`w-3 h-3 rounded-full ${op.id === 1 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'} animate-pulse`} />
                  </div>
                  <p className="text-base text-slate-300 leading-relaxed">{op.desc}</p>
                </div>
              ))}
            </div>
          </section>
          
          <section className="bg-slate-900/30 backdrop-blur-3xl border border-slate-800/50 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-10 pb-0">
               <h2 className="text-xl font-black flex items-center gap-3 text-white tracking-tight">
                <Globe size={24} className="text-indigo-500" /> REAL-TIME PERFORMANCE
              </h2>
            </div>
            <PerformanceMonitor />
          </section>
        </div>
      </div>
    </motion.div>
  );
};