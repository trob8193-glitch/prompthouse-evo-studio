import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, ExternalLink, Activity, History } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getStripeCheckoutBrowserRunStatus, listStripeBrowserRunRecords } from '../services/stripe-checkout-browser-run-client.js';

export default function StripeCheckoutBrowserVerificationPanel() {
  const [status, setStatus] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [statusRes, recordsRes] = await Promise.all([
          getStripeCheckoutBrowserRunStatus(),
          listStripeBrowserRunRecords(5)
        ]);
        if (cancelled) return;
        if (statusRes.ok) setStatus(statusRes.data);
        if (recordsRes.ok) setRecords(recordsRes.data);
      } catch (err) {
        console.error('Failed to fetch Stripe browser run status:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const panelStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  };

  if (loading && !status) {
    return <div style={panelStyle}>Loading Stripe verification...</div>;
  }

  const { ok, mode, truthState, latestRun, reason } = status || {};

  return (
    <div style={panelStyle} id="stripe-checkout-browser-verification-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={18} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Stripe Browser Verification</span>
        </div>
        <TruthBadge state={truthState || 'UNKNOWN'} compact />
      </div>

      <div style={{ marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-top)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Stripe Mode:</span>
          <span style={{ fontWeight: 700, color: ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>{mode || 'N/A'}</span>
        </div>
        {!ok && reason && (
          <div style={{ fontSize: '11px', color: 'var(--accent-orange)', marginTop: '4px' }}>{reason}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Live Billing:</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-red)' }}>BLOCKED (Phase 16B)</span>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Activity size={14} color="var(--accent-indigo)" /> Latest Browser Run
        </div>
        {latestRun ? (
          <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>{latestRun.id}</span>
              <span style={{ 
                color: latestRun.status === 'TEST_PAYMENT_COMPLETED' ? 'var(--accent-green)' : 'var(--accent-indigo)',
                fontWeight: 700, fontSize: '10px'
              }}>
                {latestRun.status}
              </span>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: '10px', marginBottom: '8px' }}>
              Created: {new Date(latestRun.createdAt).toLocaleString()}
            </div>
            <a href={latestRun.checkoutUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
              View Checkout Session <ExternalLink size={10} />
            </a>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No browser runs recorded yet.</div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <History size={14} color="var(--text-secondary)" /> Recent Logs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {records.length > 0 ? records.map(run => (
            <div key={run.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontFamily: 'monospace' }}>{run.id}</span>
              <span style={{ fontWeight: 600, color: run.status === 'TEST_PAYMENT_COMPLETED' ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                {run.status === 'TEST_PAYMENT_COMPLETED' ? 'VERIFIED ✓' : run.status}
              </span>
            </div>
          )) : (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>No history found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
