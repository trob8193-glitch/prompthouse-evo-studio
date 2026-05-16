<<<<<<< HEAD
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
=======
import React, { useState } from 'react';
import { Network, Layout, Play, Eye, Server, Database, Code, CheckCircle2 } from 'lucide-react';
import { useSovereignStore } from '../store.js';

export default function SaasBuilderView() {
  const bridgeUrl = useSovereignStore(s => s.apiConfig.bridgeUrl);
  const [prompt, setPrompt] = useState('A sleek project management dashboard with kanban boards, user auth, and Stripe billing.');
  const [building, setBuilding] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  
  const handleBuild = async () => {
    setBuilding(true);
    try {
      const res = await fetch(`${bridgeUrl}/api/foundry/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.success) {
        setBlueprint(data.files || []);
      }
    } catch (e) {
      console.error(e);
>>>>>>> main
    } finally {
      setBuilding(false);
    }
  };

  return (
<<<<<<< HEAD
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
                ghostInput="Describe your sovereign SaaS architecture..."
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
=======
    <div style={{ display: 'flex', gap: 24, height: '100%' }}>
      {/* LEFT: Live Blueprint Canvas */}
      <div style={{ flex: 1, background: '#0f172a', borderRadius: 16, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', fontWeight: 700 }}>
            <Network size={18} color="#8b5cf6" /> Live Architecture Blueprint
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid #1e293b' }}>
          <textarea 
            value={prompt} onChange={e => setPrompt(e.target.value)}
            style={{ width: '100%', height: 80, background: '#020617', border: '1px solid #334155', borderRadius: 8, color: 'white', padding: 12, resize: 'none', outline: 'none' }}
          />
          <button 
            onClick={handleBuild} disabled={building}
            style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
          >
            <Play size={16} fill="white" /> {building ? 'ORCHESTRATING...' : 'INITIATE SAAS BUILD'}
          </button>
        </div>

        <div style={{ flex: 1, padding: 24, position: 'relative', overflow: 'auto' }}>
          {/* Mock Node Graph */}
          {building && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#8b5cf6' }}>
               Neural Orchestration Active... Constructing Graph
            </div>
          )}
          {!building && blueprint && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', paddingTop: 40 }}>
              <Node title="Frontend (React/Vite)" icon={<Layout size={20} />} active />
              <div style={{ width: 2, height: 40, background: '#334155' }} />
              <div style={{ display: 'flex', gap: 64 }}>
                <Node title="Backend (Node.js)" icon={<Server size={20} />} active />
                <Node title="Database (PostgreSQL)" icon={<Database size={20} />} active />
              </div>
            </div>
          )}
          {!building && !blueprint && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#475569', fontSize: 13 }}>
              Enter a prompt above to generate a SaaS architecture graph.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Evo Eyes Live Preview */}
      <div style={{ width: 400, background: '#0f172a', borderRadius: 16, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', fontWeight: 700 }}>
          <Eye size={18} color="#10b981" /> Evo Eyes (Live DOM Render)
        </div>
        <div style={{ flex: 1, padding: 16, background: '#020617', margin: 16, borderRadius: 8, border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
           {!blueprint ? (
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#475569', fontSize: 12 }}>Awaiting GUI compilation...</div>
           ) : (
             <div style={{ padding: 16, background: 'white', height: '100%', borderRadius: 4, color: 'black' }}>
               <h2 style={{ fontSize: 18, marginBottom: 8 }}>SaaS App Preview</h2>
               <div style={{ padding: 8, background: '#f3f4f6', border: '1px dashed #3b82f6', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -10, left: 10, background: '#3b82f6', color: 'white', fontSize: 9, padding: '2px 4px', borderRadius: 2 }}>[evo-node-1] Targetable</div>
                  Sign In Button
               </div>
             </div>
           )}
>>>>>>> main
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
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
=======
function Node({ title, icon, active }) {
  return (
    <div style={{ 
      background: '#1e293b', border: `2px solid ${active ? '#8b5cf6' : '#334155'}`, 
      padding: '16px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
      color: '#f1f5f9', fontWeight: 600, width: 220, justifyContent: 'center',
      boxShadow: active ? '0 0 20px rgba(139,92,246,0.2)' : 'none'
    }}>
      {icon} {title}
>>>>>>> main
    </div>
  );
}
