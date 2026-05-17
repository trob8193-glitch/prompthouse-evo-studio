import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, Shield } from 'lucide-react';

/**
 * PH EVO STUDIO — GRADING & RELEASE VIEWS (ENTERPRISE GRADE)
 * Prompt scoring engine and 12-gate self-release checker.
 */

export function StudioGradingSystemView() {
  const [prompt, setPrompt] = useState('');
  const [score, setScore] = useState(null);

  const gradePrompt = () => {
    if (!prompt.trim()) return;
    const len = prompt.length;
    const hasSystem = /system|role|persona/i.test(prompt);
    const hasConstraints = /must|never|always|constraint/i.test(prompt);
    const hasOutput = /output|format|return|respond/i.test(prompt);
    const hasExamples = /example|e\.g\.|for instance/i.test(prompt);
    let s = 20;
    if (len > 50) s += 10;
    if (len > 200) s += 15;
    if (len > 500) s += 10;
    if (hasSystem) s += 15;
    if (hasConstraints) s += 10;
    if (hasOutput) s += 10;
    if (hasExamples) s += 10;
    setScore(Math.min(s, 100));
  };

  const gradeColor = (s) => s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';
  const gradeLabel = (s) => s >= 80 ? 'Production Ready' : s >= 50 ? 'Needs Refinement' : 'Draft Quality';

  return (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Award size={16} color="#f59e0b" />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Prompt Grading Engine</span>
      </div>
<<<<<<< HEAD
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} ghostInput="Paste a prompt to grade..."
=======
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Paste a prompt to grade..."
>>>>>>> main
        style={{ width: '100%', minHeight: 120, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14, color: '#e2e8f0', fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', resize: 'vertical', marginBottom: 12 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={gradePrompt}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
          Grade Prompt
        </button>
        {score !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: gradeColor(score) }}>{score}%</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: gradeColor(score) }}>{gradeLabel(score)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const RELEASE_GATES = [
  { id: 1, label: 'Build compiles without errors', category: 'Build' },
  { id: 2, label: 'No console errors at runtime', category: 'Build' },
  { id: 3, label: 'All API endpoints respond', category: 'API' },
  { id: 4, label: 'Authentication flow verified', category: 'API' },
  { id: 5, label: 'Chat produces real AI responses', category: 'Core' },
  { id: 6, label: 'Dashboard shows live metrics', category: 'Core' },
  { id: 7, label: 'Navigation routes to all pages', category: 'UI' },
  { id: 8, label: 'Mobile viewport renders correctly', category: 'UI' },
<<<<<<< HEAD
  { id: 9, label: 'No non-executable artifacts visible', category: 'Quality' },
=======
  { id: 9, label: 'No placeholder or stub content visible', category: 'Quality' },
>>>>>>> main
  { id: 10, label: 'Error boundaries catch crashes', category: 'Quality' },
  { id: 11, label: 'Sensitive data redacted in logs', category: 'Security' },
  { id: 12, label: 'Production build under 500KB gzip', category: 'Performance' },
];

export function SelfReleaseGateView() {
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const passed = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>12-Gate Release Checker</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: passed === 12 ? '#22c55e' : '#f59e0b' }}>
          {passed}/12 Passed
        </span>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {RELEASE_GATES.map((gate) => (
          <label key={gate.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: checked[gate.id] ? 'rgba(34,197,94,0.05)' : 'transparent', border: `1px solid ${checked[gate.id] ? '#22c55e22' : '#1e293b'}` }}>
            <input type="checkbox" checked={!!checked[gate.id]} onChange={() => toggle(gate.id)} style={{ accentColor: '#22c55e', width: 14, height: 14 }} />
            {checked[gate.id] ? <CheckCircle2 size={14} color="#22c55e" /> : <XCircle size={14} color="#334155" />}
            <span style={{ fontSize: 12, color: checked[gate.id] ? '#94a3b8' : '#64748b', flex: 1 }}>{gate.label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{gate.category}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
