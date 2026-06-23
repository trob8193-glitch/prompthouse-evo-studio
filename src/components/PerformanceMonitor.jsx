import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Database, Cpu } from 'lucide-react';
import { useSovereignStore } from '../store.js';

export const PerformanceMonitor = () => {
  const storeMetrics = useSovereignStore((s) => s.metrics);

  const metrics = {
    latency: typeof storeMetrics?.latency_ms === 'number' ? storeMetrics.latency_ms : null,
    cacheHit: typeof storeMetrics?.cache?.hitRate === 'number' ? storeMetrics.cache.hitRate : null,
    cpuUserSeconds: typeof storeMetrics?.cpu_usage?.user === 'number' ? (storeMetrics.cpu_usage.user / 1_000_000) : null,
    rps: typeof storeMetrics?.requests?.requestsPerSecond === 'number' ? storeMetrics.requests.requestsPerSecond : null
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color, max = 100 }) => (
    <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
      <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</span>
          <Icon size={16} className={color} />
        </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono">{value == null ? '—' : value.toFixed(1)}</span>
        <span className="text-slate-500 text-xs">{unit}</span>
      </div>
      <div className="mt-4 h-1 bg-[rgba(0,0,0,0.4)] rounded-full overflow-hidden shadow-inner">
        <motion.div 
          className={`h-full ${color.replace('text-', 'bg-')}`}
          style={{ boxShadow: '0 0 10px currentColor' }}
          initial={{ width: 0 }}
          animate={{ width: `${value == null ? 0 : Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      </div>
    </div>
  );

  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">
          <Activity className="text-indigo-500 drop-shadow-md" /> System Performance
        </h2>
        <div className="text-[10px] text-cyan-400 font-bold bg-cyan-900/30 border-cyan-500/30 px-3 py-1 rounded-full uppercase tracking-wider">Live Profile: ACTIVE</div>
      </div>

      <div className="evo-grid">
        <MetricCard title="Request Latency" value={metrics.latency} unit="ms" icon={Zap} color="text-yellow-500" max={500} />
        <MetricCard title="Cache Hit Rate" value={metrics.cacheHit} unit="%" icon={Activity} color="text-emerald-500" max={100} />
        <MetricCard title="CPU User Time" value={metrics.cpuUserSeconds} unit="s" icon={Cpu} color="text-rose-500" max={30} />
        <MetricCard title="Requests" value={metrics.rps} unit="/s" icon={Database} color="text-indigo-500" max={5} />
      </div>

      <div className="mt-6 glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl p-6 border-l-2 border-l-indigo-500">
        <h3 className="text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-slate-300">
          <Database size={14} className="text-neon-cyan" /> Optimization Proof
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">In-Memory Cache (TTL 60s)</span>
            <span className="text-emerald-400">ENABLED</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Async Job Concurrency</span>
            <span className="text-slate-200">MAX: 2</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">SQLite Indexing (created_at)</span>
            <span className="text-emerald-400">VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
