import React, { useState, useEffect } from 'react';
import { Search, Zap, Shield, Cpu, Layers } from 'lucide-react';
import { Log } from '../core/autonomy/SovereignLogger.js';
import { safeFetchBridge } from '../config/bridge-config.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

/**
 * PH EVO STUDIO — RARE CAPABILITIES (Physical Edition)
 * ═══════════════════════════════════════════════════════════════
 * This module orchestrates the studio's advanced intelligence
 * features: Cognitive X-Ray, DOM Stealing, and Quantum Seeding.
 * ABSOLUTE REALITY: Binds to physical state on disk.
 */

const CapabilityCard = ({ title, description, icon: Icon, color, status, metric }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-slate-800 ${color}`}><Icon size={20} /></div>
      <div className="flex flex-col items-end">
        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{status}</div>
        {metric && <div className="text-[9px] font-bold text-slate-500 mt-1">{metric}</div>}
      </div>
    </div>
    <div className="text-sm font-black text-white uppercase mb-2 tracking-tighter">{title}</div>
    <div className="text-[10px] text-slate-500 font-bold leading-relaxed">{description}</div>
  </div>
);

export default function RareCapabilities() {
  const [stats, setStats] = useState({
    ledgerEntries: 0,
    truthScore: null,
    dependencyEdges: 0
  });

  useEffect(() => {
    const fetchRealityStats = async () => {
      try {
        const [auditRes, proofRes, diagRes] = await Promise.all([
          safeFetchBridge('/api/audit/nuclear-truth'),
          safeFetchBridge('/api/proof/count'),
          safeFetchBridge('/api/studio/diagnostics?limit=25'),
        ]);

        const audit = auditRes.data;
        const proof = proofRes.data;
        const diag = diagRes.data;

        setStats({
          ledgerEntries: Number(proof?.count || 0),
          truthScore: typeof audit?.score === 'number' ? audit.score : null,
          dependencyEdges: Number(diag?.summary?.dependency_edges || 0)
        });
      } catch (err) {
        Log.error('❌ [RareCapabilities] Failed to bind to reality.');
      }
    };
    fetchRealityStats();
  }, []);

  return (
    <IDEPageLayout
      title="Rare Capabilities"
      description="Physical Truth Active"
      icon={Cpu}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CapabilityCard 
          title="Cognitive X-Ray" 
          description="Performs multi-layered semantic analysis of your codebase to identify architecture drift." 
          icon={Search} 
          color="text-cyan-400" 
          status="VERIFIED"
          metric={stats.truthScore == null ? '—' : `${stats.truthScore}% SCORE`}
        />
        <CapabilityCard 
          title="Quantum Seeding" 
          description="Autonomously identifies recursive studio sprouts from high-density production logic." 
          icon={Zap} 
          color="text-yellow-400" 
          status="ACTIVE"
          metric={`${stats.dependencyEdges} EDGES`}
        />
        <CapabilityCard 
          title="Evo Studio Ledger" 
          description="Immutable Merkle-Tree history tracking for every logic transition in the forest." 
          icon={Shield} 
          color="text-rose-400" 
          status="SYNCED"
          metric={`${stats.ledgerEntries} ENTRIES`}
        />
        <CapabilityCard 
          title="DOM Stealer Pro" 
          description="Invisibly captures and audits external web structures for direct foundry integration." 
          icon={Cpu} 
          color="text-purple-400" 
          status="READY"
        />
        <CapabilityCard 
          title="Forest Connectome" 
          description="Real-time visualization and management of cross-studio knowledge webbing." 
          icon={Layers} 
          color="text-emerald-400" 
          status="STABLE"
        />
      </div>
    </IDEPageLayout>
  );
}
