import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { getSecurityAudit } from '../services/security-audit-client.js';

/**
 * PH EVO STUDIO — SECURITY AUDIT PANEL
 * ═══════════════════════════════════════════════════════════════
 * Premium dashboard panel showing mutation route security audit.
 * Uses TruthBadge for all truth-state labels.
 * No secrets. No fake green status. Safe empty state.
 */
export default function SecurityAuditPanel() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await getSecurityAudit();
        if (cancelled) return;
        if (result.ok) {
          setAudit(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const coverage = audit?.audit?.coverage || {};
  const suspicious = audit?.audit?.suspiciousRoutes || [];
  const ungated = audit?.audit?.ungatedMutationRoutes || [];
  const truthState = audit?.truthState || 'UNKNOWN';

  const cardStyle = {
    padding: '24px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const statBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'var(--bg-deep)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    fontSize: '12px',
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: suspicious.length > 0
            ? 'linear-gradient(135deg, #ef4444, #f97316)'
            : 'linear-gradient(135deg, #10b981, #06b6d4)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {suspicious.length > 0 ? <ShieldAlert size={18} color="#fff" /> : <ShieldCheck size={18} color="#fff" />}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Security Audit</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Mutation Route Coverage
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <TruthBadge state={truthState} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
          Scanning routes...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--accent-red)', fontSize: '12px',
        }}>
          <AlertTriangle size={14} />
          Bridge unavailable — {error}
        </div>
      )}

      {/* Coverage stats */}
      {!loading && audit && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={statBoxStyle}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Total Routes</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 800 }}>{coverage.total || 0}</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                <CheckCircle2 size={13} color="#10b981" /> Read-Only
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 800 }}>{coverage.readOnly || 0}</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                <Lock size={13} color="#06b6d4" /> Gated Mutations
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#06b6d4', fontWeight: 800 }}>{coverage.gated || 0}</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                <Unlock size={13} color="#f59e0b" /> Ungated Mutations
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 800 }}>{coverage.ungated || 0}</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Gate Coverage</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 800,
                color: coverage.gatePercentage >= 80 ? '#10b981' : coverage.gatePercentage >= 50 ? '#f59e0b' : '#ef4444',
              }}>
                {coverage.gatePercentage || 0}%
              </span>
            </div>
          </div>

          {/* Suspicious routes */}
          {suspicious.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                fontSize: '10px', fontWeight: 800, color: '#ef4444',
                textTransform: 'uppercase', letterSpacing: '1px',
              }}>
                ⚠ Suspicious Routes ({suspicious.length})
              </div>
              {suspicious.map((r, i) => (
                <div key={i} style={{
                  padding: '8px 14px',
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '11px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <XCircle size={12} color="#ef4444" />
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {r.method} {r.path}
                  </span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '10px' }}>
                    L{r.line} · {r.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !audit && !error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
          No audit data available.
        </div>
      )}
    </div>
  );
}
