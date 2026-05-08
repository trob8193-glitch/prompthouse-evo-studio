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

async function callBridge(prompt) {
  try {
    const res = await fetch('http://127.0.0.1:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    return data.message || '[Bridge returned empty]';
  } catch {
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
    setRecipes(getAllRecipes());
    fetch('http://127.0.0.1:3001/status', { signal: AbortSignal.timeout(2000) })
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
      setRecipes(getAllRecipes());
      addProofReceipt('tool_autogen', 'tool_autogen:generate', 'built', { type: selectedType, intent: intent.slice(0,80) });
    } catch (e) {
      setResult({ error: e.message });
    }
    setGenerating(false);
  }, [intent, selectedType, bridgeLive]);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">🪄 Tool Autogenerator</div>
          <div className="page-subtitle">Generate custom tools, agents, adapters, and extensions from intent prompts.</div>
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
          background: bridgeLive ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
          border: `1px solid ${bridgeLive ? '#4ade80' : '#f87171'}`,
          color: bridgeLive ? '#4ade80' : '#f87171' }}>
          {bridgeLive ? '🟢 AI Bridge Live' : '🔴 Dry-Run Mode'}
        </div>
      </div>

      <div className="tabs-bar" style={{ marginBottom: 16 }}>
        {[{ id: 'generate', label: '🪄 Generate' }, { id: 'vault', label: `📦 Vault (${recipes.length})` }].map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          {/* Tool Type Picker */}
          <div className="card">
            <div className="card-header"><div className="card-title" style={{ fontSize: 13 }}>Tool Type</div></div>
            <div className="card-body" style={{ padding: 8 }}>
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
          <div className="card">
            <div className="card-header"><div className="card-title">Describe Your Tool Intent</div></div>
            <div className="card-body flex-col">
              <div className="field">
                <label className="field-label">What should this tool do? (be specific)</label>
                <textarea className="field-textarea" rows={5}
                  placeholder="e.g. Create a PromptLink adapter that routes any Flutter code-generation request to a local Ollama model with fallback to GPT-4o-mini..."
                  value={intent} onChange={e => setIntent(e.target.value)} />
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 8, fontSize: 11, color: '#fb923c', marginBottom: 12 }}>
                ⚠️ All generated tools are marked <strong>draft/template</strong>. Owner approval required before publishing or deploying.
              </div>
              <button className="btn btn-primary" onClick={generate} disabled={generating || !intent.trim()}>
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
        <div className="card">
          <div className="card-header"><div className="card-title">📦 Tool Recipe Vault</div></div>
          <div className="card-body">
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
