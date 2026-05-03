import React, { useState } from 'react';
import { DOMAIN_PACKS, STRICTNESS_MODES, scorePrompt, getGrade, getBarColor, buildPromptStack } from './engine.js';

const BRIDGE = 'http://localhost:3001';

async function callBridge(messages, systemPrompt = '') {
  try {
    const res = await fetch(`${BRIDGE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    const data = await res.json();
    return data.message || '[No response]';
  } catch {
    return '[BRIDGE OFFLINE] Start PromptBridge on :3001 to use AI generation.';
  }
}

// ── Prompt Score Ring ──
function ScoreRing({ score }) {
  const grade = getGrade(score);
  const color = score >= 90 ? '#f5c842' : score >= 80 ? '#8b5cf6' : score >= 70 ? '#22d3ee' : '#404060';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 150) * circumference;
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="48" cy="48" r="36" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 900, color }}>{score}</span>
        <span style={{ fontSize: 7, color: '#666', textAlign: 'center', lineHeight: 1.1 }}>{grade.label.split(' ')[0]}</span>
      </div>
    </div>
  );
}

// ── Single output card ──
function OutputCard({ label, content, color = '#818cf8' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ background: 'rgba(10,10,20,0.8)', border: `1px solid ${color}22`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: `1px solid ${color}22`, background: `${color}08` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
        <button onClick={copy} style={{ fontSize: 10, color: copied ? '#4ade80' : '#666', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '12px 14px', fontSize: 11, color: '#c0c0e0', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.7, maxHeight: 300, overflowY: 'auto' }}>
        {content || '—'}
      </pre>
    </div>
  );
}

export function AIPromptGeneratorView() {
  const [task, setTask] = useState('');
  const [stack, setStack] = useState('React, Node.js, OpenAI');
  const [context, setContext] = useState('');
  const [domain, setDomain] = useState('development');
  const [strictness, setStrictness] = useState('autonomous');
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState(null);
  const [liveResponse, setLiveResponse] = useState('');
  const [score, setScore] = useState(0);
  const [activeOutput, setActiveOutput] = useState('system');

  const generate = async () => {
    if (!task.trim()) return;
    setLoading(true);
    setLiveResponse('');
    const built = buildPromptStack({ task, stack, domain, strictness, context });
    setPrompts(built);
    const s = scorePrompt(task, stack, context, domain, strictness);
    setScore(s);

    const response = await callBridge(
      [{ role: 'user', content: built.executionPrompt }],
      built.systemPrompt
    );
    setLiveResponse(response);
    setLoading(false);
  };

  const domains = Object.values(DOMAIN_PACKS);
  const modes = Object.values(STRICTNESS_MODES);

  return (
    <div style={{ padding: 16, fontFamily: "'Inter', sans-serif", color: '#e0e0ff', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg, #22d3ee, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🧬 AI Prompt Generator
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#666' }}>
            6-layer prompt stack builder · Live AI generation · Scoring & grading
          </p>
        </div>
        {score > 0 && <ScoreRing score={score} />}
      </div>

      {/* Domain + Mode Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 10, color: '#666', marginBottom: 4, display: 'block' }}>DOMAIN</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {domains.map(d => (
              <button key={d.id} onClick={() => setDomain(d.id)} style={{
                background: domain === d.id ? `${d.color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${domain === d.id ? d.color : 'rgba(255,255,255,0.1)'}`,
                color: domain === d.id ? d.color : '#666', borderRadius: 6, padding: '5px 10px',
                fontSize: 11, cursor: 'pointer', fontWeight: domain === d.id ? 700 : 400,
              }}>
                {d.icon} {d.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 10, color: '#666', marginBottom: 4, display: 'block' }}>MODE</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {modes.map(m => (
              <button key={m.id} onClick={() => setStrictness(m.id)} style={{
                background: strictness === m.id ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${strictness === m.id ? '#f5c842' : 'rgba(255,255,255,0.1)'}`,
                color: strictness === m.id ? '#f5c842' : '#666', borderRadius: 6, padding: '5px 10px',
                fontSize: 11, cursor: 'pointer', fontWeight: strictness === m.id ? 700 : 400,
              }}>
                {m.icon} {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task + Stack + Context */}
      <input value={task} onChange={e => setTask(e.target.value)}
        placeholder="What do you want to build or solve? (e.g. Build a login screen with JWT auth)"
        style={{ width: '100%', background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 8, padding: '10px 14px', color: '#e0e0ff', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
      <input value={stack} onChange={e => setStack(e.target.value)}
        placeholder="Stack / Tools (e.g. React, Node.js, Supabase, Flutter)"
        style={{ width: '100%', background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 8, padding: '10px 14px', color: '#e0e0ff', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
      <textarea value={context} onChange={e => setContext(e.target.value)}
        placeholder="Context pack — user type, constraints, existing code, prior decisions... (supports {{variables}})"
        style={{ width: '100%', minHeight: 70, background: '#0a0a18', border: '1px solid #2a2a4a', borderRadius: 8, padding: '10px 14px', color: '#e0e0ff', fontSize: 13, resize: 'vertical', marginBottom: 12, boxSizing: 'border-box' }} />

      <button onClick={generate} disabled={loading || !task.trim()} style={{
        width: '100%', background: loading ? '#333' : 'linear-gradient(135deg, #22d3ee, #818cf8)',
        color: '#000', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 900, fontSize: 15,
        cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16,
      }}>
        {loading ? '⏳ Generating...' : '🧬 Generate Prompt Stack + Live AI Response'}
      </button>

      {prompts && (
        <>
          {/* Tab selector for output types */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {[['system','System Prompt','#22d3ee'],['execution','Execution','#4ade80'],['repair','Repair','#f87171'],['qa','QA Gate','#f5c842'],['release','Release Gate','#8b5cf6'],['live','🤖 Live Response','#ec4899']].map(([k, label, color]) => (
              <button key={k} onClick={() => setActiveOutput(k)} style={{
                background: activeOutput === k ? `${color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeOutput === k ? color : 'rgba(255,255,255,0.1)'}`,
                color: activeOutput === k ? color : '#666', borderRadius: 6, padding: '5px 12px',
                fontSize: 11, cursor: 'pointer', fontWeight: activeOutput === k ? 700 : 400,
              }}>{label}</button>
            ))}
          </div>

          {activeOutput === 'system' && <OutputCard label="System Prompt" content={prompts.systemPrompt} color="#22d3ee" />}
          {activeOutput === 'execution' && <OutputCard label="Execution Prompt" content={prompts.executionPrompt} color="#4ade80" />}
          {activeOutput === 'repair' && <OutputCard label="Repair Prompt" content={prompts.repairPrompt} color="#f87171" />}
          {activeOutput === 'qa' && <OutputCard label="QA Gate Prompt" content={prompts.qaPrompt} color="#f5c842" />}
          {activeOutput === 'release' && <OutputCard label="Release Gate" content={prompts.releaseGatePrompt} color="#8b5cf6" />}
          {activeOutput === 'live' && (
            <OutputCard label="Live AI Response (via PromptBridge)" content={loading ? 'Generating...' : liveResponse} color="#ec4899" />
          )}
        </>
      )}
    </div>
  );
}
