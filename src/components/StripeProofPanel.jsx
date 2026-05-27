import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Activity, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import OwnerApprovalPanel from './OwnerApprovalPanel.jsx';
import { OWNER_APPROVAL_SCOPES } from '../services/owner-approval-client.js';
import { getStripeStatus, runStripeAccountProbe } from '../services/stripe-status-client.js';

export default function StripeProofPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [probeResult, setProbeResult] = useState(null);
  const [probeLoading, setProbeLoading] = useState(false);
  const [probeError, setProbeError] = useState(null);
  
  const [approvalEnvelope, setApprovalEnvelope] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await getStripeStatus();
      if (result.ok && result.data) {
        setStatus(result.data);
      } else {
        setError(result.error || 'Failed to fetch Stripe status');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleProbe = async () => {
    if (!approvalEnvelope) return;
    setProbeLoading(true);
    setProbeError(null);
    setProbeResult(null);

    try {
      const result = await runStripeAccountProbe(approvalEnvelope);
      if (result.ok) {
        setProbeResult(result.data);
      } else {
        setProbeError(result.error || 'Probe failed.');
      }
    } catch (err) {
      setProbeError(err.message);
    } finally {
      setProbeLoading(false);
      // Re-fetch status to ensure TRUTH_STATE syncs
      fetchStatus();
    }
  };

  const handleApprovalGranted = (envelope) => {
    setApprovalEnvelope(envelope);
  };

  const panelStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  };

  const headerStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '16px', justifyContent: 'space-between',
  };

  if (loading) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="var(--accent-indigo)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Stripe Test-Mode Proof</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading Stripe status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="var(--accent-red)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Stripe Test-Mode Proof</span>
          </div>
          <TruthBadge state="ERROR" compact />
        </div>
        <p style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Bridge unavailable: {error}</p>
      </div>
    );
  }

  const { configured, mode, safeForLocalTest, truthState, blockedReason, nextAction } = status || {};

  return (
    <div style={panelStyle} id="stripe-proof-panel">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={16} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Stripe Test-Mode Proof</span>
        </div>
        <TruthBadge state={truthState || 'UNVERIFIED'} compact />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Configuration</span>
          <span style={{ fontWeight: 600, color: configured ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
            {configured ? '✓ Key Present' : 'Missing'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Detected Mode</span>
          <span style={{ fontWeight: 600, color: mode === 'test' ? 'var(--accent-green)' : mode === 'live' ? 'var(--accent-red)' : 'var(--text-dim)' }}>
            {mode === 'test' ? 'TEST (sk_test_)' : mode === 'live' ? 'LIVE (sk_live_)' : 'UNKNOWN'}
          </span>
        </div>
      </div>

      {blockedReason && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <AlertTriangle size={14} color="var(--accent-red)" style={{ marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--accent-red)' }}>BLOCKED</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--accent-red)', lineHeight: 1.4 }}>{blockedReason}</p>
            </div>
          </div>
        </div>
      )}

        {nextAction && !blockedReason && (
        <div style={{ background: 'var(--bg-surface)', borderRadius: '6px', padding: '12px', marginBottom: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <strong>Next Action:</strong> {nextAction}
        </div>
      )}

      {/* Account Probe Section */}
      <div style={{ borderTop: '1px solid var(--border-mid)', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} /> Account Probe
        </div>
        
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
          Probes test metadata. Does not create customers, charges, or checkout sessions. Requires Commerce scope approval.
        </p>

        <OwnerApprovalPanel 
          scope={OWNER_APPROVAL_SCOPES.COMMERCE}
          title="Commerce Action"
          description="Approve test-mode Stripe account probe."
          riskLevel="critical"
          compact
          onApprovalGranted={handleApprovalGranted}
        />

        <button 
          onClick={handleProbe}
          disabled={!safeForLocalTest || !approvalEnvelope || probeLoading}
          style={{
            marginTop: '12px', width: '100%', padding: '10px', borderRadius: '6px',
            background: (!safeForLocalTest || !approvalEnvelope) ? 'var(--bg-surface)' : 'var(--accent-indigo)',
            color: (!safeForLocalTest || !approvalEnvelope) ? 'var(--text-dim)' : '#fff',
            border: 'none', cursor: (!safeForLocalTest || !approvalEnvelope) ? 'not-allowed' : 'pointer',
            fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
            opacity: probeLoading ? 0.7 : 1
          }}
        >
          <Search size={14} />
          {probeLoading ? 'Probing...' : 'Run Test Account Probe'}
        </button>

        {probeError && (
          <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--accent-red)', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
            {probeError}
          </div>
        )}

        {probeResult && (
          <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--accent-green)', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Probe Successful
            </div>
            {probeResult.account && probeResult.account.id ? (
              <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                <div>ID: {probeResult.account.id}</div>
                <div>Country: {probeResult.account.country}</div>
                <div>Charges Enabled: {probeResult.account.charges_enabled ? 'Yes' : 'No'}</div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                {probeResult.account?.note || probeResult.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
