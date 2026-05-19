import React, { useState, useEffect } from 'react';
import { Shield, Key, Activity, Clock, AlertTriangle } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getProviderGateStatus, getProviderReceipts } from '../services/provider-status-client.js';

/**
 * PH EVO STUDIO — PROVIDER STATUS PANEL
 * ═══════════════════════════════════════════════════════════════
 * Displays provider gate status and recent receipts.
 * Uses TruthBadge for all truth-state labels.
 * No secret display. No unverified provider success.
 */
export default function ProviderStatusPanel() {
  const [gates, setGates] = useState({});
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [gateResult, receiptResult] = await Promise.all([
          getProviderGateStatus(),
          getProviderReceipts(20),
        ]);
        if (cancelled) return;
        setGates(gateResult.gates || {});
        setReceipts(receiptResult.receipts || []);
        setError(gateResult.ok ? null : gateResult.error);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const providers = Object.entries(gates);

  return (
    <div style={{
      padding: '24px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-mid)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Provider Gates</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Credential &amp; Truth Status</div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
          Loading provider status...
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--accent-red)',
          fontSize: '12px',
        }}>
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Provider gates */}
      {!loading && providers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px',
          }}>
            Credentials
          </div>
          {providers.map(([label, info]) => (
            <div key={label} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={13} color="var(--text-dim)" />
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {label}
                </span>
                {info.redacted && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: 'var(--text-muted)', letterSpacing: '0.5px',
                  }}>
                    {info.redacted}
                  </span>
                )}
              </div>
              <TruthBadge state={info.truthState} compact />
            </div>
          ))}
        </div>
      )}

      {/* Recent receipts */}
      {!loading && receipts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px',
          }}>
            Recent Receipts
          </div>
          {receipts.slice(0, 10).map((r) => (
            <div key={r.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={12} color="var(--text-dim)" />
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {r.provider}
                </span>
                <span style={{ color: 'var(--text-dim)' }}>
                  {r.action}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TruthBadge state={r.truthState} compact />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  color: 'var(--text-muted)',
                }}>
                  <Clock size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                  {new Date(r.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && providers.length === 0 && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
          No provider gates available. Bridge may be offline.
        </div>
      )}
    </div>
  );
}
