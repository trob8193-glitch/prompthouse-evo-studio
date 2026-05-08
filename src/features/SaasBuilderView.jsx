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
    } finally {
      setBuilding(false);
    }
  };

  return (
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
        </div>
      </div>
    </div>
  );
}

function Node({ title, icon, active }) {
  return (
    <div style={{ 
      background: '#1e293b', border: `2px solid ${active ? '#8b5cf6' : '#334155'}`, 
      padding: '16px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
      color: '#f1f5f9', fontWeight: 600, width: 220, justifyContent: 'center',
      boxShadow: active ? '0 0 20px rgba(139,92,246,0.2)' : 'none'
    }}>
      {icon} {title}
    </div>
  );
}
