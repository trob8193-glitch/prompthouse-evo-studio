import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import { createOwnerApprovalEnvelope } from '../services/owner-approval-client.js';

/**
 * PH EVO STUDIO — OWNER APPROVAL PANEL
 * ═══════════════════════════════════════════════════════════════
 * Renders an explicit gate for owner approval.
 * Creates an envelope when clicked.
 * Visually communicates that approval != provider success.
 */
export default function OwnerApprovalPanel({
  scope,
  title = "Owner Approval Required",
  description = "This action requires explicit owner authorization to proceed.",
  riskLevel = "moderate", // 'low', 'moderate', 'high', 'critical'
  onApprovalCreated,
  disabled = false,
  compact = false
}) {
  const [envelope, setEnvelope] = useState(null);
  const [error, setError] = useState(null);

  const getRiskColor = () => {
    switch(riskLevel) {
      case 'low': return '#3b82f6';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#991b1b';
      default: return '#64748b';
    }
  };

  const handleApprove = () => {
    if (disabled) return;
    try {
      const newEnvelope = createOwnerApprovalEnvelope(scope);
      setEnvelope(newEnvelope);
      setError(null);
      if (onApprovalCreated) {
        onApprovalCreated(newEnvelope);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {envelope ? <ShieldCheck size={16} color="#10b981" /> : <Lock size={16} color={getRiskColor()} />}
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TruthBadge state={envelope ? 'VERIFIED' : 'NEEDS_OWNER_APPROVAL'} compact />
          {!envelope && (
            <button
              onClick={handleApprove}
              disabled={disabled}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none',
                background: disabled ? 'var(--bg-deep)' : 'var(--accent-indigo)',
                color: disabled ? 'var(--text-muted)' : '#fff',
                fontSize: '11px', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer'
              }}
              aria-label={`Approve ${scope}`}
            >
              Approve
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px', background: 'var(--bg-surface)', border: `1px solid ${envelope ? '#10b98155' : 'var(--border-mid)'}`,
      borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px',
      position: 'relative', overflow: 'hidden'
    }}>
      {envelope && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: envelope ? 'rgba(16, 185, 129, 0.1)' : `rgba(${riskLevel === 'high' || riskLevel === 'critical' ? '239, 68, 68' : '245, 158, 11'}, 0.1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {envelope ? <ShieldCheck size={20} color="#10b981" /> : <ShieldAlert size={20} color={getRiskColor()} />}
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{description}</p>
          </div>
        </div>
        <TruthBadge state={envelope ? 'VERIFIED' : 'NEEDS_OWNER_APPROVAL'} />
      </div>

      <div style={{
        padding: '12px', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Scope</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{scope}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Risk Level</span>
          <span style={{ color: getRiskColor(), fontWeight: 700, textTransform: 'uppercase' }}>{riskLevel}</span>
        </div>
        {envelope && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Receipt ID</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>{envelope.ownerApproval.receiptId}</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontSize: '11px', color: '#ef4444', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {!envelope ? (
        <button
          onClick={handleApprove}
          disabled={disabled}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: disabled ? 'var(--bg-deep)' : 'var(--accent-indigo)',
            color: disabled ? 'var(--text-muted)' : '#fff',
            fontSize: '13px', fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          aria-label={`Approve ${scope}`}
        >
          Grant Explicit Approval
        </button>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
          background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Approval envelope created locally. <strong style={{ color: 'var(--text-primary)' }}>Provider execution is still required.</strong>
          </span>
        </div>
      )}
    </div>
  );
}
