import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ExternalLink, ShoppingCart } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import OwnerApprovalPanel from './OwnerApprovalPanel.jsx';
import { getStripeTestCheckoutReadiness, createStripeTestCheckoutSession } from '../services/stripe-checkout-client.js';

export default function StripeTestCheckoutPanel() {
  const [readiness, setReadiness] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalEnvelope, setApprovalEnvelope] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getStripeTestCheckoutReadiness();
        if (cancelled) return;
        if (result.ok && result.data) {
          setReadiness(result.data);
        } else {
          setError(result.error || 'Failed to fetch Stripe readiness');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCreateSession = async () => {
    setSessionLoading(true);
    setSessionResult(null);
    try {
      const result = await createStripeTestCheckoutSession(approvalEnvelope, {
        amount: 100,
        currency: 'usd'
      });
      setSessionResult(result);
    } catch (err) {
      setSessionResult({ ok: false, truthState: 'ERROR', error: err.message });
    } finally {
      setSessionLoading(false);
    }
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
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Stripe Test Checkout Flow</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading readiness...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="var(--accent-red)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Stripe Test Checkout Flow</span>
          </div>
          <TruthBadge state="ERROR" compact />
        </div>
        <p style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Bridge unavailable: {error}</p>
      </div>
    );
  }

  const { ready, truthState, mode, blockers } = readiness || {};

  return (
    <div style={panelStyle} id="stripe-test-checkout-panel">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={16} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Stripe Test Checkout Flow</span>
        </div>
        <TruthBadge state={truthState || 'ERROR'} compact />
      </div>

      <div style={{ marginBottom: '16px' }}>
        {mode === 'test' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 500, padding: '10px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle size={14} /> Stripe Test Mode Active
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 500, padding: '10px', background: 'rgba(251, 146, 60, 0.05)', borderRadius: '6px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
            <AlertTriangle size={14} /> {blockers?.[0] || 'Stripe configuration issue'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Checkout Readiness:</span>
          <span style={{ color: ready ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
            {ready ? 'READY' : 'BLOCKED'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Current Mode:</span>
          <span style={{ color: mode === 'test' ? 'var(--accent-indigo)' : 'var(--accent-red)', fontWeight: 700, textTransform: 'uppercase' }}>
            {mode}
          </span>
        </div>
      </div>

      {ready && mode === 'test' && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-mid)' }}>
          <OwnerApprovalPanel 
            scope="commerce" 
            onApprovalGranted={setApprovalEnvelope} 
            title="Stripe Commerce Gate"
          />

          <button
            onClick={handleCreateSession}
            disabled={!approvalEnvelope || sessionLoading}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', marginTop: '16px',
              background: !approvalEnvelope ? 'var(--bg-surface)' : 'var(--accent-indigo)',
              color: !approvalEnvelope ? 'var(--text-dim)' : '#fff',
              border: !approvalEnvelope ? '1px solid var(--border-subtle)' : 'none', 
              cursor: !approvalEnvelope ? 'not-allowed' : 'pointer',
              fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <ShoppingCart size={16} /> {sessionLoading ? 'Creating Session...' : 'Create Stripe Test Checkout Session'}
          </button>

          {sessionResult && (
            <div style={{ 
              marginTop: '16px', padding: '12px', borderRadius: '6px', fontSize: '12px',
              background: sessionResult.ok ? 'rgba(34, 197, 94, 0.05)' : 'rgba(248, 113, 113, 0.05)',
              border: `1px solid ${sessionResult.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Checkout Session</span>
                <TruthBadge state={sessionResult.truthState} compact />
              </div>
              {sessionResult.ok ? (
                <div>
                  <div style={{ color: 'var(--accent-green)', marginBottom: '8px' }}>Session created successfully.</div>
                  <a 
                    href={sessionResult.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', 
                      color: 'var(--accent-indigo)', fontWeight: 700, textDecoration: 'underline'
                    }}
                  >
                    Open Stripe Checkout <ExternalLink size={12} />
                  </a>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'monospace' }}>
                    ID: {sessionResult.id}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--accent-red)' }}>
                  {sessionResult.error || 'Failed to create session'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
