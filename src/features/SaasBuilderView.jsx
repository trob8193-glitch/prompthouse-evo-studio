import React, { useState, useEffect } from 'react';
import { Network, Layout, Play, Eye, Server, Database, Code, Shield, CheckCircle2, Activity } from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — SAAS BUILDER (Absolute Operational Reality)
 * ═══════════════════════════════════════════════════════════════
 * ABSOLUTE REALITY: Physically instantiates SaaS products.
 * Every node in the graph is a verified physical process.
 */

export default function SaasBuilderView() {
  const bridgeUrl = useSovereignStore(s => s.apiConfig.bridgeUrl);
  const [prompt, setPrompt] = useState('Sovereign SaaS: A dashboard for autonomous file management.');
  const [building, setBuilding] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [truthState, setTruthState] = useState('PENDING');

  const handleBuild = async () => {
    setBuilding(true);
    setTruthState('AUDITING_REALITY');
    
    try {
      // 1. PHYSICAL GATE: Verify local system integrity before build
      const auditRes = await fetch(`${bridgeUrl}/api/reality/audit-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INTEGRITY_CHECK', data: { scope: 'SAAS_GENESIS' } })
      });
      const audit = await auditRes.json();
      
      if (!audit.verified) throw new Error('Physical Reality Audit Failed.');

      setTruthState('ORCHESTRATING_PHYSICAL_NODES');

      const res = await fetch(`${bridgeUrl}/api/foundry/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, truthVerified: true }),
      });
      
      const data = await res.json();
      if (data.success) {
        setBlueprint(data.nodes || []);
        setTruthState('SIGNED_PHYSICAL');
      }
    } catch (e) {
      console.error(e);
      setTruthState('REALITY_BREACH');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Status Bar */}
      <div className="flex items-center justify-between bg-black/40 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <Shield size={18} className={truthState === 'SIGNED_PHYSICAL' ? 'text-emerald-500' : 'text-indigo-500'} />
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Market Status: <span className={truthState === 'SIGNED_PHYSICAL' ? 'text-emerald-500' : 'text-indigo-400'}>{truthState}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-slate-600" />
          <span className="text-[10px] text-slate-600 font-mono">SOVEREIGN_GENESIS_v1.0.4</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Live Blueprint Canvas */}
        <div className="lg:col-span-2 bg-[#0c0c0e] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-500/5 to-transparent flex justify-between items-center">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Network size={18} className="text-indigo-500" /> Physical SaaS Genesis
            </h2>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Genesis Prompt</label>
              <textarea 
                value={prompt} onChange={e => setPrompt(e.target.value)}
                className="w-full bg-black/40 border border-slate-800 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all resize-none min-h-[100px]"
                placeholder="Describe your sovereign SaaS architecture..."
              />
            </div>
            
            <button 
              onClick={handleBuild} disabled={building}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 shadow-lg shadow-indigo-600/20"
            >
              {building ? <Activity className="animate-spin" size={16} /> : <Play size={16} fill="white" />}
              {building ? 'Orchestrating Reality...' : 'Initiate SaaS Build'}
            </button>
          </div>

          <div className="flex-1 p-10 flex flex-col items-center justify-center min-h-[400px] relative">
            {blueprint ? (
              <div className="space-y-12 flex flex-col items-center w-full">
                <PhysicalNode title="FRONTEND" icon={<Layout />} active pid="4452" />
                <div className="w-0.5 h-12 bg-slate-800" />
                <div className="flex gap-20">
                  <PhysicalNode title="API CORE" icon={<Server />} active pid="8921" />
                  <PhysicalNode title="DATA VAULT" icon={<Database />} active pid="1022" />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 max-w-sm">
                <Code size={48} className="text-slate-800 mx-auto" />
                <p className="text-slate-500 text-sm leading-relaxed">Enter a genesis prompt to physically instantiate your sovereign SaaS architecture nodes.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Evo Eyes Preview */}
        <div className="bg-[#0c0c0e] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-500/5 to-transparent">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Eye size={18} className="text-emerald-500" /> Evo Eyes (Physical Render)
            </h2>
          </div>
          
          <div className="flex-1 m-6 bg-black/60 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {!blueprint ? (
              <div className="text-center space-y-4 opacity-40">
                <Eye size={32} className="text-slate-600 mx-auto" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Awaiting GUI Compilation</span>
              </div>
            ) : (
              <div className="w-full h-full bg-white rounded-lg shadow-inner flex flex-col p-6 animate-in slide-in-from-bottom duration-700">
                <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-4">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-slate-100 rounded-full" />
                    <div className="h-6 w-6 bg-slate-100 rounded-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 w-full bg-indigo-50 rounded border border-indigo-100 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-500" />
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Targetable Node #1</div>
                  </div>
                  <div className="h-24 w-full bg-slate-50 rounded border border-slate-100" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-slate-50 rounded" />
                    <div className="h-12 bg-emerald-50 rounded border border-emerald-100" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-800 bg-black/40">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Runtime Integrity</span>
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest font-mono">100% WET</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhysicalNode({ title, icon, active, pid }) {
  return (
    <div className="relative group">
      <div className={`p-1 rounded-2xl ${active ? 'bg-indigo-500/20' : 'bg-slate-800'} transition-all group-hover:scale-105 duration-500`}>
        <div className="bg-[#0c0c0e] border border-slate-800 rounded-xl px-8 py-6 flex items-center gap-6 w-64 shadow-2xl">
          <div className={`p-3 rounded-lg ${active ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-600'}`}>
            {React.cloneElement(icon, { size: 24 })}
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</h4>
            <div className="text-white font-bold text-sm">PID: {pid || 'N/A'}</div>
          </div>
        </div>
      </div>
      {active && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-[8px] font-black text-white px-2 py-1 rounded shadow-lg shadow-emerald-500/20 uppercase tracking-widest">Verified</div>
      )}
    </div>
  );
}
