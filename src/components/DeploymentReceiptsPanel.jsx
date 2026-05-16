import React, { useState, useEffect } from 'react';
import { Activity, Clock, ExternalLink } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getDeploymentReceipts } from '../services/deployment-client.js';

export default function DeploymentReceiptsPanel() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getDeploymentReceipts(20).then(res => {
      if (!active) return;
      if (res.ok && res.data?.receipts) setReceipts(res.data.receipts);
      else setError(res.error || 'Bridge unavailable');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={18} color="var(--accent-violet)" />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Deployment Receipts</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Action History</div>
        </div>
      </div>

      {loading && <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading receipts...</div>}
      {error && <div style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Error: {error}</div>}

      {!loading && receipts.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>No deployment receipts yet.</div>
      )}

      {receipts.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '11px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{r.action}</span>
              <span style={{ color: 'var(--text-dim)' }}>{r.provider}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{r.message}</div>
            {r.deploymentUrl && (
              <a href={r.deploymentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={10} /> {r.deploymentUrl}
              </a>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <TruthBadge state={r.truthState} compact />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={9} /> {new Date(r.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
