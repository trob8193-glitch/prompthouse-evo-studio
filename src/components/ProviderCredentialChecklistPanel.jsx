import React, { useState, useEffect } from 'react';
import { KeyRound, Key, ShieldAlert } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getProviderCredentialChecklist } from '../services/provider-credential-client.js';

/**
 * PH EVO STUDIO — PROVIDER CREDENTIAL CHECKLIST PANEL
 * ═══════════════════════════════════════════════════════════════
 * Displays configured state of provider keys securely.
 * Zero secrets exposed. No unverified provider success.
 */
export default function ProviderCredentialChecklistPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getProviderCredentialChecklist();
        if (cancelled) return;
        if (result.ok && result.data) {
          setStatus(result.data);
        } else {
          setError(result.error || 'Failed to fetch provider checklist');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  const rowStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: '13px',
  };

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  };

  if (loading) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} color="var(--accent-orange)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Provider Checklist</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading provider status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} color="var(--accent-red)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Provider Checklist</span>
          </div>
          <TruthBadge state="ERROR" compact />
        </div>
        <p style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Bridge unavailable: {error}</p>
      </div>
    );
  }

  const { providers = [], localSecrets = [], truthState, blockers = [], warnings = [] } = status || {};

  return (
    <div style={panelStyle} id="provider-credential-checklist-panel">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={16} color="var(--accent-orange)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Provider Checklist</span>
        </div>
        <TruthBadge state={truthState || 'UNVERIFIED'} compact />
      </div>

      <div style={{
        background: 'rgba(251, 146, 60, 0.05)', border: '1px solid rgba(251, 146, 60, 0.2)',
        borderRadius: '6px', padding: '10px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start'
      }}>
        <ShieldAlert size={14} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Add real keys to <code>.env</code> locally or your hosting provider environment.</strong><br/>
          Do not paste them into chat. Provider keys are optional until real provider execution.
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Required Authentication
        </div>
        {localSecrets.map(s => (
          <div key={s.envKey} style={rowStyle}>
            <span style={labelStyle}>
              <Key size={12} />
              {s.provider} <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>({s.envKey})</span>
            </span>
            <span style={{ color: s.configured && s.lengthValid ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600, fontSize: '11px' }}>
              {!s.configured ? '✗ Missing' : !s.lengthValid ? `✗ Too Short` : `✓ Configured`}
            </span>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          External Providers
        </div>
        {providers.map(p => (
          <div key={p.envKey} style={rowStyle}>
            <span style={labelStyle}>
              <Key size={12} />
              {p.provider} <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>({p.envKey})</span>
            </span>
            <span style={{ color: p.configured ? 'var(--accent-green)' : 'var(--text-dim)', fontWeight: 600, fontSize: '11px' }}>
              {p.configured ? '✓ Configured' : '— Missing'}
            </span>
          </div>
        ))}
      </div>

      {(blockers.length > 0 || warnings.length > 0) && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          {blockers.map((b, i) => <div key={`b-${i}`} style={{ fontSize: '11px', color: 'var(--accent-red)', marginBottom: '4px' }}>• {b}</div>)}
          {warnings.map((w, i) => <div key={`w-${i}`} style={{ fontSize: '11px', color: 'var(--accent-orange)', marginBottom: '4px' }}>• {w}</div>)}
        </div>
      )}
    </div>
  );
}
