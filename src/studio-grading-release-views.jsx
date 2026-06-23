import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { safeFetchBridge } from './config/bridge-config.js';

/**
 * PH EVO STUDIO — GRADING & RELEASE VIEWS (ENTERPRISE GRADE)
 * Prompt scoring engine and 12-gate self-release checker.
 */

export function StudioGradingSystemView() {
  const [prompt, setPrompt] = useState('');
  const [score, setScore] = useState(null);
  const [label, setLabel] = useState('');
  const [grading, setGrading] = useState(false);

  const gradePrompt = async () => {
    if (!prompt.trim()) return;
    setGrading(true);
    try {
      const res = await safeFetchBridge('/api/grading/prompt', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });
      if (res.ok && res.data) {
        setScore(res.data.score);
        setLabel(res.data.truthState);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGrading(false);
    }
  };

  const gradeColor = (s) => s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';
  const humanLabel = (s) => {
    if (s === 'PROMPT_PROOF_READY') return 'Proof Ready';
    if (s === 'PROMPT_NEEDS_REFINEMENT') return 'Needs Refinement';
    return 'Draft Quality';
  };

  return (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Award size={16} color="#f59e0b" />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Prompt Grading Engine</span>
      </div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Paste a prompt to grade..."
        style={{ width: '100%', minHeight: 120, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14, color: '#e2e8f0', fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif', outline: 'none', resize: 'vertical', marginBottom: 12 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={gradePrompt} disabled={grading}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#4f46e5', color: 'white', cursor: grading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, opacity: grading ? 0.7 : 1 }}>
          {grading ? 'Grading...' : 'Grade Prompt'}
        </button>
        {score !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: gradeColor(score) }}>{score}%</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: gradeColor(score) }}>{humanLabel(label)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const RELEASE_GATES = [
  { id: 'build_compiles', label: 'Build compiles without errors', category: 'Build' },
  { id: 'no_console_errors', label: 'No console errors at runtime', category: 'Build' },
  { id: 'apis_respond', label: 'All API endpoints respond', category: 'API' },
  { id: 'auth_verified', label: 'Authentication flow verified', category: 'API' },
  { id: 'chat_active', label: 'Chat produces real AI responses', category: 'Core' },
  { id: 'metrics_live', label: 'Dashboard shows live metrics', category: 'Core' },
  { id: 'routes_valid', label: 'Navigation routes to all pages', category: 'UI' },
  { id: 'mobile_ready', label: 'Mobile viewport renders correctly', category: 'UI' },
  { id: 'no_artifacts', label: 'No non-executable artifacts visible', category: 'Quality' },
  { id: 'error_boundaries', label: 'Error boundaries catch crashes', category: 'Quality' },
  { id: 'security_redacted', label: 'Sensitive data redacted in logs', category: 'Security' },
  { id: 'perf_optimized', label: 'Production build under 500KB gzip', category: 'Performance' },
];

export function SelfReleaseGateView() {
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(false);
  const passed = Object.values(checked).filter(Boolean).length;

  const runVerification = async () => {
    setLoading(true);
    try {
      const res = await safeFetchBridge('/api/grading/release-gates');
      if (res.ok && res.data) {
        setChecked(res.data.gates || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>12-Gate Release Checker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={runVerification} disabled={loading} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Verifying...' : 'Auto-Verify'}
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: passed === 12 ? '#22c55e' : '#f59e0b' }}>
            {passed}/12 Passed
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {RELEASE_GATES.map((gate) => (
          <div key={gate.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: checked[gate.id] ? 'rgba(34,197,94,0.05)' : 'transparent', border: `1px solid ${checked[gate.id] ? '#22c55e22' : '#1e293b'}` }}>
            {checked[gate.id] ? <CheckCircle2 size={14} color="#22c55e" /> : <XCircle size={14} color="#334155" />}
            <span style={{ fontSize: 12, color: checked[gate.id] ? '#94a3b8' : '#64748b', flex: 1 }}>{gate.label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{gate.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
