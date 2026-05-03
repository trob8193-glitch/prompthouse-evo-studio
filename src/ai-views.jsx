import React, { useState, useMemo, useRef, useEffect } from 'react';
import { analyzeIntent, extractPromptDNA, repairPrompt, searchTemplates, chatWithEvo, EVO_SYSTEM_PROMPT, PROMPT_TEMPLATES } from './ai-engine.js';
import { BOT_ROSTER, DOMAIN_PACKS } from './engine.js';
import { BotCharacter } from './bot-characters.jsx';
import { BotBus } from './bot-orb.jsx';

const TRUTH_BADGE = { known:'badge-cyan', inferred:'badge-gold', blocked:'badge-red', built:'badge-green', verified:'badge-green', recommended:'badge-violet', broken:'badge-red' };

// ── 1. SMART INTENT ANALYZER ─────────────────────────────────
export function IntentAnalyzerView({ onApply }) {
  const [text, setText] = useState('');
  const result = useMemo(() => analyzeIntent(text), [text]);
  const pack = result.domain ? DOMAIN_PACKS[result.domain] : null;

  return (
    <div className="flex-col">
      <div><div className="page-title">🧠 Smart Intent Analyzer</div><div className="page-subtitle">Paste or type your task. PH Evo auto-detects domain, strictness, and variables.</div></div>
      <div className="grid-builder">
        <div className="flex-col">
          <div className="card">
            <div className="card-header"><div className="card-title">Your Task Text</div></div>
            <div className="card-body">
              <textarea className="field-textarea" style={{ minHeight: 180 }} placeholder="Build a Flutter onboarding flow with Firebase auth, profile setup, and push notifications for enterprise customers..." value={text} onChange={e => setText(e.target.value)} />
            </div>
          </div>
          {result.suggestions?.length > 0 && (
            <div className="card" style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.2)' }}>
              <div className="card-body flex-col">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 8 }}>💡 Suggestions</div>
                {result.suggestions.map((s, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>• {s}</div>)}
              </div>
            </div>
          )}
        </div>
        <div className="flex-col">
          {!text.trim() ? (
            <div className="empty-state"><div className="empty-icon">🧠</div><div className="empty-title">Start typing your task</div><div className="empty-sub">Analysis updates in real time.</div></div>
          ) : (
            <>
              <div className="card">
                <div className="card-header"><div className="card-title">Analysis Results</div></div>
                <div className="card-body flex-col">
                  <div className="flex-between">
                    <span className="field-label">Confidence</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: result.confidence > 60 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>{result.confidence}%</span>
                  </div>
                  <div className="readiness-bar"><div className="readiness-bar-fill" style={{ width: `${result.confidence}%`, background: 'linear-gradient(90deg,var(--accent-gold),var(--accent-green))' }} /></div>

                  <div className="section-divider" />
                  <div className="flex-row gap-8">
                    <span className="field-label">Detected Domain</span>
                    {pack && <span className="badge badge-gold">{pack.icon} {pack.name}</span>}
                  </div>
                  <div className="flex-row gap-8">
                    <span className="field-label">Strictness</span>
                    <span className="badge badge-violet">{result.strictness === 'autonomous' ? '👑 Automated Deploy' : result.strictness === 'production' ? '🚀 Production' : '⚡ Balanced'}</span>
                  </div>
                  <div className="flex-row gap-8">
                    <span className="field-label">Word Count</span>
                    <span className="badge badge-dim">{result.wordCount} words</span>
                  </div>
                  {result.variables?.length > 0 && (
                    <div>
                      <div className="field-label" style={{ marginBottom: 6 }}>Variables Detected</div>
                      <div className="flex-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                        {result.variables.map(v => <span key={v} className="var-key">{`{{${v}}}`}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="section-divider" />
                  <div className="field-label" style={{ marginBottom: 6 }}>Domain Signal Scores</div>
                  {Object.entries(result.domainScores || {}).map(([d, score]) => (
                    <div key={d} className="flex-row gap-8" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 120, flexShrink: 0 }}>{d}</span>
                      <div className="readiness-bar" style={{ flex: 1 }}><div className="readiness-bar-fill" style={{ width: `${Math.min(100, score * 25)}%`, background: d === result.domain ? 'var(--accent-gold)' : 'var(--border-mid)' }} /></div>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', width: 20 }}>{score}</span>
                    </div>
                  ))}
                  {onApply && result.domain && (
                    <button className="btn btn-primary" onClick={() => onApply({ domain: result.domain, strictness: result.strictness })}>→ Apply to Builder</button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 2. PROMPT DNA EXTRACTOR ──────────────────────────────────
export function PromptDNAView() {
  const [raw, setRaw] = useState('');
  const [copied, setCopied] = useState(false);
  const dna = useMemo(() => raw.trim().length > 20 ? extractPromptDNA(raw) : null, [raw]);

  return (
    <div className="flex-col">
      <div><div className="page-title">🔬 Prompt DNA Extractor</div><div className="page-subtitle">Paste any prompt. Get its full breakdown — role, mission, rules, variables, weaknesses, readiness score.</div></div>
      <div className="grid-builder">
        <div className="card">
          <div className="card-header"><div className="card-title">Input Prompt</div></div>
          <div className="card-body">
            <textarea className="field-textarea" style={{ minHeight: 260 }} placeholder="Paste any prompt here to analyze its DNA..." value={raw} onChange={e => setRaw(e.target.value)} />
          </div>
        </div>
        {!dna ? (
          <div className="empty-state"><div className="empty-icon">🔬</div><div className="empty-title">Paste a prompt to analyze</div></div>
        ) : (
          <div className="flex-col">
            <div className="card">
              <div className="card-header">
                <div className="flex-between">
                  <div className="card-title">DNA Analysis</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: dna.readinessScore >= 80 ? 'var(--accent-green)' : dna.readinessScore >= 60 ? 'var(--accent-gold)' : 'var(--accent-red)' }}>{dna.readinessScore}%</span>
                </div>
              </div>
              <div className="card-body flex-col">
                {[
                  { label: 'Role', value: dna.role, ok: dna.hasRole },
                  { label: 'Mission', value: dna.mission, ok: dna.hasMission },
                  { label: 'Domain', value: dna.domain, ok: true },
                  { label: 'Strictness', value: dna.strictness, ok: true },
                  { label: 'Words', value: `${dna.wordCount} words, ${dna.sentenceCount} sentences`, ok: dna.wordCount > 50 },
                ].map(row => (
                  <div key={row.label} className="flex-row gap-8" style={{ marginBottom: 8 }}>
                    <span style={{ width: 80, flexShrink: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: row.ok ? 'var(--text-primary)' : 'var(--accent-red)' }}>{row.value || '—'}</span>
                    <span style={{ marginLeft: 'auto' }}>{row.ok ? '✅' : '❌'}</span>
                  </div>
                ))}
                <div className="section-divider" />
                <div className="field-label" style={{ marginBottom: 6 }}>Completeness</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[['Role',dna.hasRole],['Mission',dna.hasMission],['Rules',dna.hasRules],['Context',dna.hasContext],['Stack',dna.hasStack],['Output',dna.hasOutput]].map(([l,v]) => (
                    <span key={l} className={`badge ${v ? 'badge-green' : 'badge-red'}`}>{v ? '✓' : '✗'} {l}</span>
                  ))}
                </div>
                {dna.variables?.length > 0 && (<><div className="section-divider" /><div className="field-label" style={{ marginBottom: 6 }}>Variables</div><div className="flex-row" style={{ flexWrap: 'wrap', gap: 6 }}>{dna.variables.map(v => <span key={v} className="var-key">{`{{${v}}}`}</span>)}</div></>)}
                {dna.rules?.length > 0 && (<><div className="section-divider" /><div className="field-label" style={{ marginBottom: 6 }}>Extracted Rules</div>{dna.rules.map((r, i) => <div key={i} style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>• {r}</div>)}</>)}
                {dna.weaknesses?.length > 0 && (<><div className="section-divider" /><div className="field-label" style={{ marginBottom: 6, color: 'var(--accent-red)' }}>⚠️ Weaknesses</div>{dna.weaknesses.map((w, i) => <div key={i} style={{ fontSize: 11, color: 'var(--accent-red)', marginBottom: 4 }}>• {w}</div>)}</>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. TEMPLATE LIBRARY ──────────────────────────────────────
export function TemplateLibraryView({ onUse }) {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const results = useMemo(() => searchTemplates(query, domain), [query, domain]);

  return (
    <div className="flex-col">
      <div className="flex-between">
        <div><div className="page-title">📚 Template Library</div><div className="page-subtitle">{PROMPT_TEMPLATES.length} production-ready prompts. Click any to preview and copy.</div></div>
        <span className="badge badge-gold">{results.length} results</span>
      </div>
      <div className="flex-row gap-12">
        <input className="field-input" style={{ flex: 1 }} placeholder="Search prompts..." value={query} onChange={e => setQuery(e.target.value)} />
        <select className="field-select" style={{ width: 180 }} value={domain} onChange={e => setDomain(e.target.value)}>
          <option value="all">All Domains</option>
          {Object.values(DOMAIN_PACKS).map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, alignContent: 'start' }}>
          {results.map(t => {
            const pack = DOMAIN_PACKS[t.domain];
            return (
              <div key={t.id} className={`vault-item ${selected?.id === t.id ? 'selected' : ''}`} style={{ cursor: 'pointer', borderColor: selected?.id === t.id ? 'var(--accent-gold)' : undefined }} onClick={() => setSelected(t)}>
                <div style={{ fontSize: 11, color: pack?.color || 'var(--text-dim)', fontWeight: 600, marginBottom: 4 }}>{pack?.icon} {pack?.name}</div>
                <div className="vault-item-title">{t.name}</div>
                <div className="vault-item-meta">
                  <span className="badge badge-gold" style={{ fontSize: 9 }}>{t.score}%</span>
                  {t.tags.slice(0,2).map(tag => <span key={tag} className="badge badge-dim" style={{ fontSize: 9 }}>{tag}</span>)}
                </div>
              </div>
            );
          })}
          {results.length === 0 && <div className="empty-state"><div className="empty-icon">📚</div><div className="empty-title">No results</div></div>}
        </div>
        {selected && (
          <div className="card" style={{ position: 'sticky', top: 0 }}>
            <div className="card-header">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <div className="card-title">{selected.name}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="flex-row gap-8">
                <span className="badge badge-gold">{selected.score}% Readiness</span>
                <span className="badge badge-dim">{DOMAIN_PACKS[selected.domain]?.name}</span>
              </div>
            </div>
            <div className="card-body flex-col">
              <div className="prompt-block" style={{ maxHeight: 320 }}>{selected.prompt}</div>
              <div className="flex-row gap-8">
                <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(selected.prompt); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✅ Copied!' : '📋 Copy Prompt'}</button>
                {onUse && <button className="btn btn-secondary" onClick={() => onUse(selected)}>→ Open in Builder</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 4. AUTO-REPAIR ENGINE ────────────────────────────────────
export function AutoRepairView() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => input.trim().length > 20 ? repairPrompt(input) : null, [input]);

  return (
    <div className="flex-col">
      <div><div className="page-title">🔧 Auto-Repair Engine</div><div className="page-subtitle">Paste any prompt. Get vagueness, drift, and missing section detection — plus a repaired version.</div></div>
      <div className="grid-builder">
        <div className="flex-col">
          <div className="card">
            <div className="card-header"><div className="card-title">Original Prompt</div></div>
            <div className="card-body"><textarea className="field-textarea" style={{ minHeight: 260 }} placeholder="Paste your prompt to repair..." value={input} onChange={e => setInput(e.target.value)} /></div>
          </div>
          {result && (
            <div className="card" style={{ background: result.score > 70 ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', border: `1px solid ${result.score > 70 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
              <div className="card-body flex-col">
                <div className="flex-between">
                  <span style={{ fontWeight: 700, color: result.score > 70 ? 'var(--accent-green)' : 'var(--accent-red)' }}>Repair Score</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: result.score > 70 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{result.score}%</span>
                </div>
                <div className="readiness-bar"><div className="readiness-bar-fill" style={{ width: `${result.score}%`, background: result.score > 70 ? 'var(--accent-green)' : 'var(--accent-red)' }} /></div>
                <div className="field-label" style={{ marginTop: 8 }}>{result.issueCount} issues found</div>
                {result.issues.map((issue, i) => (
                  <div key={i} style={{ padding: 10, borderRadius: 8, background: issue.severity === 'high' ? 'rgba(248,113,113,0.08)' : 'rgba(251,146,60,0.08)', border: `1px solid ${issue.severity === 'high' ? 'rgba(248,113,113,0.2)' : 'rgba(251,146,60,0.2)'}`, marginBottom: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: issue.severity === 'high' ? 'var(--accent-red)' : 'var(--accent-orange)', marginBottom: 2 }}>{issue.severity.toUpperCase()} · {issue.type}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{issue.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-cyan)' }}>→ {issue.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {result && (
          <div className="card">
            <div className="card-header">
              <div className="flex-between">
                <div className="card-title">🔧 Repaired Prompt</div>
                <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(result.repaired); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
              </div>
            </div>
            <div className="card-body"><div className="prompt-block" style={{ maxHeight: 480 }}>{result.repaired}</div></div>
          </div>
        )}
        {!result && <div className="empty-state"><div className="empty-icon">🔧</div><div className="empty-title">Paste a prompt to repair</div></div>}
      </div>
    </div>
  );
}

// ── 5. LIVE AI CHAT ──────────────────────────────────────────
export function LiveChatView() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: '🦁 **Evo online.** I am PH Evo Studio Operator. I run 11 automated services and 11 core agents.\n\nMission status: **active**. Truth state: **verified**. Use the chat to coordinate with the ecosystem.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    return BotBus.on(({ action: a }) => {
      if (a === 'idle') setMessages(m => [...m, { role: 'assistant', content: '🦁 **Evo Lead standing by.** Ready for your next objective.' }]);
    });
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput(''); setLoading(true);
    try {
      const reply = await chatWithEvo({
        messages: [...messages.slice(1), userMsg].map(m => ({ role: m.role, content: m.content })),
        systemPrompt: EVO_SYSTEM_PROMPT
      });
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) { 
        setMessages(m => [...m, { role: 'assistant', content: '⚠️ Connection Error: ' + e.message }]);
    }
    setLoading(false);
  };

  const activeBot = useMemo(() => BOT_ROSTER.find(b => b.id === 'evo'), []);

  return (
    <div className="flex-col" style={{ height: '100%' }}>
      <div className="flex-between">
        <div><div className="page-title">💬 Live AI Chat — Evo Core</div><div className="page-subtitle">Coordinate directly with the PH Evo Admin Root. Truth-checked responses powered by your local bridge.</div></div>
        <span className="badge badge-green">Secure Bridge Active</span>
      </div>
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ flexShrink: 0 }}>
                {msg.role === 'assistant' ? (
                  <BotCharacter bot={activeBot} size="sm" isSpeaking={loading && i === messages.length - 1} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                )}
              </div>
              <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? 'var(--accent-gold-dim)' : 'var(--bg-elevated)', border: `1px solid ${msg.role === 'user' ? 'rgba(245,200,66,0.2)' : 'var(--border-dim)'}`, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <BotCharacter bot={activeBot} size="sm" isSpeaking={true} />
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                <div className="pulse" style={{ color: 'var(--accent-gold)', fontSize: 12 }}>Evo is thinking...</div>
              </div>
            </div>
          )}
          {error && <div style={{ padding: 10, background: 'var(--accent-red-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--accent-red)' }}>⚠️ {error}</div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
          <input className="field-input" style={{ flex: 1 }} placeholder="Ask Evo to build a prompt stack, score your prompt, analyze your mission..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>Send</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setMessages(m => m.slice(0,1))} title="Clear chat">🗑️</button>
        </div>
      </div>
    </div>
  );
}
