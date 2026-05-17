import React, { useState, useEffect } from 'react';
import TruthBadge from './TruthBadge.jsx';
import { getHandoverStatus } from '../services/handover-client.js';
import { TRUTH_STATES } from '../constants/truth-states.js';
import { AlertCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function HandoverStatusPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      const res = await getHandoverStatus();
      if (mounted) {
        setStatus(res);
        setLoading(false);
      }
    };
    fetchStatus();
    // Refresh periodically
    const interval = setInterval(fetchStatus, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="proof-panel loading" style={{ padding: '20px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--text-muted)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span>Loading Handover Status...</span>
        </div>
      </div>
    );
  }

  if (!status || status.truthState === TRUTH_STATES.ERROR) {
    return (
      <div className="proof-panel error" style={{ padding: '20px', border: '1px solid var(--accent-red-dim)', borderRadius: 'var(--radius-md)', background: 'rgba(248, 113, 113, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
            <AlertCircle size={18} />
            Sovereign Handover Status
          </h3>
          <TruthBadge state={TRUTH_STATES.ERROR} />
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
          Unable to fetch handover status. Ensure the backend bridge is running.
        </p>
      </div>
    );
  }

  const { data } = status;

  return (
    <div className="proof-panel" style={{ padding: '20px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} />
          Sovereign Handover Status
        </h3>
        <TruthBadge state={status.truthState} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Report Generation Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-surface)', borderRadius: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Handover Report</span>
          {data.reportGenerated ? (
            <span style={{ fontSize: '13px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Generated
            </span>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--accent-orange)' }}>Missing (Run npm run handover:report)</span>
          )}
        </div>

        {/* Security Gates Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-dim)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <ShieldAlert size={14} /> Security Mandates
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Production Deploy</span>
            <span style={{ color: data.productionDeployBlocked ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 500 }}>
              {data.productionDeployBlocked ? 'BLOCKED ✅' : 'ALLOWED ❌'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Live Billing</span>
            <span style={{ color: data.liveBillingBlocked ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 500 }}>
              {data.liveBillingBlocked ? 'BLOCKED ✅' : 'ALLOWED ❌'}
            </span>
          </div>
        </div>

        {/* Blockers */}
        {data.blockers && data.blockers.length > 0 && (
          <div style={{ padding: '12px', background: 'rgba(251, 146, 60, 0.05)', border: '1px solid var(--accent-orange-dim)', borderRadius: '6px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-orange)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Remaining Blockers
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {data.blockers.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        )}

        {/* Next Actions */}
        {data.nextSafeActions && data.nextSafeActions.length > 0 && (
          <div style={{ marginTop: '5px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Next Safe Actions
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-dim)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.nextSafeActions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
