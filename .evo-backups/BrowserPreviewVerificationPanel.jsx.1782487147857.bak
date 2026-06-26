import React, { useState, useEffect } from 'react';
import { Layout, CheckSquare, Square, Shield, Eye, Lock, Zap } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';

const CHECKLIST_ITEMS = [
  { id: 'preview_url_exists', label: 'Preview URL exists and is reachable' },
  { id: 'app_shell_loads', label: 'App shell (Sidebar/Header) loads correctly' },
  { id: 'proof_center_loads', label: 'Proof Center view displays correctly' },
  { id: 'deployment_center_loads', label: 'Deployment Center view displays correctly' },
  { id: 'provider_checklist_visible', label: 'Provider Credential Checklist is visible' },
  { id: 'env_status_visible', label: 'Environment Status panel is visible' },
  { id: 'security_audit_visible', label: 'Security Audit panel is visible' },
  { id: 'route_diagnostics_visible', label: 'Route Diagnostics panel is visible' },
  { id: 'stripe_test_panel_visible', label: 'Stripe Test Checkout Panel is visible' },
  { id: 'no_secrets_visible', label: 'No raw secrets (tokens/keys) are exposed in UI' },
  { id: 'prod_blocked_ui', label: 'Production deploy is clearly shown as BLOCKED' },
  { id: 'live_billing_blocked_ui', label: 'Live billing is clearly shown as BLOCKED' }
];

export default function BrowserPreviewVerificationPanel() {
  const [checks, setChecks] = useState(() => {
    const saved = localStorage.getItem('ph_evo_browser_verification');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('ph_evo_browser_verification', JSON.stringify(checks));
  }, [checks]);

  const toggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checks).filter(Boolean).length;
  const isFullyVerified = completedCount === CHECKLIST_ITEMS.length;

  const panelStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
  };

  return (
    <div style={panelStyle} id="browser-preview-verification-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--accent-indigo)' }}>
            <Eye size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Browser Preview Verification</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Manual verification of frontend truth-states.</p>
          </div>
        </div>
        <TruthBadge state="LOCAL_ONLY" compact />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {CHECKLIST_ITEMS.map(item => (
          <div 
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', 
              borderRadius: '8px', background: checks[item.id] ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-card)',
              border: `1px solid ${checks[item.id] ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-subtle)'}`,
              cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            {checks[item.id] ? (
              <CheckSquare size={16} color="var(--accent-green)" />
            ) : (
              <Square size={16} color="var(--text-muted)" />
            )}
            <span style={{ 
              fontSize: '13px', color: checks[item.id] ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: checks[item.id] ? 500 : 400
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ 
        padding: '16px', borderRadius: '10px', background: isFullyVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.05)',
        border: `1px solid ${isFullyVerified ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isFullyVerified ? <Shield size={18} color="var(--accent-green)" /> : <Lock size={18} color="var(--accent-indigo)" />}
          <span style={{ fontSize: '13px', fontWeight: 600, color: isFullyVerified ? 'var(--accent-green)' : 'var(--accent-indigo)' }}>
            {isFullyVerified ? 'ALL CHECKS COMPLETED' : `${completedCount} / ${CHECKLIST_ITEMS.length} CHECKS VERIFIED`}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
          {isFullyVerified ? 'READY FOR HANDOVER' : 'MANUAL CHECK REQUIRED'}
        </div>
      </div>
    </div>
  );
}
