import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getDeploymentReadiness } from '../services/deployment-client.js';

export default function DeploymentReadinessPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getDeploymentReadiness().then(res => {
      if (!active) return;
      if (res.ok && res.data) setData(res.data);
      else setError(res.error || 'Bridge unavailable');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const icon = (passed) => passed
    ? <CheckCircle2 size={14} color="var(--accent-green)" />
    : <XCircle size={14} color="var(--accent-red)" />;

  return (
    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Deployment Readiness</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Pre-Flight Checks</div>
        </div>
        {data && <div style={{ marginLeft: 'auto' }}><TruthBadge state={data.truthState} compact /></div>}
      </div>

      {loading && <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading readiness checks...</div>}
      {error && <div style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Error: {error}</div>}

      {data?.checks && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.checks.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon(c.passed)}
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{c.label}</span>
              </div>
              <TruthBadge state={c.truthState} compact />
            </div>
          ))}
        </div>
      )}

      {data?.blockers?.length > 0 && (
        <div style={{ padding: '12px', background: 'var(--accent-red-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', marginBottom: '6px' }}>Blockers</div>
          {data.blockers.map((b, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {b.detail || b.label || b}</div>
          ))}
        </div>
      )}

      {data?.warnings?.length > 0 && (
        <div style={{ padding: '12px', background: 'var(--accent-orange-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(251,146,60,0.2)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-orange)', textTransform: 'uppercase', marginBottom: '6px' }}>Warnings</div>
          {data.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {w.detail || w}</div>
          ))}
        </div>
      )}

      {data?.nextActions?.length > 0 && (
        <div style={{ padding: '12px', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>Next Actions</div>
          {data.nextActions.map((a, i) => (
            <div key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>→ {a}</div>
          ))}
        </div>
      )}
    </div>
  );
}
