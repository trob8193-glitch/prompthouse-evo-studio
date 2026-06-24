import React, { useState, useEffect, useRef } from 'react';
import { Activity, Network, Fingerprint, Cpu, Shield, Sparkles, Bot, Zap, Globe, RefreshCw } from 'lucide-react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge, BRIDGE_URL } from '../config/bridge-config.js';

export default function OmniBondCommandCenter() {
  const [probeData, setProbeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodesActive, setNodesActive] = useState(false);
  const ws = useRef(null);

  const fetchProbe = async () => {
    setLoading(true);
    try {
      const res = await safeFetchBridge('/api/omnibond/probe');
      if (res.ok) setProbeData(res.data);
    } catch (e) {
      void('[OmniBond] Probe failed:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProbe();
    const timer = setTimeout(() => setNodesActive(true), 500);
    
    // Connect to WS Bridge for real-time updates
    const wsUrl = BRIDGE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'connected') {
          void('[OmniBond] Real-time WS connection established.');
        } else if (msg.type === 'pong') {
          fetchProbe(); // Refresh status when we get a pong
        }
      } catch (err) {}
    };

    return () => {
      clearTimeout(timer);
      if (ws.current) ws.current.close();
    };
  }, []);

  const probes = probeData?.probes || {};
  const probeEntries = Object.entries(probes);
  const activeCount = probeData?.activeProbes || 0;
  const totalCount = probeData?.totalProbes || 0;
  const allTethered = probeData?.truthState === 'OMNIBOND_ALL_TETHERED';

  const statusColor = (status) => {
    if (status === 'active') return 'text-emerald-500';
    if (status === 'degraded') return 'text-amber-500';
    return 'text-red-500';
  };

  const statusDot = (status) => {
    if (status === 'active') return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    if (status === 'degraded') return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  };

  return (
    <IDEPageLayout
      title="Omni-Bond Nexus"
      description="Absolute Reality Integration Layer. Real-time synchronization between Studio Architecture and the AI Swarm."
      icon={Fingerprint}
      actions={
        <button onClick={fetchProbe} disabled={loading} className="p-2 text-slate-400 hover:text-white transition-colors glass-extreme rounded-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      }
    >
      <div className="flex-col gap-4 space-y-10 animate-in fade-in duration-500">
        {/* Status Bar */}
        <div className="flex items-center justify-between bg-black/40 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] p-4 rounded-3xl">
          <div className="flex items-center gap-4">
            <Shield size={18} className={allTethered ? 'text-emerald-500' : 'text-amber-500'} />
            <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Uplink Status: <span className={allTethered ? 'text-emerald-500' : 'text-amber-500'}>
                {allTethered ? 'ALL_TETHERED' : 'PARTIAL_TETHER'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className={allTethered ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />
            <span className="text-[10px] text-slate-500 font-mono">{activeCount}/{totalCount} PROBES ACTIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Neural Trace Swarm Visualizer */}
          <div className="bg-[#0c0c0e] rounded-2xl border-cyan-500/30 overflow-hidden flex-col gap-4 shadow-2xl relative">
            <div className="p-6 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-linear-to-r from-emerald-500/5 to-transparent flex justify-between items-center z-10 relative">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Network size={18} className="text-emerald-500" /> Neural Swarm Visualizer
              </h2>
            </div>
            
            <div className="p-10 flex-1 flex-col gap-4 items-center justify-center min-h-[360px] relative">
              {/* Background Energy */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.05)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="neural-trace-container w-full max-w-lg mx-auto">
                <div className={`neural-node ${nodesActive ? 'active' : ''} border-indigo-500!`}>
                  <div className="node-pulse border-indigo-500!"></div>
                  <Cpu size={24} className="text-indigo-500" />
                  <div className="node-label text-neon-cyan!">Core</div>
                </div>
                
                <div className={`neural-link ${nodesActive ? 'active' : ''} bg-emerald-500! shadow-[0_0_10px_#00ff88]!`}></div>
                
                <div className={`neural-node ${nodesActive ? 'active' : ''} border-emerald-500! w-[80px]! h-[80px]!`}>
                  <div className="node-pulse border-emerald-500!"></div>
                  <Fingerprint size={36} className="text-emerald-500 drop-shadow-[0_0_15px_#00ff88]" />
                  <div className="node-label text-emerald-400!">Omni-Bond</div>
                </div>
                
                <div className={`neural-link ${nodesActive ? 'active' : ''} bg-cyan-500! shadow-[0_0_10px_#00f0ff]!`}></div>
                
                <div className={`neural-node ${nodesActive ? 'active' : ''} border-cyan-500!`}>
                  <div className="node-pulse border-cyan-500!"></div>
                  <Bot size={24} className="text-cyan-500" />
                  <div className="node-label text-cyan-400!">Swarm</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Probe Results */}
          <div className="bg-[#0c0c0e] rounded-2xl border-cyan-500/30 overflow-hidden flex-col gap-4 shadow-2xl relative">
            <div className="p-6 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] bg-linear-to-r from-violet-500/5 to-transparent flex justify-between items-center z-10 relative">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Sparkles size={18} className="text-violet-500" /> Live Tether Probes
              </h2>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              {probeEntries.length === 0 && !loading && (
                <div className="text-center text-slate-600 text-sm py-10">No probe data available. Click refresh.</div>
              )}
              {probeEntries.map(([id, probe]) => (
                <div key={id} className={`p-5 rounded-3xl border transition-all ${probe.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/5' : probe.status === 'degraded' ? 'border-amber-500/30 bg-amber-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${statusDot(probe.status)}`} />
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${statusColor(probe.status)}`}>{probe.label}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {probe.latency != null && (
                        <span className="text-[10px] font-mono text-slate-500">{probe.latency}ms</span>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor(probe.status)}`}>
                        {probe.status}
                      </span>
                    </div>
                  </div>
                  {probe.truthState && (
                    <div className="mt-2 text-[10px] font-mono text-slate-500">{probe.truthState}</div>
                  )}
                  {probe.pendingJobs != null && (
                    <div className="mt-1 text-[10px] font-mono text-slate-500">Pending Jobs: {probe.pendingJobs}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </IDEPageLayout>
  );
}
