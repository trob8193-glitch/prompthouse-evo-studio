import React, { useState, useEffect, useRef } from 'react';
import { ALL_BOT_ROSTER, CORE_CAST, SENIOR_CAST, DOMAIN_PACKS, scorePrompt, getGrade, getBarColor } from './engine.js';

const BRIDGE = 'http://localhost:3001';

// ── Map every bot to its domain specialty (prompt assignment system) ──
const BOT_DOMAIN_MAP = {
  evo:              { domain: 'all',        specialty: 'Master Judge',            icon: '🦁' },
  dev:              { domain: 'development',specialty: 'Code Builder',            icon: '🐆' },
  builder:          { domain: 'development',specialty: 'Artifact Maker',          icon: '🐻' },
  verifier:         { domain: 'all',        specialty: 'Proof Checker',           icon: '🦉' },
  companion:        { domain: 'creative',   specialty: 'Intent Bridge',           icon: '🦊' },
  conductor:        { domain: 'business',   specialty: 'Fast Router',             icon: '🦅' },
  boundary:         { domain: 'legal',      specialty: 'Limit Enforcer',          icon: '🦏' },
  ledger:           { domain: 'all',        specialty: 'Truth Tracker',           icon: '🐦' },
  memory:           { domain: 'all',        specialty: 'Context Holder',          icon: '🐘' },
  heartbeat:        { domain: 'business',   specialty: 'Momentum Keeper',         icon: '🐆' },
  sovereignty:      { domain: 'all',        specialty: 'Canon Guardian',          icon: '🐯' },
  cipher_lynx:      { domain: 'legal',      specialty: 'Security Architect',      icon: 'CL' },
  vector_wolf:      { domain: 'development',specialty: 'Context Engineer',        icon: 'VW' },
  compiler_bearcat: { domain: 'development',specialty: 'Prompt Compiler',         icon: 'CB' },
  schema_beaver:    { domain: 'development',specialty: 'Contract Engineer',       icon: 'SB' },
  eval_mantis:      { domain: 'all',        specialty: 'Eval Scientist',          icon: 'EM' },
  swarm_falcon:     { domain: 'development',specialty: 'Swarm Orchestrator',      icon: 'SF' },
  blueprint_orca:   { domain: 'business',   specialty: 'Systems Architect',       icon: 'BO' },
  signal_foxhound:  { domain: 'business',   specialty: 'Signal Engineer',         icon: 'SH' },
  temporal_raven:   { domain: 'all',        specialty: 'Future Strategist',       icon: 'TR' },
  forge_rhino:      { domain: 'development',specialty: 'Release Hardener',        icon: 'FR' },
};

async function callBridge(prompt, systemPrompt = '') {
  try {
    const res = await fetch(`${BRIDGE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], systemPrompt }),
    });
    const data = await res.json();
    return data.message || '[No response]';
  } catch {
    return '[BRIDGE OFFLINE] Connect PromptBridge on :3001 to run live duels.';
  }
}

function DuelCard({ bot, response, score, isWinner, loading }) {
  const color = bot.palette?.primary || '#818cf8';
  return (
    <div style={{
      flex: 1, background: isWinner ? `${color}18` : 'rgba(10,10,20,0.7)',
      border: `1px solid ${isWinner ? color : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12, padding: 16, minWidth: 0, position: 'relative',
      transition: 'all 0.3s ease',
      boxShadow: isWinner ? `0 0 30px ${color}33` : 'none',
    }}>
      {isWinner && (
        <div style={{ position: 'absolute', top: -10, right: 10, background: color, color: '#000', fontSize: 10, fontWeight: 900, padding: '2px 10px', borderRadius: 20 }}>
          ⚡ WINNER
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color }}>
          {bot.icon?.length === 2 ? bot.icon : bot.icon}
        </div>
        <div>
          <div style={{ fontWeight: 800, color, fontSize: 14 }}>{bot.name}</div>
          <div style={{ fontSize: 10, color: '#666' }}>{BOT_DOMAIN_MAP[bot.id]?.specialty || bot.role?.slice(0, 40)}</div>
        </div>
        {score !== undefined && (
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: score >= 80 ? '#4ade80' : score >= 60 ? '#f5c842' : '#f87171' }}>{score}</div>
            <div style={{ fontSize: 9, color: '#444' }}>score</div>
          </div>
        )}
      </div>
      {loading ? (
        <div style={{ color: color, fontSize: 12, fontFamily: 'monospace' }}>
          <span style={{ animation: 'pulse 1s infinite' }}>Generating response...</span>
        </div>
      ) : response ? (
        <div style={{ fontSize: 12, color: '#c0c0e0', lineHeight: 1.6, maxHeight: 220, overflowY: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {response}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>Awaiting duel prompt...</div>
      )}
    </div>
  );
}

function BotPromptAssignment({ bots, promptPack }) {
  return (
    <div style={{ background: 'rgba(10,10,25,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 10 }}>
        🤖 Bot × Prompt Assignment Matrix — {bots.length} Bots × {promptPack?.length || 0} Prompts
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {bots.map(bot => {
          const domainInfo = BOT_DOMAIN_MAP[bot.id];
          const assignedPrompts = promptPack?.filter(p =>
            domainInfo?.domain === 'all' ||
            p.mission?.toLowerCase().includes(domainInfo?.domain) ||
            p.name?.toLowerCase().includes(domainInfo?.specialty?.split(' ')[0]?.toLowerCase())
          ) || [];
          const color = bot.palette?.primary || '#818cf8';
          return (
            <div key={bot.id} style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{bot.icon?.length <= 2 ? bot.icon : '🤖'}</span>
                <span style={{ fontWeight: 700, color, fontSize: 11 }}>{bot.name}</span>
              </div>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{domainInfo?.specialty}</div>
              <div style={{ fontSize: 10, color: '#444' }}>
                {assignedPrompts.length > 0
                  ? `${assignedPrompts.length} prompts assigned`
                  : 'Universal assignments'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EvoDuelEngineView() {
  const [prompt, setPrompt] = useState('');
  const [botA, setBotA] = useState(CORE_CAST[0]);
  const [botB, setBotB] = useState(SENIOR_CAST[0]);
  const [responseA, setResponseA] = useState('');
  const [responseB, setResponseB] = useState('');
  const [scoreA, setScoreA] = useState(undefined);
  const [scoreB, setScoreB] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [duels, setDuels] = useState([]);
  const [activeTab, setActiveTab] = useState('duel');
  const [promptPack, setPromptPack] = useState([]);

  useEffect(() => {
    fetch('/src/prompthouse_50_master_build_prompts.json')
      .then(r => r.json())
      .then(d => setPromptPack(d.features || []))
      .catch(() => setPromptPack([]));
  }, []);

  const runDuel = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponseA(''); setResponseB('');
    setScoreA(undefined); setScoreB(undefined);

    const sysA = `You are ${botA.name} (${botA.species}). Role: ${botA.role}. Signature: ${botA.signature}. Respond in character.`;
    const sysB = `You are ${botB.name} (${botB.species}). Role: ${botB.role}. Signature: ${botB.signature}. Respond in character.`;

    const [resA, resB] = await Promise.all([
      callBridge(prompt, sysA),
      callBridge(prompt, sysB),
    ]);

    setResponseA(resA);
    setResponseB(resB);

    const sA = scorePrompt(prompt, botA.id, resA, 'development', 'autonomous');
    const sB = scorePrompt(prompt, botB.id, resB, 'development', 'autonomous');
    setScoreA(sA);
    setScoreB(sB);

    const record = { id: Date.now(), prompt, botA: botA.id, botB: botB.id, scoreA: sA, scoreB: sB, winner: sA >= sB ? botA.id : botB.id };
    setDuels(prev => [record, ...prev].slice(0, 20));
    setLoading(false);
  };

  const winner = scoreA !== undefined && scoreB !== undefined
    ? (scoreA >= scoreB ? 'A' : 'B')
    : null;

  const btn = (color = '#818cf8', active = false) => ({
    background: active ? `linear-gradient(135deg, ${color}44, ${color}22)` : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
    color: active ? color : '#a0a0c0',
    padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
    fontSize: 12, fontWeight: active ? 700 : 400, transition: 'all 0.2s',
  });

  return (
    <div style={{ padding: 16, fontFamily: "'Inter', sans-serif", color: '#e0e0ff', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, background: 'linear-gradient(90deg, #f5c842, #ec4899, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⚔️ Evo Duel Engine
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#666' }}>
            21-bot competitive arena — 300+ prompts assigned per bot specialty — powered by PromptBridge
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['duel', 'matrix', 'history'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={btn('#818cf8', activeTab === t)}>
              {t === 'duel' ? '⚔️ Duel' : t === 'matrix' ? '🤖 Bot Matrix' : '📜 History'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'duel' && (
        <>
          {/* Bot Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: 10, color: '#666', marginBottom: 4, display: 'block' }}>BOT A (Challenger)</label>
              <select value={botA.id} onChange={e => setBotA(ALL_BOT_ROSTER.find(b => b.id === e.target.value))}
                style={{ width: '100%', background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 8, padding: '8px 10px', color: '#e0e0ff', fontSize: 13 }}>
                {ALL_BOT_ROSTER.map(b => <option key={b.id} value={b.id}>{b.icon?.length <= 2 ? b.icon : '🤖'} {b.name} — {BOT_DOMAIN_MAP[b.id]?.specialty || 'General'}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 24, textAlign: 'center', color: '#f5c842' }}>⚔️</div>
            <div>
              <label style={{ fontSize: 10, color: '#666', marginBottom: 4, display: 'block' }}>BOT B (Defender)</label>
              <select value={botB.id} onChange={e => setBotB(ALL_BOT_ROSTER.find(b => b.id === e.target.value))}
                style={{ width: '100%', background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 8, padding: '8px 10px', color: '#e0e0ff', fontSize: 13 }}>
                {ALL_BOT_ROSTER.map(b => <option key={b.id} value={b.id}>{b.icon?.length <= 2 ? b.icon : '🤖'} {b.name} — {BOT_DOMAIN_MAP[b.id]?.specialty || 'General'}</option>)}
              </select>
            </div>
          </div>

          {/* Prompt Input */}
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Enter a duel prompt... Both bots respond in their unique voice and specialty. The highest scorer wins."
            style={{ width: '100%', minHeight: 80, background: '#0a0a18', border: '1px solid #2a2a4a', borderRadius: 8, padding: '10px 14px', color: '#e0e0ff', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
          />

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={runDuel} disabled={loading || !prompt.trim()}
              style={{ background: loading ? '#333' : 'linear-gradient(135deg, #f5c842, #ec4899)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 900, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', flex: 1, transition: 'all 0.2s' }}>
              {loading ? '⏳ Dueling...' : '⚔️ Start Duel'}
            </button>
            <button onClick={() => { setResponseA(''); setResponseB(''); setScoreA(undefined); setScoreB(undefined); setPrompt(''); }}
              style={{ ...btn('#f87171'), padding: '10px 16px' }}>Clear</button>
          </div>

          {/* Duel Arena */}
          <div style={{ display: 'flex', gap: 12 }}>
            <DuelCard bot={botA} response={responseA} score={scoreA} isWinner={winner === 'A'} loading={loading && !responseA} />
            <DuelCard bot={botB} response={responseB} score={scoreB} isWinner={winner === 'B'} loading={loading && !responseB} />
          </div>

          {/* Grade Breakdown */}
          {scoreA !== undefined && scoreB !== undefined && (
            <div style={{ marginTop: 12, background: 'rgba(10,10,25,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-around' }}>
              {[{ bot: botA, score: scoreA }, { bot: botB, score: scoreB }].map(({ bot, score }) => {
                const grade = getGrade(score);
                const color = bot.palette?.primary || '#818cf8';
                return (
                  <div key={bot.id} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{bot.name}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: score >= 80 ? '#4ade80' : score >= 60 ? '#f5c842' : '#f87171' }}>{score}</div>
                    <div style={{ fontSize: 10, color }}>{ grade.label }</div>
                  </div>
                );
              })}
              <div style={{ textAlign: 'center', alignSelf: 'center' }}>
                <div style={{ fontSize: 11, color: '#a0a0c0', marginBottom: 4 }}>Winner</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#f5c842' }}>
                  {winner === 'A' ? botA.name : botB.name} ⚡
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'matrix' && (
        <BotPromptAssignment bots={ALL_BOT_ROSTER} promptPack={promptPack} />
      )}

      {activeTab === 'history' && (
        <div style={{ background: 'rgba(10,10,25,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 10 }}>Duel History ({duels.length})</div>
          {duels.length === 0 ? (
            <div style={{ color: '#444', fontSize: 12, fontStyle: 'italic' }}>No duels yet. Start a duel to see history.</div>
          ) : duels.map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a2e', fontSize: 11 }}>
              <span style={{ color: '#818cf8' }}>{ALL_BOT_ROSTER.find(b => b.id === d.botA)?.name} vs {ALL_BOT_ROSTER.find(b => b.id === d.botB)?.name}</span>
              <span style={{ color: '#a0a0c0', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.prompt.slice(0, 40)}...</span>
              <span style={{ color: '#f5c842' }}>Winner: {ALL_BOT_ROSTER.find(b => b.id === d.winner)?.name}</span>
              <span style={{ color: '#4ade80' }}>{d.scoreA} vs {d.scoreB}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
