import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export default function RealTimeValidationDashboard() {
  const [metrics, setMetrics] = useState({
    stability: 0.98,
    ingested: 124,
    queueDepth: 0,
    drift: 0.02
  });

  const [history, setHistory] = useState(Array.from({length: 40}, (_, i) => 0.98));

  useEffect(() => {
    let mounted = true;
    const fetchMetrics = async () => {
      try {
        const [metricsRes, queueRes] = await Promise.all([
          fetch(((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))))) + '/api/stream-metrics').catch(() => null),
          fetch(((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))))) + '/api/stream-queue-status').catch(() => null)
        ]);

        if (!metricsRes || !queueRes) return;

        const data = await metricsRes.json();
        const queueData = await queueRes.json();

        if (data.success && mounted) {
          setMetrics({
            stability: data.stability,
            ingested: data.ingested,
            queueDepth: queueData.pendingTasks || 0,
            drift: data.drift
          });
          setHistory(h => [...h.slice(1), data.stability]);
        }
      } catch (err) {
        console.error("Failed to fetch stream metrics:", err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8a2be2]">
          Validation Pipeline <span className="text-sm font-normal text-white/50 tracking-widest uppercase ml-4">Master Layer</span>
        </h1>
        <div className="flex items-center gap-4">
          {metrics.queueDepth > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Activity size={16} className="animate-spin" />
              Queue: {metrics.queueDepth}
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Activity size={16} className="animate-pulse" />
            Zero-Latency Edge Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard icon={<ShieldCheck size={24} className="text-[#00f0ff]" />} label="Stability Score" value={(metrics.stability * 100).toFixed(1) + '%'} />
        <MetricCard icon={<Activity size={24} className="text-purple-400" />} label="Concept Clusters" value={metrics.ingested} />
        <MetricCard icon={<AlertTriangle size={24} className="text-red-400" />} label="Threat Matrix Blocks" value="Auto-Banned" />
        <MetricCard icon={<Cpu size={24} className="text-orange-400" />} label="Vector Drift" value={(metrics.drift * 100).toFixed(2) + '%'} />
      </div>

      {/* Advanced SVG Chart */}
      <div className="bg-[#050508]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6">Semantic Stability Matrix (Live)</h2>
        <div className="h-64 w-full relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* Grid lines */}
            {[20, 40, 60, 80].map(y => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            ))}
            
            <polyline
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              points={history.map((val, i) => `${(i / (history.length - 1)) * 100},${100 - (val * 100)}`).join(' ')}
              style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,240,255,0.4))' }}
            />

            <polygon
              fill="url(#fillGradient)"
              points={`0,100 ${history.map((val, i) => `${(i / (history.length - 1)) * 100},${100 - (val * 100)}`).join(' ')} 100,100`}
            />

            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a2be2" />
                <stop offset="100%" stopColor="#00f0ff" />
              </linearGradient>
              <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,240,255,0.2)" />
                <stop offset="100%" stopColor="rgba(0,240,255,0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="bg-[#050508]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-xl hover:border-white/10 hover:-translate-y-1 transition-all">
      <div className="bg-white/5 p-3 rounded-xl w-fit">{icon}</div>
      <div>
        <div className="text-white/50 text-sm font-semibold">{label}</div>
        <div className="text-3xl font-black text-white mt-1">{value}</div>
      </div>
    </div>
  );
}
