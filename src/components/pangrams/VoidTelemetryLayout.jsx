import React, { useState, useEffect } from 'react';
import { getBridgeUrl } from '../../lib/api/config.js';

export default function VoidTelemetryLayout() {
  const [metrics, setMetrics] = useState({
    iq: 0,
    rps: 0,
    latency: 0,
    swarms: 0,
    memory: 0
  });

  useEffect(() => {
    let mounted = true;
    const fetchMetrics = async () => {
      try {
        const baseUrl = getBridgeUrl();
        const [statusRes, metricsRes, queueRes] = await Promise.all([
          fetch(`${baseUrl}/status`),
          fetch(`${baseUrl}/api/metrics`),
          fetch(`${baseUrl}/api/queue/master`),
        ]);

        const status = statusRes.ok ? await statusRes.json() : null;
        const metricsData = metricsRes.ok ? await metricsRes.json() : null;
        const queueData = queueRes.ok ? await queueRes.json() : null;

        if (mounted) {
          setMetrics({
            iq: status?.iq_metrics?.baseline ? (status.iq_metrics.baseline + status.iq_metrics.sovereign_gain) : 2100000,
            rps: metricsData?.requests?.requestsPerSecond || 0,
            latency: metricsData?.requests?.avgLatencyMs || 0,
            swarms: Array.isArray(queueData) ? queueData.length : 0,
            memory: metricsData?.system?.memoryUsage?.heapUsed ? Math.round(metricsData.system.memoryUsage.heapUsed / 1024 / 1024) : 0
          });
        }
      } catch (e) {
        // Fallback to zeros or defaults
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const telemetryData = [
    { label: 'IQ_BASELINE', val: (metrics.iq / 1000000).toFixed(1) + 'M', status: 'nominal' },
    { label: 'OPS_RPS', val: metrics.rps.toFixed(1), status: metrics.rps > 100 ? 'warning' : 'nominal' },
    { label: 'NET_LATENCY', val: `${Math.round(metrics.latency)}ms`, status: metrics.latency > 500 ? 'critical' : 'nominal' },
    { label: 'ACTIVE_SWARMS', val: metrics.swarms.toString(), status: 'nominal' },
    { label: 'HEAP_MEM', val: `${metrics.memory}MB`, status: metrics.memory > 1024 ? 'warning' : 'nominal' },
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-black rounded-3xl border border-white/5 overflow-hidden p-12 font-mono animate-in zoom-in duration-700">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#111,#000)]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 flex flex flex-col gap-4 h-full justify-between">
        <header className="flex justify-between items-start">
          <div>
            <div className="text-white/30 text-xs">SYS.ID // VOID-77</div>
            <div className="text-white text-3xl font-black mt-2 tracking-[0.3em] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">TELEMETRY</div>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 text-xs animate-pulse font-bold tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">● LIVE STREAM</div>
            <div className="text-white/50 text-xs mt-2">{new Date().toISOString().split('T')[1].slice(0, 8)} ZULU</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8 mt-12">
          {telemetryData.map((item, i) => (
            <div key={i} className="flex justify-between items-center border-b border-white/10 pb-4 group">
              <span className="text-white/50 text-sm tracking-[0.2em] group-hover:text-cyan-400/80 transition-colors duration-300">{item.label}</span>
              <span className={`text-2xl font-black tracking-widest transition-all duration-300 ${
                item.status === 'nominal' ? 'text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 
                item.status === 'warning' ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
              }`}>
                {item.val}
              </span>
            </div>
          ))}
        </div>

        <footer className="text-cyan-500/30 text-[10px] tracking-[0.5em] text-center border-t border-white/5 pt-8 mt-16 font-bold flex flex flex-col gap-4 items-center gap-2">
          <div>DEEP SPACE PROTOCOL ENGAGED</div>
          <div className="w-1/3 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />
        </footer>
      </div>
    </div>
  );
}
