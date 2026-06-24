/**
 * PromptHouse Evo Studio — Tool Autogenerator Full View
 * Owner: Compiler Bearcat | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { autoGenerateTool, getAllRecipes } from './tool-autogenerator.js';
import { addProofReceipt } from './prompt-base.js';

const TOOL_TYPES = [
  { id: 'template', label: '📋 Prompt Template', desc: 'Reusable prompt template with variables' },
  { id: 'agent', label: '🤖 Custom Agent', desc: 'Multi-step autonomous agent recipe' },
  { id: 'promptlink_adapter', label: '🔗 PromptLink Adapter', desc: 'Provider routing adapter' },
  { id: 'extension', label: '🧩 Browser Extension', desc: 'Chrome/Edge extension scaffold' },
  { id: 'forgerail_rail', label: '🛤️ ForgeRail Rail', desc: 'ForgeRail pipeline rail config' },
  { id: 'app', label: '📱 App Scaffold', desc: 'React/Flutter app scaffold' },
];

import { universalSend } from './lib/universal-transport.js';
import { BRIDGE_URL } from './config/bridge-config.js';

async function callBridge(prompt) {
  try {
    const res = await universalSend([{ role: 'user', content: prompt }]);
    return res.message;
  } catch (err) {
    return null;
  }
}

export function ToolAutogenView() {
  const [intent, setIntent] = useState('');
  const [selectedType, setSelectedType] = useState('template');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [bridgeLive, setBridgeLive] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  useEffect(() => {
    getAllRecipes().then(setRecipes);
    fetch(BRIDGE_URL + '/status', { signal: AbortSignal.timeout(2000) })
      .then(r => setBridgeLive(r.ok)).catch(() => setBridgeLive(false));
  }, []);

  const generate = useCallback(async () => {
    if (!intent.trim()) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await autoGenerateTool({
        intent,
        type: selectedType,
        sourceSignals: [],
        callBridge: bridgeLive ? callBridge : null,
      });
      setResult(res);
      const updated = await getAllRecipes();
      setRecipes(updated);
      addProofReceipt('tool_autogen', 'tool_autogen:generate', 'built', { type: selectedType, intent: intent.slice(0,80) });
    } catch (e) {
      setResult({ error: e.message });
    }
    setGenerating(false);
  }, [intent, selectedType, bridgeLive]);

  return (
    <div className="flex flex-col gap-4 gap-4 animate-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2">🪄 Tool Autogenerator</div>
          <div className="text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8">Generate custom tools, agents, adapters, and extensions from intent prompts.</div>
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
          background: bridgeLive ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
          border: `1px solid ${bridgeLive ? '#4ade80' : '#f87171'}`,
          color: bridgeLive ? '#4ade80' : '#f87171' }}>
          {bridgeLive ? '🟢 AI Bridge Live' : '🔴 Live-Run Blocked (Bridge Offline)'}
        </div>
      </div>

      <div className="tabs-bar" style={{ marginBottom: 16 }}>
        {[{ id: 'generate', label: '🪄 Generate' }, { id: 'vault', label: `📦 Vault (${recipes.length})` }].map(t => (
          <button key={t.id} className={`tab-glass-extreme text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-3xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95 ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          {/* Tool Type Picker */}
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title" style={{ fontSize: 13 }}>Tool Type</div></div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body" style={{ padding: 8 }}>
              {TOOL_TYPES.map(t => (
                <button key={t.id} onClick={() => setSelectedType(t.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                    background: selectedType === t.id ? 'rgba(245,200,66,0.15)' : 'var(--bg-void)',
                    border: `1px solid ${selectedType === t.id ? '#f5c842' : 'var(--border-dim)'}`,
                    color: selectedType === t.id ? '#f5c842' : 'var(--text-secondary)', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generator */}
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Describe Your Tool Intent</div></div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body flex-col gap-4">
              <div className="field">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">What should this tool do? (be specific)</label>
                <textarea className="field-textarea" rows={5}
                  ghostInput="e.g. Create a PromptLink adapter that routes any Flutter code-generation request to a local Ollama model with fallback to GPT-4o-mini..."
                  value={intent} onChange={e => setIntent(e.target.value)} />
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 8, fontSize: 11, color: '#fb923c', marginBottom: 12 }}>
                ⚠️ All generated tools are marked <strong>draft/template</strong>. Owner approval required before publishing or deploying.
              </div>
              <button className="glass-extreme text-neon-cyan border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-3xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-cyan-500/10 hover:scale-[1.02] active:scale-95" onClick={generate} disabled={generating || !intent.trim()}>
                {generating ? '⏳ Generating...' : `🪄 Generate ${TOOL_TYPES.find(t => t.id === selectedType)?.label || 'Tool'}`}
              </button>

              {result && (
                <div style={{ marginTop: 16 }}>
                  {result.error ? (
                    <div style={{ padding: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171', borderRadius: 8, color: '#f87171', fontSize: 12 }}>❌ {result.error}</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ padding: 14, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80', marginBottom: 6 }}>✅ Recipe: {result.recipe?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{result.recipe?.promptRecipe}</div>
                      </div>
                      {result.code && (
                        <div style={{ background: '#030408', borderRadius: 8, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4ade80', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
                          {result.code}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: '#f87171' }}>
                        Proof required: {result.recipe?.proofRequired?.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vault' && (
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">📦 Tool Recipe Vault</div></div>
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
            {recipes.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-title">No recipes yet</div><div className="empty-sub">Generate your first tool above</div></div>
            ) : recipes.map(r => (
              <div key={r.id} style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{r.name}</span>
                  <span className="badge badge-dim" style={{ fontSize: 10 }}>{r.type}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.promptRecipe}</div>
                <div style={{ fontSize: 10, color: '#fb923c', marginTop: 8 }}>Status: {r.status} · {r.createdAt?.slice(0,10)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
