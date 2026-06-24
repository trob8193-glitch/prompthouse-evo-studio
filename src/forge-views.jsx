import React, { useState, useEffect } from 'react';
import { useEvoStore, useSovereignStore } from './store.js';
import { BRIDGE_URL } from './config/bridge-config.js';

// ── EVO STUDIO FORGE: THE INVENTION LAYER ───────────────────

export function ForgeLabView() {
  const [tab, setTab] = useState('agents');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2">⚒️ The Evo Studio Forge</div>
          <div className="text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8">Invent new intelligences, bridges, and protocols. Evolutionary development.</div>
        </div>
        <div className="tabs-bar">
          <button className={`tab-glass-extreme text-cyan-100 border border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95 ${tab === 'agents' ? 'active' : ''}`} onClick={() => setTab('agents')}>Agents</button>
          <button className={`tab-glass-extreme text-cyan-100 border border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95 ${tab === 'bridges' ? 'active' : ''}`} onClick={() => setTab('bridges')}>Bridges</button>
          <button className={`tab-glass-extreme text-cyan-100 border border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95 ${tab === 'handshakes' ? 'active' : ''}`} onClick={() => setTab('handshakes')}>Handshakes</button>
        </div>
      </div>

      <div className="animate-in">
        {tab === 'agents' && <AgentArchitect />}
        {tab === 'bridges' && <BridgeInventionLab />}
        {tab === 'handshakes' && <HandshakeComposer />}
      </div>
    </div>
  );
}

function AgentArchitect() {
  const addNotification = useSovereignStore(s => s.addNotification);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Architect');
  const [dna, setDna] = useState('');
  const [logs, setLogs] = useState([
    '[SYS] Neural lattice initialized.',
    '[SYS] Awaiting DNA input...'
  ]);
  const { addToVault } = useEvoStore();

  useEffect(() => {
    if (!dna) return;
    setLogs(prev => [...prev, `[DNA] Updated (${dna.length} chars).`].slice(-10));
  }, [dna]);

  const spawnAgent = () => {
    if (!name || !dna) return;
    const newAgent = {
      id: `agent-${Date.now()}`,
      type: 'agent_dna',
      name,
      role,
      dna,
      saved: new Date().toLocaleDateString(),
      status: 'verified'
    };
    
    fetch(BRIDGE_URL + '/api/files/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: `.evo-vault/agents/${newAgent.id}.json`,
        content: JSON.stringify(newAgent, null, 2)
      })
    }).then(res => {
      if (res.ok) {
        addNotification({ msg: `🦁 Intelligence Spawned: ${name} is now in your Vault.`, type: 'success' });
        setName(''); setDna('');
        setLogs(['[SYS] Neural lattice initialized.', '[SYS] Awaiting DNA input...']);
      } else {
        addNotification({ msg: `❌ Failed to save intelligence.`, type: 'error' });
      }
    }).catch(err => {
      addNotification({ msg: `❌ Error connecting to bridge.`, type: 'error' });
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
        <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Incorporate New Intelligence</div></div>
        <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body flex flex-col gap-4">
          <div className="field">
            <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Agent Name</label>
            <input className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={name} onChange={e => setName(e.target.value)} ghostInput="e.g. Evo Studio Auditor" />
          </div>
          <div className="field">
            <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Primary Role</label>
            <select className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={role} onChange={e => setRole(e.target.value)}>
              <option>Architect</option>
              <option>Auditor</option>
              <option>Strategist</option>
              <option>Creative</option>
              <option>Security</option>
            </select>
          </div>
          <div className="field">
            <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Intelligence DNA (System Instructions)</label>
            <textarea className="field-textarea" value={dna} onChange={e => setDna(e.target.value)} ghostInput="Define the constraints, truth-logic, and goals of this intelligence..." style={{ minHeight: 200 }} />
          </div>
          <button className="glass-extreme text-neon-cyan border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-cyan-500/10 hover:scale-[1.02] active:scale-95" onClick={spawnAgent}>🧬 Spawn Intelligence</button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ background: 'var(--bg-void)', border: '1px solid var(--accent-gold)' }}>
          <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Neural Lattice Preview</div></div>
          <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
             <div className="font-mono text-xs text-emerald-400 bg-black p-4 rounded-2xl h-48 overflow-y-auto space-y-1">
                {logs.map((log, i) => (
                  <div key={i}>\u003E {log}</div>
                ))}
                <div className="pulse inline-block w-2 h-4 bg-emerald-400" />
             </div>
             <div style={{ color: 'var(--accent-gold)', fontWeight: 800, marginTop: 12 }}>{name || 'New Intelligence'}</div>
             <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Role: {role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BridgeInventionLab() {
  const addNotification = useSovereignStore(s => s.addNotification);
  const [bridgeName, setBridgeName] = useState('');
  const [endpoint, setEndpoint] = useState('/api/new-bridge');
  
  return (
    <div className="flex flex-col gap-4">
      <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
        <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Invent New Bridge Architecture</div></div>
        <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body flex flex-col gap-4">
          <div className="field">
             <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Integration Name</label>
             <input className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={bridgeName} onChange={e => setBridgeName(e.target.value)} ghostInput="e.g. Midjourney Sync" />
          </div>
          <div className="field">
             <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Bridge Endpoint</label>
             <input className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
          </div>
          <div className="prompt-block">
             {`// Bridge DNA Generated for ${bridgeName || 'Unlabeled'}\nexport async function ${bridgeName.replace(/\s+/g, '')}Bridge(payload) {\n  const response = await fetch(BRIDGE_URL + '${endpoint}', {\n    method: 'POST',\n    body: JSON.stringify(payload)\n  });\n  return response.json();\n}`}
          </div>
          <button className="glass-extreme text-fuchsia-400 border border-fuchsia-500/30 hover:border-fuchsia-400 transition-all shadow-[0_0_15px_rgba(217,70,239,0.1)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-fuchsia-500/10 hover:scale-[1.02] active:scale-95" onClick={() => {
            if (!bridgeName) return;
            const code = `// Bridge DNA Generated for ${bridgeName || 'Unlabeled'}\nexport async function ${bridgeName.replace(/\s+/g, '')}Bridge(payload) {\n  const response = await fetch(BRIDGE_URL + '${endpoint}', {\n    method: 'POST',\n    body: JSON.stringify(payload)\n  });\n  return response.json();\n}`;
            fetch(BRIDGE_URL + '/api/files/write', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: `src/generated/bridges/${bridgeName.replace(/\s+/g, '')}Bridge.js`,
                content: code
              })
            }).then(res => {
              if (res.ok) {
                addNotification({ msg: `🚀 Bridge Forged: ${bridgeName} saved to src/generated/bridges/`, type: 'success' });
              } else {
                addNotification({ msg: `❌ Failed to forge bridge.`, type: 'error' });
              }
            }).catch(err => {
              addNotification({ msg: `❌ Error connecting to bridge.`, type: 'error' });
            });
          }}>🚀 Forge Bridge</button>
        </div>
      </div>
    </div>
  );
}

function HandshakeComposer() {
  const [signedAt, setSignedAt] = useState(new Date().toISOString());
  const signature = `LOCAL_HANDSHAKE_${signedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}`;

  return (
    <div className="flex flex-col gap-4">
       <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Global Handshake Protocol (GHP) Composer</div></div>
          <div className="glass-extreme rounded-3xl border border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
             <div className="flex flex-col gap-4 gap-16">
                <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: 12 }}>
                   <div>
                      <div style={{ fontWeight: 800 }}>Standard Evo Studio Handshake</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>v1.0.0-PROMPT-NATIVE</div>
                   </div>
                   <span className="badge badge-green">ACTIVE</span>
                </div>
                <div className="prompt-block">
{`{
  "handshake": "GLOBAL_SOVEREIGN_V1",
  "origin": "PROMPTHOUSE_EVO_STUDIO",
  "truth_state": "VERIFIED",
  "timestamp": "${signedAt}",
  "signature": "${signature}"
}`}
                </div>
                <button
                  type="button"
                  onClick={() => setSignedAt(new Date().toISOString())}
                  className="glass-extreme text-neon-cyan border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-cyan-500/10 hover:scale-[1.02] active:scale-95 glass-extreme text-cyan-100 border border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95-sm"
                  style={{ width: 'fit-content' }}
                >
                  Sign New Handshake
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
