import React, { useState, useEffect } from 'react';
import { useEvoStore } from './store.js';

// ── SOVEREIGN FORGE: THE INVENTION LAYER ───────────────────

export function ForgeLabView() {
  const [tab, setTab] = useState('agents');

  return (
    <div className="flex-col">
      <div className="flex-between">
        <div>
          <div className="page-title">⚒️ The Sovereign Forge</div>
          <div className="page-subtitle">Invent new intelligences, bridges, and protocols. Evolutionary development.</div>
        </div>
        <div className="tabs-bar">
          <button className={`tab-btn ${tab === 'agents' ? 'active' : ''}`} onClick={() => setTab('agents')}>Agents</button>
          <button className={`tab-btn ${tab === 'bridges' ? 'active' : ''}`} onClick={() => setTab('bridges')}>Bridges</button>
          <button className={`tab-btn ${tab === 'handshakes' ? 'active' : ''}`} onClick={() => setTab('handshakes')}>Handshakes</button>
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
  const [name, setName] = useState('');
  const [role, setRole] = useState('Architect');
  const [dna, setDna] = useState('');
  const [logs, setLogs] = useState([
    '[SYS] Neural lattice initialized.',
    '[SYS] Awaiting DNA input...'
  ]);
  const { addToVault } = useEvoStore();

  useEffect(() => {
<<<<<<< HEAD
    if (!dna) return;
    setLogs(prev => [...prev, `[DNA] Updated (${dna.length} chars).`].slice(-10));
=======
    if (dna) {
      const interval = setInterval(() => {
        const newLogs = [
          '[DNA] Analyzing constraints...',
          '[DNA] Mapping truth-logic gates...',
          '[NEURAL] Anchoring synapses...',
          '[NEURAL] Calibrating weights...',
          '[SYS] Ready for spawning.'
        ];
        setLogs(prev => [...prev, newLogs[Math.floor(Math.random() * newLogs.length)]].slice(-10));
      }, 2000);
      return () => clearInterval(interval);
    }
>>>>>>> main
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
    
    fetch('http://127.0.0.1:3001/api/files/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: `.sovereign-vault/agents/${newAgent.id}.json`,
        content: JSON.stringify(newAgent, null, 2)
      })
    }).then(res => {
      if (res.ok) {
        alert(`🦁 Intelligence Spawned: ${name} is now in your Vault.`);
        setName(''); setDna('');
        setLogs(['[SYS] Neural lattice initialized.', '[SYS] Awaiting DNA input...']);
      } else {
        alert(`❌ Failed to save intelligence.`);
      }
    }).catch(err => {
      alert(`❌ Error connecting to bridge.`);
    });
  };

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header"><div className="card-title">Incorporate New Intelligence</div></div>
        <div className="card-body flex-col">
          <div className="field">
            <label className="field-label">Agent Name</label>
            <input className="field-input" value={name} onChange={e => setName(e.target.value)} ghostInput="e.g. Sovereign Auditor" />
          </div>
          <div className="field">
            <label className="field-label">Primary Role</label>
            <select className="field-input" value={role} onChange={e => setRole(e.target.value)}>
              <option>Architect</option>
              <option>Auditor</option>
              <option>Strategist</option>
              <option>Creative</option>
              <option>Security</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Intelligence DNA (System Instructions)</label>
            <textarea className="field-textarea" value={dna} onChange={e => setDna(e.target.value)} ghostInput="Define the constraints, truth-logic, and goals of this intelligence..." style={{ minHeight: 200 }} />
          </div>
          <button className="btn btn-primary" onClick={spawnAgent}>🧬 Spawn Intelligence</button>
        </div>
      </div>
      <div className="flex-col">
        <div className="card" style={{ background: 'var(--bg-void)', border: '1px solid var(--accent-gold)' }}>
          <div className="card-header"><div className="card-title">Neural Lattice Preview</div></div>
          <div className="card-body">
             <div className="font-mono text-xs text-emerald-400 bg-black p-4 rounded-lg h-48 overflow-y-auto space-y-1">
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
  const [bridgeName, setBridgeName] = useState('');
  const [endpoint, setEndpoint] = useState('/api/new-bridge');
  
  return (
    <div className="flex-col">
      <div className="card">
        <div className="card-header"><div className="card-title">Invent New Bridge Architecture</div></div>
        <div className="card-body flex-col">
          <div className="field">
             <label className="field-label">Integration Name</label>
             <input className="field-input" value={bridgeName} onChange={e => setBridgeName(e.target.value)} ghostInput="e.g. Midjourney Sync" />
          </div>
          <div className="field">
             <label className="field-label">Bridge Endpoint</label>
             <input className="field-input" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
          </div>
          <div className="prompt-block">
             {`// Bridge DNA Generated for ${bridgeName || 'Unlabeled'}\nexport async function ${bridgeName.replace(/\s+/g, '')}Bridge(payload) {\n  const response = await fetch('http://127.0.0.1:3001${endpoint}', {\n    method: 'POST',\n    body: JSON.stringify(payload)\n  });\n  return response.json();\n}`}
          </div>
          <button className="btn btn-secondary" onClick={() => {
            if (!bridgeName) return;
            const code = `// Bridge DNA Generated for ${bridgeName || 'Unlabeled'}\nexport async function ${bridgeName.replace(/\s+/g, '')}Bridge(payload) {\n  const response = await fetch('http://127.0.0.1:3001${endpoint}', {\n    method: 'POST',\n    body: JSON.stringify(payload)\n  });\n  return response.json();\n}`;
            fetch('http://127.0.0.1:3001/api/files/write', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: `src/generated/bridges/${bridgeName.replace(/\s+/g, '')}Bridge.js`,
                content: code
              })
            }).then(res => {
              if (res.ok) {
                alert(`🚀 Bridge Forged: ${bridgeName} saved to src/generated/bridges/`);
              } else {
                alert(`❌ Failed to forge bridge.`);
              }
            }).catch(err => {
              alert(`❌ Error connecting to bridge.`);
            });
          }}>🚀 Forge Bridge</button>
        </div>
      </div>
    </div>
  );
}

function HandshakeComposer() {
  return (
    <div className="flex-col">
       <div className="card">
          <div className="card-header"><div className="card-title">Global Handshake Protocol (GHP) Composer</div></div>
          <div className="card-body">
             <div className="flex-col gap-16">
                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-dim)', paddingBottom: 12 }}>
                   <div>
                      <div style={{ fontWeight: 800 }}>Standard Sovereign Handshake</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>v1.0.0-PROMPT-NATIVE</div>
                   </div>
                   <span className="badge badge-green">ACTIVE</span>
                </div>
                <div className="prompt-block">
{`{
  "handshake": "GLOBAL_SOVEREIGN_V1",
  "origin": "PROMPTHOUSE_EVO_STUDIO",
  "truth_state": "VERIFIED",
  "timestamp": "${new Date().toISOString()}",
  "signature": "SHA256_PROOF_NATIVE_..."
}`}
                </div>
                <button className="btn btn-primary btn-sm" style={{ width: 'fit-content' }}>Sign New Handshake</button>
             </div>
          </div>
       </div>
    </div>
  );
}
