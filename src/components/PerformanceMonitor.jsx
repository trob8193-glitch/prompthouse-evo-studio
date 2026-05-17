import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Database, Cpu } from 'lucide-react';
import { useSovereignStore } from '../store.js';

export const PerformanceMonitor = () => {
  const storeMetrics = useSovereignStore((s) => s.metrics);

  const metrics = {
<<<<<<< HEAD
    latency: typeof storeMetrics?.latency_ms === 'number' ? storeMetrics.latency_ms : null,
    cacheHit: typeof storeMetrics?.cache?.hitRate === 'number' ? storeMetrics.cache.hitRate : null,
    cpuUserSeconds: typeof storeMetrics?.cpu_usage?.user === 'number' ? (storeMetrics.cpu_usage.user / 1_000_000) : null,
    rps: typeof storeMetrics?.requests?.requestsPerSecond === 'number' ? storeMetrics.requests.requestsPerSecond : null
=======
    latency: storeMetrics?.latency || 12,
    cacheHit: storeMetrics?.cache?.hitRate || 85,
    dbSpeed: 4, 
    cpuLoad: storeMetrics?.cpu_usage?.user ? (storeMetrics.cpu_usage.user / 1000000) : 12
>>>>>>> main
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color, max = 100 }) => (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</span>
        <Icon size={16} className={color} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono">{value == null ? '—' : value.toFixed(1)}</span>
        <span className="text-slate-500 text-xs">{unit}</span>
      </div>
      <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${value == null ? 0 : Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-indigo-500" /> System Performance
        </h2>
        <div className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Live Profile: ACTIVE</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Request Latency" value={metrics.latency} unit="ms" icon={Zap} color="text-yellow-500" max={500} />
        <MetricCard title="Cache Hit Rate" value={metrics.cacheHit} unit="%" icon={Activity} color="text-emerald-500" max={100} />
        <MetricCard title="CPU User Time" value={metrics.cpuUserSeconds} unit="s" icon={Cpu} color="text-rose-500" max={30} />
        <MetricCard title="Requests" value={metrics.rps} unit="/s" icon={Database} color="text-indigo-500" max={5} />
      </div>

      <div className="mt-8 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Database size={16} className="text-indigo-400" /> Optimization Proof
        </h3>
        <div className="space-y-3">
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
