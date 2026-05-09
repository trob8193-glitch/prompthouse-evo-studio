import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Clock, Eye, Network, RefreshCw, Server } from 'lucide-react';
import { Log } from '../core/autonomy/SovereignLogger.js';

const BRIDGE_URL = 'http://127.0.0.1:3001';

function hashOffset(value = '') {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  return (hash % 9) - 4;
}

function layoutGraphNodes(nodes) {
  const rows = Math.ceil(Math.sqrt(nodes.length || 1));
  const cols = Math.ceil((nodes.length || 1) / rows);
  return nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const xStep = cols > 1 ? 74 / (cols - 1) : 0;
    const yStep = rows > 1 ? 74 / (rows - 1) : 0;
    return {
      ...node,
      x: 13 + col * xStep + hashOffset(node.id),
      y: 13 + row * yStep + hashOffset(node.path || node.id) * 0.6,
    };
  });
}

function nodeTone(health) {
  if (health === 'error') return { border: '#ef4444', dot: '#ef4444', text: '#fca5a5' };
  if (health === 'warning') return { border: '#f59e0b', dot: '#f59e0b', text: '#fcd34d' };
  return { border: '#22c55e', dot: '#22c55e', text: '#86efac' };
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-black/30 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
        <Icon size={14} color={color} />
      </div>
      <div className="text-xl font-black text-white tracking-tight">{value}</div>
      {sub ? <div className="text-[10px] text-slate-500 mt-1">{sub}</div> : null}
    </div>
  );
}

export function EvoEyesView() {
  const [scanStatus, setScanStatus] = useState('IDLE');
  const [diagnostics, setDiagnostics] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [error, setError] = useState(null);

  const runDiagnostics = async () => {
    setScanStatus('SCANNING');
    setError(null);
    Log.info('[EvoEyes] Running studio diagnostics...');
    try {
      const res = await fetch(`${BRIDGE_URL}/api/studio/diagnostics?limit=60`, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`Diagnostics endpoint returned ${res.status}`);
      const data = await res.json();
      setDiagnostics(data);
      const firstNodeId = data?.graph?.nodes?.[0]?.id || null;
      setSelectedNodeId((prev) => prev || firstNodeId);
      setScanStatus('COMPLETE');
      Log.info(`[EvoEyes] Diagnostics complete. modules=${data?.summary?.modules_scanned || 0}`);
    } catch (err) {
      const message = String(err?.message || err);
      setError(message);
      setScanStatus('ERROR');
      Log.error(`[EvoEyes] Diagnostics failed: ${message}`);
    }
  };

  const graphNodes = useMemo(() => layoutGraphNodes(diagnostics?.graph?.nodes || []), [diagnostics]);
  const nodeById = useMemo(() => {
    const map = new Map();
    graphNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [graphNodes]);
  const selectedModule = useMemo(
    () => (diagnostics?.modules || []).find((module) => module.id === selectedNodeId) || null,
    [diagnostics, selectedNodeId],
  );

  const summary = diagnostics?.summary || {};
  const probes = diagnostics?.probes || [];
  const edges = diagnostics?.graph?.edges || [];

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl relative">
      {scanStatus === 'SCANNING' && (
        <motion.div
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-1 bg-indigo-500/40 shadow-[0_0_14px_rgba(99,102,241,0.55)] z-10"
        />
      )}

      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
        <div className="flex items-center gap-3">
          <Eye size={20} className="text-indigo-400" />
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Evo Eyes Runtime Diagnostics</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Live telemetry, module health, dependency graph
            </p>
          </div>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={scanStatus === 'SCANNING'}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 ${
            scanStatus === 'SCANNING'
              ? 'bg-slate-800 text-slate-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
          }`}
        >
          <RefreshCw size={12} className={scanStatus === 'SCANNING' ? 'animate-spin' : ''} />
          {scanStatus === 'SCANNING' ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 border-b border-slate-800 bg-black/20">
        <StatCard icon={Server} label="Modules" value={summary.modules_scanned ?? 0} color="#cbd5e1" />
        <StatCard icon={CheckCircle2} label="Healthy" value={summary.modules_healthy ?? 0} color="#22c55e" />
        <StatCard icon={AlertTriangle} label="Warnings" value={summary.modules_warning ?? 0} color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="Errors" value={summary.modules_error ?? 0} color="#ef4444" />
        <StatCard icon={Network} label="Graph Edges" value={summary.dependency_edges ?? 0} color="#a78bfa" />
        <StatCard icon={Activity} label="Probes" value={summary.probes_total ?? 0} sub={`failing ${summary.probes_failing ?? 0}`} color="#38bdf8" />
        <StatCard icon={Clock} label="Avg Probe" value={`${summary.avg_probe_latency_ms ?? 0} ms`} color="#f97316" />
        <StatCard icon={Clock} label="Scan Time" value={`${diagnostics?.duration_ms ?? 0} ms`} color="#10b981" />
      </div>

      {error ? (
        <div className="mx-4 mt-4 p-3 rounded-lg border border-rose-700/50 bg-rose-950/20 text-rose-300 text-xs">
          Diagnostics failed: {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 p-4 flex-1 min-h-0">
        <div className="min-h-0 flex flex-col gap-4">
          <div className="flex-1 relative bg-black/40 border border-slate-800 rounded-2xl overflow-hidden min-h-[360px]">
            {graphNodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Run diagnostics to generate a dependency graph.
              </div>
            ) : (
              <>
                <svg className="absolute inset-0 w-full h-full opacity-50 pointer-events-none">
                  {edges.map((edge, index) => {
                    const source = nodeById.get(edge.source);
                    const target = nodeById.get(edge.target);
                    if (!source || !target) return null;
                    return (
                      <line
                        key={`${edge.source}-${edge.target}-${index}`}
                        x1={`${source.x}%`}
                        y1={`${source.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke="#334155"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>

                {graphNodes.map((node) => {
                  const tone = nodeTone(node.health);
                  const selected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="absolute px-2 py-1 rounded-lg border text-left backdrop-blur-md"
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: 'translate(-50%, -50%)',
                        borderColor: selected ? '#ffffff' : tone.border,
                        background: selected ? 'rgba(255,255,255,0.08)' : 'rgba(2,6,23,0.85)',
                        minWidth: 130,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone.dot }} />
                        <span className="text-[9px] font-black uppercase" style={{ color: tone.text }}>
                          {node.health}
                        </span>
                      </div>
                      <div className="text-[10px] text-white font-bold truncate">{node.label}</div>
                      <div className="text-[9px] text-slate-500">{node.lines} lines</div>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <div className="bg-black/30 border border-slate-800 rounded-2xl p-4 overflow-auto">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Runtime Endpoint Probes</div>
            <div className="space-y-2">
              {probes.length === 0 ? (
                <div className="text-xs text-slate-500">No probe data yet.</div>
              ) : (
                probes.map((probe) => (
                  <div key={probe.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-[11px] text-slate-200 font-semibold">{probe.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{probe.path}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] font-black uppercase ${probe.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {probe.ok ? 'OK' : 'FAIL'}
                        {probe.status ? ` (${probe.status})` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400">{probe.latency_ms} ms</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 bg-black/30 border border-slate-800 rounded-2xl p-4 overflow-auto">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Selected Module</div>
          {!selectedModule ? (
            <div className="text-xs text-slate-500">Select a node to inspect module diagnostics.</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-white font-bold break-all">{selectedModule.path}</div>
                <div className={`text-[10px] font-black uppercase mt-1 ${selectedModule.health === 'healthy' ? 'text-emerald-400' : selectedModule.health === 'warning' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {selectedModule.health}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/60 border border-slate-800 rounded p-2">
                  <div className="text-slate-500">Lines</div>
                  <div className="text-slate-200 font-semibold">{selectedModule.lines}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded p-2">
                  <div className="text-slate-500">Size</div>
                  <div className="text-slate-200 font-semibold">{selectedModule.size_bytes} B</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded p-2">
                  <div className="text-slate-500">Dependencies</div>
                  <div className="text-slate-200 font-semibold">{selectedModule.dependencies?.length || 0}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded p-2">
                  <div className="text-slate-500">Dependents</div>
                  <div className="text-slate-200 font-semibold">{selectedModule.dependents || 0}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Issues</div>
                {!selectedModule.issues || selectedModule.issues.length === 0 ? (
                  <div className="text-xs text-emerald-400">No issues detected.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedModule.issues.map((issue, index) => (
                      <div key={`${issue.code}-${index}`} className={`text-[11px] p-2 rounded border ${issue.level === 'error' ? 'border-rose-700/40 bg-rose-950/20 text-rose-300' : 'border-amber-700/40 bg-amber-950/20 text-amber-300'}`}>
                        <div className="font-black text-[10px] uppercase mb-1">{issue.code}</div>
                        <div>{issue.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Dependencies</div>
                {!selectedModule.dependencies || selectedModule.dependencies.length === 0 ? (
                  <div className="text-xs text-slate-500">No local dependencies detected.</div>
                ) : (
                  <div className="space-y-1 max-h-44 overflow-auto pr-1">
                    {selectedModule.dependencies.map((dependencyId) => (
                      <button
                        key={dependencyId}
                        onClick={() => setSelectedNodeId(dependencyId)}
                        className="block w-full text-left text-[11px] text-indigo-300 hover:text-indigo-200 truncate"
                      >
                        {dependencyId}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvoEyesView;
