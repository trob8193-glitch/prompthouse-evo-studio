import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Zap, Shield, Activity, Database, Globe, AlertCircle } from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — EVOPULSE GRID MESH
 * ═══════════════════════════════════════════════════════════════
 * Real-time visualization of the decentralized Rift Grid nodes
 * and EvoPulse routes. Binds to Port 3002.
 */

const NodeCard = ({ node }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:border-indigo-500/30 transition-all group">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${node.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
        <Database size={16} />
      </div>
      <div className="flex flex-col items-end">
        <div className={`text-[9px] font-black uppercase tracking-widest ${node.truth_label === 'REAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {node.truth_label}
        </div>
        <div className="text-[8px] text-slate-600 font-bold mt-1 uppercase">ID: {node.id.slice(0, 8)}</div>
      </div>
    </div>
    <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
      {node.node_name}
    </div>
    <div className="text-[10px] text-slate-500 font-bold mt-1">{node.node_type}</div>
    
    <div className="mt-3 pt-3 border-t border-slate-800/50 flex gap-2 overflow-x-auto no-scrollbar">
      {(node.capabilities || []).map((cap, i) => (
        <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">
          {cap}
        </span>
      ))}
    </div>
  </div>
);

const RouteLine = ({ route }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-900/20 border border-slate-800/50 rounded-lg hover:bg-slate-900/40 transition-all">
    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
      <Share2 size={14} />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <div className="text-[10px] font-black text-white uppercase tracking-tighter">{route.route_type}</div>
        <div className="text-[8px] font-black text-slate-600 uppercase">{route.target_kind}</div>
      </div>
      <div className="text-[9px] font-mono text-indigo-400 truncate mt-0.5">{route.route_value}</div>
    </div>
    <div className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest pl-2">
      {route.truth_label}
    </div>
  </div>
);

export default function EvoPulseGridView() {
  const riftStatus = useSovereignStore((s) => s.riftStatus);
  const riftData = useSovereignStore((s) => s.riftData);
  const gridNodes = useSovereignStore((s) => s.gridNodes);
  const gridRoutes = useSovereignStore((s) => s.gridRoutes);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${riftStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">EvoPulse Grid</h2>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
            Decentralized Node Mesh & Rift Boundary Telemetry — Port 3002
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</div>
            <div className="text-xl font-black text-white">{gridNodes.length}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mesh Routes</div>
            <div className="text-xl font-black text-white">{gridRoutes.length}</div>
          </div>
        </div>
      </div>

      {riftStatus !== 'connected' && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-4">
          <AlertCircle className="text-rose-400" size={24} />
          <div>
            <div className="text-sm font-black text-rose-400 uppercase tracking-tight">Rift Bridge Offline</div>
            <div className="text-[10px] text-rose-400/70 font-bold">Start the bridge server using <code className="bg-rose-900/20 px-1 rounded">npm run rift:bridge</code> to activate the grid.</div>
          </div>
        </div>
      )}

      {/* Grid Mesh Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Node Inventory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> Registered Grid Nodes
            </h3>
            <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
              + Register Node
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gridNodes.length === 0 ? (
              <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-800/50 rounded-3xl">
                <div className="text-slate-600 font-black uppercase text-xs tracking-widest mb-1">No active nodes</div>
                <div className="text-[10px] text-slate-700 font-bold italic">The grid is currently empty.</div>
              </div>
            ) : (
              gridNodes.map((node) => <NodeCard key={node.id} node={node} />)
            )}
          </div>
        </div>

        {/* Right Column: Route Stream & Boundaries */}
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={14} /> Live Routes
            </h3>
            <div className="space-y-3">
              {gridRoutes.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/20 rounded-2xl border border-slate-800/50">
                  <div className="text-[10px] text-slate-600 font-black uppercase">No routes registered</div>
                </div>
              ) : (
                gridRoutes.map((route) => <RouteLine key={route.id} route={route} />)
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} /> Rift Boundaries
            </h3>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Gateway</span>
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[8px] font-black uppercase tracking-widest">Hard Block</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Native Wi-Fi</span>
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[8px] font-black uppercase tracking-widest">Hard Block</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Public IP</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[8px] font-black uppercase tracking-widest">Verification Req</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Activity size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Rift Core Intelligence</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                  "{riftData?.system_msg || 'Secure boundary protocols active. No external drift detected.'}"
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
