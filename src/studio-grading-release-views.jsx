import React, { useState, useEffect } from 'react';
import { scorePrompt, getGrade, getBarColor, CORE_CAST, SENIOR_CAST, ALL_BOT_ROSTER } from './engine.js';

const BRIDGE = 'http://localhost:3001';

async function callBridge(prompt, systemPrompt = '') {
  try {
    const res = await fetch(`${BRIDGE}/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], systemPrompt }),
    });
    const data = await res.json();
    return data.message || '[No response]';
  } catch { return '[BRIDGE OFFLINE]'; }
}

// ── Grade Display Card ──
function GradeCard({ score, label, detail, color }) {
  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}44`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color, marginBottom: 4 }}>{score}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: '#666' }}>{detail}</div>
      <div style={{ marginTop: 8, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(score, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export function StudioGradingSystemView() {
  const [userInput, setUserInput] = useState('');
  const [domain, setDomain] = useState('development');
  const [strictness, setStrictness] = useState('autonomous');
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiVerdict, setAiVerdict] = useState('');
  const [history, setHistory] = useState([]);

  const runGrading = async () => {
    if (!userInput.trim()) return;
    setLoading(true); setAiVerdict('');

    // Score via engine
    const promptScore = scorePrompt(userInput, '', '', domain, strictness);
    const completenessScore = Math.min(100, Math.round((userInput.length / 500) * 100));
    const clarityScore = /\b(build|create|implement|audit|generate|design|fix|analyze)\b/i.test(userInput) ? 85 : 55;
    const overall = Math.round((promptScore * 0.4) + (completenessScore * 0.3) + (clarityScore * 0.3));

    const grade = getGrade(overall);
    setScores({ promptScore, completenessScore, clarityScore, overall, grade });

    // Get AI verdict
    const verdict = await callBridge(
      `Grade this user prompt on a scale of 0-100 and provide a 2-sentence coaching tip:\n\n"${userInput}"\n\nCurrent machine score: ${overall}/100 (${grade.label}). Domain: ${domain}. Mode: ${strictness}.`,
      'You are Eval Mantis, the prompt evaluation scientist. Score, classify, and coach. Be honest and specific. Return: SCORE: X/100, GRADE: label, TIP: coaching advice.'
    );
    setAiVerdict(verdict);

    const record = { ts: Date.now(), input: userInput.slice(0, 60), overall, grade: grade.label };
    setHistory(prev => [record, ...prev].slice(0, 10));
    setLoading(false);
  };

  const domainColors = { development: '#22d3ee', business: '#4ade80', legal: '#fb923c', creative: '#8b5cf6' };
  const color = domainColors[domain] || '#818cf8';

  return (
    <div style={{ padding: 16, fontFamily: "'Inter', sans-serif", color: '#e0e0ff', minHeight: '100%' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg, #4ade80, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        🏆 Studio Grading System
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 11, color: '#666' }}>
        Prompt quality scoring · User grading · AI coaching via Eval Mantis
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {['development', 'business', 'legal', 'creative'].map(d => (
          <button key={d} onClick={() => setDomain(d)} style={{
            background: domain === d ? `${domainColors[d]}22` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${domain === d ? domainColors[d] : 'rgba(255,255,255,0.1)'}`,
            color: domain === d ? domainColors[d] : '#666', borderRadius: 6, padding: '5px 12px', fontSize: 11,
            cursor: 'pointer', fontWeight: domain === d ? 700 : 400,
          }}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        {['autonomous', 'production', 'balanced'].map(m => (
          <button key={m} onClick={() => setStrictness(m)} style={{
            background: strictness === m ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${strictness === m ? '#f5c842' : 'rgba(255,255,255,0.1)'}`,
            color: strictness === m ? '#f5c842' : '#666', borderRadius: 6, padding: '5px 12px', fontSize: 11,
            cursor: 'pointer', fontWeight: strictness === m ? 700 : 400,
          }}>{m}</button>
        ))}
      </div>

      <textarea value={userInput} onChange={e => setUserInput(e.target.value)}
        placeholder="Enter your prompt, task description, or user story to grade it..."
        style={{ width: '100%', minHeight: 100, background: '#0a0a18', border: '1px solid #2a2a4a', borderRadius: 8, padding: '10px 14px', color: '#e0e0ff', fontSize: 13, resize: 'vertical', marginBottom: 10, boxSizing: 'border-box' }} />

      <button onClick={runGrading} disabled={loading || !userInput.trim()} style={{
        width: '100%', background: loading ? '#333' : `linear-gradient(135deg, #4ade80, #22d3ee)`,
        color: '#000', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 900, fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16,
      }}>
        {loading ? '⏳ Grading...' : '🏆 Run Grade & Score'}
      </button>

      {scores && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            <GradeCard score={scores.overall} label={scores.grade.label} detail="Overall Grade" color={scores.overall >= 90 ? '#f5c842' : scores.overall >= 80 ? '#8b5cf6' : scores.overall >= 70 ? '#22d3ee' : '#f87171'} />
            <GradeCard score={scores.promptScore} label="Prompt Quality" detail="Stack strength" color="#22d3ee" />
            <GradeCard score={scores.completenessScore} label="Completeness" detail="Depth & detail" color="#4ade80" />
            <GradeCard score={scores.clarityScore} label="Action Clarity" detail="Intent signal" color="#8b5cf6" />
          </div>

          {aiVerdict && (
            <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>🦎 Eval Mantis Verdict</div>
              <div style={{ fontSize: 12, color: '#c0c0e0', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{aiVerdict}</div>
            </div>
          )}

          {history.length > 0 && (
            <div style={{ background: 'rgba(10,10,25,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 8 }}>Session History</div>
              {history.map(h => (
                <div key={h.ts} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1a1a2e', fontSize: 11 }}>
                  <span style={{ color: '#a0a0c0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{h.input}...</span>
                  <span style={{ color: h.overall >= 80 ? '#4ade80' : h.overall >= 60 ? '#f5c842' : '#f87171', fontWeight: 700, marginLeft: 12 }}>{h.overall} — {h.grade}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Self-Release Gate UI ──
export function SelfReleaseGateView() {
  const [checks, setChecks] = useState({
    codeExists: false, apiExists: false, dataPersists: false, testsPassed: false,
    proofExists: false, failureStatesWork: false, docsExist: false, rollbackWorks: false,
    observabilityEvent: false, canonVerified: false, noPlaceholders: false, noFakeCompletion: false,
  });
  const [notes, setNotes] = useState({});
  const [releaseVerdict, setReleaseVerdict] = useState(null);
  const [aiGate, setAiGate] = useState('');
  const [loadingGate, setLoadingGate] = useState(false);
  const [featureName, setFeatureName] = useState('');

  const checkList = [
    { id: 'codeExists', label: 'Code exists and is committed', icon: '💾', critical: true },
    { id: 'apiExists', label: 'API exists or explicitly not required', icon: '🌐', critical: true },
    { id: 'dataPersists', label: 'Data persists across sessions', icon: '🗃️', critical: true },
    { id: 'testsPassed', label: 'Tests pass (unit, integration, e2e)', icon: '✅', critical: true },
    { id: 'proofExists', label: 'Proof evidence documented', icon: '📜', critical: true },
    { id: 'failureStatesWork', label: 'Failure states handle all edge cases', icon: '🛡️', critical: true },
    { id: 'docsExist', label: 'Documentation exists', icon: '📖', critical: false },
    { id: 'rollbackWorks', label: 'Rollback plan validated', icon: '↩️', critical: true },
    { id: 'observabilityEvent', label: 'Observability event fires', icon: '👁️', critical: false },
    { id: 'canonVerified', label: 'Canon drift check passed', icon: '⚖️', critical: true },
    { id: 'noPlaceholders', label: 'Zero placeholders or stubs remain', icon: '🚫', critical: true },
    { id: 'noFakeCompletion', label: 'No fake completion claims', icon: '🔍', critical: true },
  ];

  const criticalChecks = checkList.filter(c => c.critical);
  const passedCritical = criticalChecks.filter(c => checks[c.id]).length;
  const totalPassed = Object.values(checks).filter(Boolean).length;
  const allCriticalPassed = passedCritical === criticalChecks.length;
  const readiness = Math.round((totalPassed / checkList.length) * 100);

  const runAIGate = async () => {
    setLoadingGate(true); setAiGate('');
    const failed = checkList.filter(c => !checks[c.id]).map(c => c.label);
    const passed = checkList.filter(c => checks[c.id]).map(c => c.label);
    const verdict = await callBridge(
      `Feature: "${featureName || 'Unnamed Feature'}"\n\nPassed gates: ${passed.join(', ')}\nFailed gates: ${failed.join(', ')}\nReadiness: ${readiness}%\n\nSovereign Release Gate: Is this feature READY or NOT READY to ship? List exact blockers and required fixes.`,
      `You are Forge Rhino — the Release Hardening Engineer. You block fake shipping. You demand receipts. Return: READY or NOT READY, then list exact blockers if not ready.`
    );
    setAiGate(verdict);
    setReleaseVerdict(allCriticalPassed ? 'READY' : 'NOT READY');
    setLoadingGate(false);
  };

  const toggle = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ padding: 16, fontFamily: "'Inter', sans-serif", color: '#e0e0ff', minHeight: '100%' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg, #f97316, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        🦏 Self-Release Gate
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 11, color: '#666' }}>
        12-gate production readiness checker · Powered by Forge Rhino · No fake shipping
      </p>

      <input value={featureName} onChange={e => setFeatureName(e.target.value)}
        placeholder="Feature name..."
        style={{ width: '100%', background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 8, padding: '8px 14px', color: '#e0e0ff', fontSize: 13, marginBottom: 12, boxSizing: 'border-box' }} />

      {/* Readiness meter */}
      <div style={{ marginBottom: 16, background: 'rgba(10,10,25,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#666' }}>Release Readiness</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: allCriticalPassed ? '#4ade80' : readiness > 60 ? '#f5c842' : '#f87171' }}>{readiness}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${readiness}%`, background: allCriticalPassed ? '#4ade80' : readiness > 60 ? '#f5c842' : '#f87171', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
          {passedCritical}/{criticalChecks.length} critical gates · {totalPassed}/{checkList.length} total
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
        {checkList.map(c => (
          <div key={c.id} onClick={() => toggle(c.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: checks[c.id] ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${checks[c.id] ? '#4ade8044' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checks[c.id] ? '#4ade80' : '#444'}`,
              background: checks[c.id] ? '#4ade80' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {checks[c.id] && <span style={{ color: '#000', fontSize: 11, fontWeight: 900 }}>✓</span>}
            </div>
            <span style={{ fontSize: 11 }}>{c.icon}</span>
            <span style={{ fontSize: 11, color: checks[c.id] ? '#c0c0e0' : '#666', flex: 1 }}>{c.label}</span>
            {c.critical && <span style={{ fontSize: 9, color: '#f87171', fontWeight: 700 }}>REQ</span>}
          </div>
        ))}
      </div>

      <button onClick={runAIGate} disabled={loadingGate} style={{
        width: '100%', background: loadingGate ? '#333' : allCriticalPassed ? 'linear-gradient(135deg, #4ade80, #22d3ee)' : 'linear-gradient(135deg, #f97316, #ef4444)',
        color: '#000', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 900, fontSize: 14,
        cursor: loadingGate ? 'not-allowed' : 'pointer', marginBottom: 12,
      }}>
        {loadingGate ? '⏳ Forge Rhino Reviewing...' : '🦏 Run AI Release Gate'}
      </button>

      {releaseVerdict && (
        <div style={{ background: releaseVerdict === 'READY' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${releaseVerdict === 'READY' ? '#4ade80' : '#ef4444'}55`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: releaseVerdict === 'READY' ? '#4ade80' : '#ef4444', marginBottom: 8 }}>
            {releaseVerdict === 'READY' ? '✅ RELEASE APPROVED' : '🚫 NOT READY TO SHIP'}
          </div>
          {aiGate && <div style={{ fontSize: 11, color: '#c0c0e0', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{aiGate}</div>}
        </div>
      )}
    </div>
  );
}
