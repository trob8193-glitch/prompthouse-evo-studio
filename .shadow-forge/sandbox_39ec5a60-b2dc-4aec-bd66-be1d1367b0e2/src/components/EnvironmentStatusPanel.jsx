import React, { useState, useEffect } from 'react';
import { Shield, Key, Globe, Server, Lock } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getEnvironmentValidation } from '../services/env-status-client.js';

/**
 * PH EVO STUDIO — ENVIRONMENT STATUS PANEL
 * ═══════════════════════════════════════════════════════════════
 * Displays safe environment configuration status.
 * No secret values. No unverified production-ready labels.
 */
export default function EnvironmentStatusPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getEnvironmentValidation();
        if (cancelled) return;
        if (result.ok && result.data) {
          setStatus(result.data);
        } else {
          setError(result.error || 'Failed to fetch environment status');
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
            <Shield size={16} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Environment Status</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading environment validation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--accent-red)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Environment Status</span>
          </div>
          <TruthBadge state="ERROR" compact />
        </div>
        <p style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Bridge unavailable: {error}</p>
      </div>
    );
  }

  const { secrets = [], config = [], providers = [], truthState, mode, productionAllowed } = status || {};

  return (
    <div style={panelStyle} id="environment-status-panel">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Environment Status</span>
        </div>
        <TruthBadge state={truthState || 'UNVERIFIED'} compact />
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px', display: 'flex', gap: '16px' }}>
        <span>Mode: <strong style={{ color: 'var(--text-secondary)' }}>{mode || 'UNKNOWN'}</strong></span>
        <span>Production Deploy: <strong style={{ color: productionAllowed ? 'var(--accent-red)' : 'var(--accent-green)' }}>
          {productionAllowed ? 'ALLOWED' : 'BLOCKED'}
        </strong></span>
      </div>

      {/* Secret Status */}
      {secrets.map(s => (
        <div key={s.key} style={rowStyle}>
          <span style={labelStyle}>
            <Key size={12} />
            {s.key}
          </span>
          <span style={{ color: s.configured && s.lengthValid ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600, fontSize: '11px' }}>
            {!s.configured ? '✗ Not Set' : !s.lengthValid ? `✗ Too Short (${s.length}/${s.minLength})` : `✓ Valid (${s.length} chars)`}
          </span>
        </div>
      ))}

      {/* Config Status */}
      {config.map(c => (
        <div key={c.key} style={rowStyle}>
          <span style={labelStyle}>
            {c.key === 'CORS_ORIGINS' ? <Globe size={12} /> :
             c.key === 'VITE_BRIDGE_URL' ? <Server size={12} /> :
             <Lock size={12} />}
            {c.label || c.key}
          </span>
          <span style={{ color: c.configured ? 'var(--accent-green)' : 'var(--accent-orange)', fontWeight: 600, fontSize: '11px' }}>
            {c.configured ? (c.value || '✓ Set') : '✗ Not Configured'}
          </span>
        </div>
      ))}

      {/* Provider Keys (configured/not only) */}
      {providers.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Provider Keys
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {providers.map(p => (
              <span key={p.key} style={{
                fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                background: p.configured ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255,255,255,0.03)',
                color: p.configured ? 'var(--accent-green)' : 'var(--text-dim)',
                border: `1px solid ${p.configured ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                {p.label}: {p.configured ? '✓' : '—'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
