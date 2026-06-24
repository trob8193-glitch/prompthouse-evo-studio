import React from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Activity, Shield, Zap, TrendingUp, Cpu, Globe, Infinity, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge } from './primitives.jsx';
import { getBridgeUrl } from '../lib/api/config.js';
import { useSovereignStore } from '../store.js';
import { 
  EvoCorePangram, NeuralStreamParagram, HexaGridPangram, OrbitalHUDLayout, 
  QuantumMatrixPangram, CyborneticSplitParagram, VoidTelemetryLayout, HolographicDeckParagram 
} from './pangrams/index.js';

export const StudioDashboard = () => {
  const [iq, setIq] = React.useState(null);

  const [ops, setOps] = React.useState([
    { id: 'bridge', type: 'Neural Bridge', desc: 'Awaiting bridge telemetry...', status: 'PENDING' },
    { id: 'queue', type: 'Execution Matrix', desc: 'Awaiting queue telemetry...', status: 'PENDING' }
  ]);

  const globalTheme = useSovereignStore(s => s.globalTheme);
  const activeThemeId = globalTheme?.theme || 'evoCore';

  React.useEffect(() => {
    let mounted = true;
    async function fetchLive() {
      try {
        const baseUrl = getBridgeUrl();
        const [statusRes, metricsRes, queueRes, nfRes] = await Promise.all([
          fetch(`${baseUrl}/status`),
          fetch(`${baseUrl}/api/metrics`),
          fetch(`${baseUrl}/api/queue/master`),
          fetch(`${baseUrl}/api/nightforge/status`),
        ]);

        const status = statusRes.ok ? await statusRes.json() : null;
        const metrics = metricsRes.ok ? await metricsRes.json() : null;
        const queue = queueRes.ok ? await queueRes.json() : null;
        const nightforge = nfRes.ok ? await nfRes.json() : null;

        if (!mounted) return;

        if (status?.iq_metrics) {
          setIq(status.iq_metrics.baseline + status.iq_metrics.sovereign_gain);
        } else {
          setIq(null);
        }

        const queueCount = Array.isArray(queue) ? queue.length : 0;
        const rps = metrics?.requests?.requestsPerSecond;
        const latency = metrics?.requests?.avgLatencyMs;
        const nfState = nightforge?.state || {};

        setOps([
          {
            id: 'bridge',
            type: 'Neural Bridge (Edge)',
            desc: status ? `ONLINE v${status.version} • Latency ${latency ?? '—'}ms • RPS ${rps ?? '—'}` : 'OFFLINE',
            status: status ? 'ACTIVE' : 'OFFLINE'
          },
          {
            id: 'queue',
            type: 'Execution Matrix',
            desc: `Processing Nodes: ${queueCount}`,
            status: queueCount > 0 ? 'ACTIVE' : 'IDLE'
          },
          {
            id: 'nightforge',
            type: 'Singularity Daemon',
            desc: `Core: ${nfState.active ? 'BONDED' : 'SLEEP'} • Flux: ${nfState.running ? 'NOMINAL' : 'STATIC'}`,
            status: nfState.active ? 'ACTIVE' : 'IDLE'
          },
          {
            id: 'mcp_server',
            type: 'God-Mode MCP',
            desc: '17 Evo Studio Tools Exposed via Secure STDIO',
            status: 'ACTIVE'
          }
        ]);
      } catch (e) {
        if (!mounted) return;
        setIq(null);
        setOps([
          { id: 'bridge', type: 'Neural Bridge', desc: 'OFFLINE', status: 'OFFLINE' },
          { id: 'queue', type: 'Execution Matrix', desc: 'Unavailable', status: 'OFFLINE' }
        ]);
      }
    }
    
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const structuralLayout = globalTheme?.structuralLayout;

  // ─── DYNAMIC AI-EVOLVED STRUCTURAL LAYOUTS ───
  if (structuralLayout === 'evo-core') return <EvoCorePangram />;
  if (structuralLayout === 'neural-stream') return <NeuralStreamParagram />;
  if (structuralLayout === 'hexa-grid') return <HexaGridPangram />;
  if (structuralLayout === 'orbital-hud') return <OrbitalHUDLayout />;
  if (structuralLayout === 'quantum-matrix') return <QuantumMatrixPangram />;
  if (structuralLayout === 'cyber-split') return <CyborneticSplitParagram />;
  if (structuralLayout === 'void-telemetry') return <VoidTelemetryLayout />;
  if (structuralLayout === 'hologram-deck') return <HolographicDeckParagram />;

  // ─── HARD-CODED DYNAMIC FEATURE MODULES ───
  if (activeThemeId === 'extremeKanbanBoard') {
    return (
      <div className="flex gap-4 p-8 w-full h-full overflow-x-auto">
        {['Backlog', 'In Progress', 'Sovereign Verification', 'Done'].map((col) => (
          <div key={col} className="w-80 shrink-0 bg-[#ebecf0] rounded-xl p-4 text-[#172b4d]">
            <h3 className="font-bold mb-4 px-2">{col}</h3>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-3 rounded shadow-sm mb-3 text-sm">
                Task Module #{Math.floor(Math.random() * 1000)}
                <div className="mt-2 flex gap-1">
                  <span className="w-8 h-2 rounded bg-blue-400"></span>
                  <span className="w-4 h-2 rounded bg-red-400"></span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (activeThemeId === 'extremeWindows95') {
    return (
      <div className="p-8 w-full h-full">
        <div className="w-[600px] h-[400px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex-col text-black font-sans">
          <div className="bg-[#000080] text-white px-2 py-1 flex justify-between font-bold">
            <span>C:\\EVO_STUDIO\\SYSTEM</span>
            <div className="flex gap-1">
              <button className="bg-[#c0c0c0] text-black px-1 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold pb-1 leading-none" onClick={() => void('Window minimized')}>_</button>
              <button className="bg-[#c0c0c0] text-black px-1 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold pb-1 leading-none" onClick={() => void('Window closed')}>X</button>
            </div>
          </div>
          <div className="flex p-2 gap-4 border-b border-[#808080]">
            <span className="underline">F</span>ile <span className="underline">E</span>dit <span className="underline">V</span>iew <span className="underline">H</span>elp
          </div>
          <div className="p-4 flex gap-8 flex-wrap bg-white flex-1 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white m-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex-col items-center gap-1 w-16 cursor-pointer">
                <div className="w-8 h-8 bg-yellow-200 border-yellow-600 shadow-sm flex items-end">
                   <div className="w-full h-1/3 bg-white/50" />
                </div>
                <span className="text-xs text-center">Module_{i}.exe</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeThemeId === 'layoutTerminalFullscreen') {
    return (
      <div className="p-8 w-full h-full text-[#0f0] font-mono whitespace-pre-wrap">
        {`EVO STUDIO ROOT ACCESS GRANTED.
        
[SYSTEM] Bypassing UI Modules...
[SYSTEM] Loading raw data streams...

> _`}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-12 p-4 relative"
    >
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00f0ff] rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#8a2be2] rounded-full blur-[180px] mix-blend-screen" />
      </div>

      <header className="flex justify-between items-end mb-16 relative z-10">
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#00f0ff]/10 border-[#00f0ff]/30 rounded-full mb-4"
          >
            <Radio size={14} className="text-[#00f0ff] animate-pulse" />
            <span className="text-[10px] text-[#00f0ff] font-bold tracking-[0.2em] uppercase">Evo Core Bonded</span>
          </motion.div>
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-white to-[#8a2be2]/80">
            SINGULARITY OS
          </h1>
          <p className="text-[#00f0ff]/80 mt-2 font-mono text-[11px] tracking-[0.4em] uppercase">Autonomous Self-Evolution Grid</p>
        </div>
        <div className="flex gap-4">
          <StatusBadge status="verified" label="OMEGA PROTOCOL" />
          <StatusBadge status="executing" label="BRIDGE: ACTIVE" />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        {/* IQ Metric Card */}
        <motion.div 
          whileHover={{ scale: 1.01, boxShadow: '0 0 50px rgba(0,240,255,0.15)' }}
          className="xl:col-span-5 bg-linear-to-br from-[#050508] to-[#0a0a14] rounded-[32px] p-10 text-white relative overflow-hidden border-[#00f0ff]/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Infinity size={240} className="text-[#00f0ff]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-3xl bg-[#00f0ff]/10 flex items-center justify-center border-[#00f0ff]/30">
                <TrendingUp size={20} className="text-[#00f0ff]" />
              </div>
              <span className="text-[11px] text-[#00f0ff] font-bold uppercase tracking-[0.2em]">Logic Density</span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <h2 className="text-8xl font-black mb-2 tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                {iq == null ? '—' : `${(iq / 1000000).toFixed(1)}`}
              </h2>
              <span className="text-2xl font-bold text-[#00f0ff]/50 tracking-widest">M</span>
            </div>

            <div className="h-1 w-full bg-white/5 rounded-full mt-10 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '92%' }}
                transition={{ duration: 2.5, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-[#8a2be2] via-[#00f0ff] to-white shadow-[0_0_15px_rgba(0,240,255,0.8)] relative" 
              >
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-white blur-[2px] opacity-80" />
              </motion.div>
            </div>
            <p className="text-[10px] text-[#00f0ff]/60 mt-4 font-mono tracking-widest uppercase">Maturity Status: <span className="text-white">LEVEL OMEGA</span></p>
          </div>
        </motion.div>

        {/* OPS Matrix */}
        <div className="xl:col-span-7 space-y-8">
          <section className="bg-[#0c0c12]/60 backdrop-blur-2xl border-white/5 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <h2 className="text-[13px] font-black mb-8 flex items-center gap-3 text-white tracking-[0.15em] uppercase">
              <Activity size={18} className="text-[#8a2be2]" /> Active Telemetry Grid
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ops.map(op => (
                <motion.div 
                  key={op.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 bg-[#12121a]/80 backdrop-blur-md rounded-2xl border-white/5 hover:border-[#8a2be2]/40 transition-colors duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-[#8a2be2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] text-[#b4b4c4] uppercase font-bold tracking-[0.15em] group-hover:text-white transition-colors">{op.type}</span>
                      <div className={`w-2 h-2 rounded-full ${op.status === 'ACTIVE' ? 'bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.6)] animate-pulse' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-[13px] font-mono text-[#00f0ff]/80 leading-relaxed">{op.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
          
          <section className="bg-[#0c0c12]/60 backdrop-blur-2xl border-white/5 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="p-8 pb-4">
               <h2 className="text-[13px] font-black flex items-center gap-3 text-white tracking-[0.15em] uppercase">
                <Globe size={18} className="text-[#00f0ff]" /> Real-Time Metrics
              </h2>
            </div>
            <div className="px-4 pb-4">
              <PerformanceMonitor />
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
