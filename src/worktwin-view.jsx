/**
 * PromptHouse Evo Studio — WorkTwin Vault Full View
 * Owner: Evo | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getAllSignals, saveSignal, getAllRecipes, captureWorkflowSignal, createWorkTwinSignal } from './worktwin-vault.js';
import { runPatternMiner, getAllPatterns, generateRecipeFromPattern } from './pattern-miner.js';
import { addProofReceipt } from './prompt-base.js';

const SIGNAL_TYPES = ['repeat_prompt','repeat_error','repeat_doc','repeat_workflow'];
const CONSENT_SCOPES = ['private','team','marketplace_candidate'];

export function WorkTwinVaultView() {
  const [signals, setSignals] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [activeTab, setActiveTab] = useState('capture');
  const [captureForm, setCaptureForm] = useState({ source: 'studio', patternType: 'repeat_prompt', context: '', consentScope: 'private' });
  const [logs, setLogs] = useState([]);

  const log = useCallback((msg, type = 'info') => setLogs(l => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0,29)]), []);

  const refresh = useCallback(() => {
    setSignals(getAllSignals());
    setRecipes(getAllRecipes());
    setPatterns(getAllPatterns());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const capture = useCallback(() => {
    if (!captureForm.context.trim()) { log('⚠️ Context required before capture.', 'warn'); return; }
    const sig = captureWorkflowSignal(captureForm);
    log(`✅ Signal captured: ${sig.id} (${sig.patternType})`, 'success');
    addProofReceipt('worktwin', 'worktwin_capture', 'built', { signalId: sig.id });
    refresh();
    setCaptureForm(f => ({ ...f, context: '' }));
  }, [captureForm, log, refresh]);

  const mine = useCallback(() => {
    const found = runPatternMiner({ minFrequency: 1 });
    log(`📡 Pattern Miner: ${found.length} pattern(s) detected.`, found.length ? 'success' : 'info');
    refresh();
  }, [log, refresh]);

  const genRecipe = useCallback((pattern) => {
    const recipe = generateRecipeFromPattern(pattern);
    log(`🪄 Recipe generated: ${recipe.name}`, 'success');
    refresh();
  }, [log, refresh]);

  const TABS = [
    { id: 'capture', label: '📥 Capture Signal' },
    { id: 'signals', label: `📡 Signals (${signals.length})` },
    { id: 'patterns', label: `🔍 Patterns (${patterns.length})` },
    { id: 'recipes', label: `🪄 Recipes (${recipes.length})` },
    { id: 'logs', label: '📋 Logs' },
  ];

  const statusColors = { private: '#38bdf8', team: '#f5c842', marketplace_candidate: '#4ade80' };

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">🤖 WorkTwin Vault</div>
          <div className="page-subtitle">Browser capture → Pattern → Recipe → Tool. All private. All consented.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={mine}>📡 Run Pattern Miner</button>
          <button className="btn btn-sm btn-primary" onClick={refresh}>↻ Refresh</button>
        </div>
      </div>

      <div className="tabs-bar" style={{ marginBottom: 16 }}>
        {TABS.map(t => <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}
      </div>

      {activeTab === 'capture' && (
        <div className="card">
          <div className="card-header"><div className="card-title">📥 Capture Workflow Signal</div></div>
          <div className="card-body flex-col">
            <div style={{ padding: '12px 16px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 8, fontSize: 12, color: '#fb923c', marginBottom: 16 }}>
              ⚠️ <strong>Consent Required.</strong> Only capture context you explicitly choose to save. No silent telemetry. Secrets are auto-redacted.
            </div>
            <div className="grid-2">
              <div className="field">
                <label className="field-label">Source</label>
                <select className="field-select" value={captureForm.source} onChange={e => setCaptureForm(f => ({ ...f, source: e.target.value }))}>
                  {['studio','browser','api','extension'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Pattern Type</label>
                <select className="field-select" value={captureForm.patternType} onChange={e => setCaptureForm(f => ({ ...f, patternType: e.target.value }))}>
                  {SIGNAL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Consent Scope</label>
              <select className="field-select" value={captureForm.consentScope} onChange={e => setCaptureForm(f => ({ ...f, consentScope: e.target.value }))}>
                {CONSENT_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Context (will be auto-redacted for secrets)</label>
              <textarea className="field-textarea" rows={5} placeholder="Paste the workflow, prompt, or pattern you want to capture..." value={captureForm.context} onChange={e => setCaptureForm(f => ({ ...f, context: e.target.value }))} />
            </div>
            <button className="btn btn-primary" onClick={capture}>📥 Capture Signal with Consent</button>
          </div>
        </div>
      )}

      {activeTab === 'signals' && (
        <div className="card">
          <div className="card-header"><div className="card-title">📡 Workflow Signals</div></div>
          <div className="card-body">
            {signals.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📡</div><div className="empty-title">No signals yet</div><div className="empty-sub">Use Capture tab or the browser extension (Ctrl+Shift+P)</div></div>
            ) : signals.map(s => (
              <div key={s.id} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8, borderLeft: '3px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-cyan)' }}>{s.patternType}</span>
                  <span style={{ fontSize: 10, color: statusColors[s.consentScope] || '#fff', padding: '2px 6px', background: `${statusColors[s.consentScope]}22`, borderRadius: 4 }}>{s.consentScope}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{s.redactedContext?.slice(0, 120) || '(empty)'}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{s.source} · {s.capturedAt?.slice(0,19)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🔍 Detected Patterns</div>
            <button className="btn btn-sm btn-secondary" onClick={mine}>Run Miner</button>
          </div>
          <div className="card-body">
            {patterns.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-title">No patterns yet</div><div className="empty-sub">Capture 2+ signals of the same type, then run Pattern Miner</div></div>
            ) : patterns.map(p => (
              <div key={p.id} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{p.patternType}</span>
                  <span style={{ fontSize: 11, color: '#f5c842' }}>×{p.frequency} detected</span>
                </div>
                {p.examples.map((ex, i) => <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>• {ex}</div>)}
                <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }} onClick={() => genRecipe(p)}>🪄 Generate Recipe</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="card">
          <div className="card-header"><div className="card-title">🪄 Tool Recipes</div></div>
          <div className="card-body">
            {recipes.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🪄</div><div className="empty-title">No recipes yet</div><div className="empty-sub">Detect a pattern and generate a recipe from it</div></div>
            ) : recipes.map(r => (
              <div key={r.id} style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--accent-cyan)', marginBottom: 6 }}>Type: {r.type} · Status: {r.status}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-void)', padding: 10, borderRadius: 6 }}>{r.promptRecipe}</div>
                {r.generatedCode && <div style={{ fontSize: 11, color: '#4ade80', fontFamily: 'var(--font-mono)', background: 'var(--bg-void)', padding: 10, borderRadius: 6, marginTop: 8, whiteSpace: 'pre-wrap' }}>{r.generatedCode?.slice(0,300)}</div>}
                <div style={{ fontSize: 10, color: '#f87171', marginTop: 8 }}>⚠️ Requires owner approval before publishing · {r.proofRequired?.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card" style={{ background: '#030408' }}>
          <div className="card-header"><div className="card-title">📋 Activity Log</div></div>
          <div className="card-body" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {logs.length === 0 && <span style={{ color: 'var(--text-dim)' }}>// Awaiting actions...</span>}
            {logs.map((l, i) => (
              <div key={i} style={{ color: l.type === 'success' ? '#4ade80' : l.type === 'warn' ? '#fb923c' : '#94a3b8', marginBottom: 3 }}>
                <span style={{ color: '#333' }}>[{l.ts}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
