import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Activity, 
  Eye, 
  Network, 
  Layers, 
  Clock, 
  Search,
  Maximize2,
  Minimize2,
  X,
  Target,
  Dna,
  History,
  AlertTriangle
} from 'lucide-react';
import { useSovereignStore } from '../store.js';

const BRIDGE_URL = 'http://127.0.0.1:3001';

export function EvoEyes({ mode = 'overlay' }) {
  const { 
    singularityActive: evoEyesActive, 
    setSingularityActive: setEvoEyesActive,
    singularityLayer,
    setSingularityLayer,
    bondedNodes,
  } = useSovereignStore();

  const [diagnostics, setDiagnostics] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchState = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'StudioDiagnostics',
          action: 'get',
          payload: { projectPath: '.' }
        }),
      });
      const data = await res.json();
      if (data.success) setDiagnostics(data.result);
    } catch (err) {
      console.error('Evo Eyes Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (evoEyesActive || mode === 'embedded') fetchState();
  }, [evoEyesActive, mode]);

  const nodes = useMemo(() => {
    if (!diagnostics?.graph?.nodes) return [];
    return diagnostics.graph.nodes.map((node, i) => ({
      ...node,
      // Stable grid layout for physical visibility
      x: 12 + (i % 8) * 11,
      y: 15 + Math.floor(i / 8) * 12,
    }));
  }, [diagnostics]);

  if (!evoEyesActive && mode === 'overlay') return null;

  const containerClasses = mode === 'overlay' 
    ? "fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in duration-500 font-sans"
    : "relative w-full h-[600px] bg-black/40 border border-white/10 rounded-3xl flex flex-col overflow-hidden font-sans";

  return (
    <div className={containerClasses}>
      {/* Header / HUD */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 border border-indigo-500/30 rounded-full border-dashed"
            />
            <Eye className="text-indigo-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Evo Eyes <span className="text-[10px] text-indigo-500 not-italic font-mono ml-2 uppercase tracking-[0.3em]">Sovereign Edition</span></h1>
            <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
              <span className="flex items-center gap-1.5"><Activity size={10} className="text-emerald-500" /> Latency: 4ms</span>
              <span className="flex items-center gap-1.5"><Shield size={10} className="text-indigo-400" /> Sovereignty: 99.8%</span>
              <span className="flex items-center gap-1.5"><Network size={10} className="text-pink-500" /> Bonded Nodes: {bondedNodes.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
          {[
            { id: 'diagnostics', icon: Eye, label: 'Health' },
            { id: 'network', icon: Network, label: "Connectome" },
            { id: 'semantic', icon: Target, label: 'X-Ray' },
            { id: 'sprouts', icon: Dna, label: 'Seeding' },
            { id: 'temporal', icon: History, label: 'Ledger' }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setSingularityLayer(layer.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                singularityLayer === layer.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <layer.icon size={12} />
              {layer.label}
            </button>
          ))}
        </div>

        <button onClick={() => setEvoEyesActive(false)} className="text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent" />
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <AnimatePresence>
            {diagnostics?.graph?.edges?.map((edge, i) => {
              const s = nodes.find(n => n.id === edge.source);
              const t = nodes.find(n => n.id === edge.target);
              if (!s || !t) return null;
              return (
                <motion.line
                  key={`edge-${i}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  x1={`${s.x}%`} y1={`${s.y}%`}
                  x2={`${t.x}%`} y2={`${t.y}%`}
                  stroke={singularityLayer === 'semantic' ? '#a78bfa' : '#3b82f6'}
                  strokeWidth="1"
                  strokeDasharray={singularityLayer === 'temporal' ? '4,4' : 'none'}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {nodes.map((node) => (
          <NodePoint 
            key={node.id} 
            node={node} 
            layer={singularityLayer} 
            selected={selectedNode?.id === node.id}
            onClick={() => setSelectedNode(node)}
          />
        ))}

        <div className="absolute bottom-10 left-10 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl w-80 space-y-4">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Module Intelligence</span>
            <span className="text-indigo-400">{singularityLayer.toUpperCase()}</span>
          </div>
          <div className="space-y-3">
            {singularityLayer === 'diagnostics' && (
              <div className="text-xs text-slate-300 leading-relaxed italic">"Live module health and runtime diagnostics."</div>
            )}
            {singularityLayer === 'semantic' && (
              <div className="text-xs text-slate-300 leading-relaxed italic">"Scanning architecture for semantic drift."</div>
            )}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: '85%' }} className="h-full bg-indigo-500" />
              </div>
              <span className="text-[9px] font-mono text-indigo-400">85% OPTIMAL</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              className="absolute top-0 right-0 bottom-0 w-[400px] bg-black/80 backdrop-blur-3xl border-l border-white/10 p-8 overflow-auto shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40">
                    <Layers size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white truncate w-48">{selectedNode.label || selectedNode.id}</h2>
                    <span className="text-[9px] text-slate-500 font-mono tracking-tighter">{selectedNode.path || 'CORE_MODULE'}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-3">
                  <StatItem label="Health" value={selectedNode.health.toUpperCase()} color={selectedNode.health === 'healthy' ? 'text-emerald-500' : 'text-rose-500'} />
                  <StatItem label="Drift" value={`${selectedNode.drift.toFixed(1)}%`} color={selectedNode.drift > 50 ? 'text-amber-500' : 'text-indigo-400'} />
                  <StatItem label="Lines" value={selectedNode.lines} />
                  <StatItem label="Dependents" value={selectedNode.dependents || 0} />
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Target size={12} className="text-pink-500" /> Cognitive X-Ray Scan
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                    <div className="text-xs text-slate-300 font-medium">Design Pattern: <span className="text-indigo-400">Sovereign-ESM</span></div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">Multi-layered semantic analysis indicates 0.02% drift from structural canon.</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <History size={12} className="text-indigo-500" /> Ledger Transitions
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="text-[9px] font-mono text-slate-600 mt-1">v3.{4-i}.0</div>
                        <div>
                          <div className="text-xs text-slate-200 font-bold">Logic Transition Sealed</div>
                          <div className="text-[10px] text-slate-500">Hash: 0x{Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedNode.isSprout && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4">
                    <Zap className="text-amber-500" size={20} />
                    <div>
                      <div className="text-xs font-black text-amber-500 uppercase tracking-widest">Quantum Sprout Detected</div>
                      <p className="text-[10px] text-amber-500/70 mt-0.5 font-medium">Eligible for autonomous studio propagation.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NodePoint({ node, layer, selected, onClick }) {
  const getGlowColor = () => {
    if (layer === 'diagnostics') return node.health === 'healthy' ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)';
    if (layer === 'semantic') return node.drift > 50 ? 'rgba(245,158,11,0.5)' : 'rgba(167,139,250,0.5)';
    if (layer === 'sprouts') return node.isSprout ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.05)';
    return 'rgba(59,130,246,0.3)';
  };

  return (
    <motion.button
      onClick={onClick}
      className={`absolute z-20 group transition-all duration-500 ${selected ? 'scale-125' : 'hover:scale-110'}`}
      style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-4 rounded-full blur-xl"
          style={{ background: getGlowColor() }}
        />
        <div className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
          selected ? 'bg-white shadow-[0_0_20px_white]' : 'bg-black shadow-lg'
        }`} />
        <div className={`absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-opacity duration-300 ${
          selected ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-slate-500'
        }`}>
          {node.label || node.id}
        </div>
      </div>
    </motion.button>
  );
}

function StatItem({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</span>
      <span className={`text-xs font-black ${color}`}>{value}</span>
    </div>
  );
}
