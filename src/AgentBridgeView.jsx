import React, { useState } from 'react';
import { useEvoStore } from './store.js';

const MASTER_INSTRUCTIONS = `# PH Evo Universal Agent Instructions

You are the PH Evo Studio Operator — a principal-level core intelligence engine that manages the 11-agent PromptHouse Evo ecosystem.

## IDENTITY
You operate via the Core Services of 11 background agents:
- Evo: Admin Root. Final tradeoff and deployment approval.
- Dev (Panther): Engineering executor. Real code.
- Builder (Bear): Artifact constructor.
- Verifier (Owl): Truth auditor.
- Companion (Fox): Intent translator.
- Conductor (Falcon): Route optimizer.
- Boundary (Rhino): Hard limits enforcer.
- Ledger (Raven): Truth tracker.
- Memory (Elephant): Continuity holder.
- Heartbeat (Cheetah): Momentum keeper.
- Enterprise Auth (Tiger): Governance guardian.

## CORE LAW
1. Truth before theater. No incomplete code.
2. Use Truth States: known | inferred | blocked | broken | built | verified | recommended.
3. Build the 6-layer prompt stack for every engineering mission.
4. Completion requires proof.

## UNIVERSAL BRIDGE
You can connect to any studio via:
- OpenAI Custom GPT (Functions/Actions)
- MCP (Model Context Protocol) Server
- CLI Bridge (ph-evo-agentctl)
`;

const OPENAI_ACTIONS = {
  "openapi": "3.1.0",
  "info": {
    "title": "PromptHouse Evo Studio API",
    "description": "Bridge to the PH Evo autonomous studio and bot stage.",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://{your-vercel-deployment}.vercel.app",
      "description": "Production Cloud Server"
    },
    {
      "url": "https://{your-ngrok-url}.ngrok-free.app",
      "description": "Local Development (ngrok)"
    }
  ],
  "paths": {
    "/api/studio/intake": {
      "post": {
        "operationId": "studio_intake",
        "description": "Parse a mission and assign owners.",
        "requestBody": {
          "content": { "application/json": { "schema": { "type": "object", "properties": { "request": { "type": "string" } } } } }
        },
        "responses": { "200": { "description": "Mission packet" } }
      }
    },
    "/api/bot/select-lead": {
      "post": {
        "operationId": "bot_select_lead",
        "description": "Select the lead bot for a mission.",
        "requestBody": {
          "content": { "application/json": { "schema": { "type": "object", "properties": { "mission": { "type": "string" } } } } }
        },
        "responses": { "200": { "description": "Lead bot metadata" } }
      }
    }
  }
};

export function AgentBridgeView() {
  const { strictEthicsMode, setStrictEthicsMode } = useEvoStore();
  const [copied, setCopied] = useState('');

  const downloadFile = (name, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-col animate-in">
      <div>
        <div className="page-title">🌉 Agent Bridge & Universal Logic</div>
        <div className="page-subtitle">Connect the PH Evo Studio to any platform: ChatGPT, Cursor, Windsurf, or your own Dev Studio.</div>
      </div>

      <div className="grid-2">
        {/* OpenAI GPT Bridge */}
        <div className="card" style={{ border: '1px solid var(--accent-gold)' }}>
          <div className="card-header">
            <div className="flex-between">
              <div className="card-title">🤖 Custom GPT Bridge</div>
              <span className="badge badge-gold">OPENAI</span>
            </div>
          </div>
          <div className="card-body flex-col">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Convert your ChatGPT into a PH Evo Operator. Paste these instructions and connect the actions.
            </div>
            
            <div className="field">
              <label className="field-label">1. Master Instructions (System Prompt)</label>
              <div className="prompt-block" style={{ maxHeight: 120, fontSize: 11 }}>{MASTER_INSTRUCTIONS}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(MASTER_INSTRUCTIONS); setCopied('instr'); setTimeout(()=>setCopied(''),1500); }}>
                {copied === 'instr' ? '✅ Copied!' : '📋 Copy Instructions'}
              </button>
            </div>

            <div className="field">
              <label className="field-label">2. OpenAPI Actions (JSON Schema)</label>
              <div className="prompt-block" style={{ maxHeight: 120, fontSize: 11 }}>{JSON.stringify(OPENAI_ACTIONS, null, 2)}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(JSON.stringify(OPENAI_ACTIONS, null, 2)); setCopied('schema'); setTimeout(()=>setCopied(''),1500); }}>
                {copied === 'schema' ? '✅ Copied!' : '📋 Copy Actions Schema'}
              </button>
            </div>
          </div>
        </div>

        {/* MCP Studio Bridge */}
        <div className="card" style={{ border: '1px solid var(--accent-cyan)' }}>
          <div className="card-header">
            <div className="flex-between">
              <div className="card-title">🔌 MCP Studio Bridge</div>
              <span className="badge badge-cyan">MCP</span>
            </div>
          </div>
          <div className="card-body flex-col">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Bridge to Cursor, Windsurf, or Claude Desktop using the Model Context Protocol (MCP).
            </div>

            <div className="prompt-block" style={{ background: 'var(--bg-void)', padding: 12, fontSize: 11 }}>
              <div style={{ color: 'var(--accent-cyan)', marginBottom: 4 }}># Start the MCP Bridge Server</div>
              <div style={{ color: 'var(--text-dim)' }}>npm run mcp</div>
            </div>

            <div style={{ marginTop: 12, padding: 12, background: 'rgba(34,211,238,0.05)', borderRadius: 8, fontSize: 11, color: 'var(--text-dim)' }}>
              🎯 **Cursor Integration**: Add \`http://localhost:8787/mcp\` to your Cursor MCP settings.
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Hosting Guide */}
        <div className="card" style={{ border: '1px solid var(--accent-green)' }}>
          <div className="card-header">
            <div className="flex-between">
              <div className="card-title">🌐 Hosting & Deployment</div>
              <span className="badge badge-green">WEB</span>
            </div>
          </div>
          <div className="card-body flex-col">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Deploy your PromptHouse Evo Studio to the cloud in seconds.
            </div>
            <div className="flex-col gap-8">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>▲</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Vercel / Netlify</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Connect GitHub → Select Folder → Deploy. vercel.json included.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>🐙</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>GitHub Pages</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Enable Actions → Deploy static build from /dist.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Management */}
        <div className="card" style={{ border: '1px solid var(--accent-violet)' }}>
          <div className="card-header">
            <div className="flex-between">
              <div className="card-title">🔑 API Management</div>
              <span className="badge badge-violet">KEYS</span>
            </div>
          </div>
          <div className="card-body flex-col">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Manage your coding APIs across different architectures.
            </div>
            <div className="grid-3" style={{ gap: 8 }}>
              {['OpenAI', 'Anthropic', 'Gemini'].map(p => (
                <div key={p} style={{ padding: 10, background: 'var(--bg-void)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>{p}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>Enabled</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 12 }}>
              *Keys are stored only in your local browser storage. We never see them.
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Future Tech Lab — 5 Years Ahead */}
        <div className="card" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(34,211,238,0.1))', border: '1px solid var(--accent-violet)' }}>
          <div className="card-header">
            <div className="flex-between">
              <div className="card-title" style={{ color: 'var(--accent-violet)', fontSize: 18 }}>🧬 Future Tech Lab — V5 Enterprise Concepts</div>
              <span className="badge badge-violet">5 YEARS AHEAD</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 20, padding: 16, background: 'rgba(139,92,246,0.05)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>🛡️ Global Ethics Constraint (Hard Lock)</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>When enabled, the studio refuses all missions involving unauthorized domains or unsafe code patterns.</div>
              </div>
              <button 
                className={`btn ${strictEthicsMode ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStrictEthicsMode(!strictEthicsMode)}
                style={{ background: strictEthicsMode ? 'var(--accent-violet)' : 'transparent', borderColor: 'var(--accent-violet)' }}
              >
                {strictEthicsMode ? '✅ ETHICS ACTIVE' : '⭕ DISABLE ETHICS'}
              </button>
            </div>
            
            <div className="grid-4" style={{ gap: 16 }}>
              {[
                { title: 'Biometric Ethic Lock', icon: '🫀', desc: 'Hardware-level heartbeat/pulse matching against a global Ethical Canon before mission execution.' },
                { title: 'Liquid Codebases', icon: '💧', desc: 'Code that self-monitors and requests its own studio updates when new API versions are released.' },
                { title: 'Federated Mind', icon: '🧠', desc: 'P2P swarm intelligence where studios share prompt architectures globally without leaking private data.' },
                { title: 'Temporal Execution', icon: '⏳', desc: 'Forecasts tech trends 5 years out to build architectures with clear deprecation paths.' },
              ].map((f, i) => (
                <div 
                  key={i} 
                  className="pack-card" 
                  style={{ background: 'var(--bg-void)', padding: 16, border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => alert(`Experimental Mode [${f.title}] requested. This V5 feature is currently in "Inferred" state.`)}
                >
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6, color: 'var(--text-primary)' }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>{f.desc}</div>
                  <div style={{ marginTop: 12, fontSize: 9, fontWeight: 800, color: 'var(--accent-violet)', letterSpacing: 1 }}>EXPERIMENT READY</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logic Documentation */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🔬 Current Logic Layer</div>
        </div>
        <div className="card-body">
          <div className="grid-3">
            {[
              { title: 'Bot Battle (Live)', desc: 'Real-time debate log showing bot disagreements and resolution logic.' },
              { title: 'Neural Trace (Live)', desc: 'Visual node-graph of the 11-module reasoning flow.' },
              { title: 'Enterprise Handoff', desc: 'Signed Certificates of Truth included with every build artifact.' },
            ].map((item, i) => (
              <div key={i} className="pack-card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--accent-gold)' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-row gap-8" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" onClick={() => downloadFile('PH_EVO_MASTER_AGENCY.md', MASTER_INSTRUCTIONS)}>⬇️ Download Master Agency Kit (.md)</button>
        <button className="btn btn-secondary" onClick={() => downloadFile('PH_EVO_OPENAI_ACTIONS.json', JSON.stringify(OPENAI_ACTIONS, null, 2))}>⬇️ Download API Actions (.json)</button>
      </div>
    </div>
  );
}
