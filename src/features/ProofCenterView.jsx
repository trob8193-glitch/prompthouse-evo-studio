import React from 'react';
import { Shield } from 'lucide-react';
import ProviderStatusPanel from '../components/ProviderStatusPanel.jsx';
import ProviderCredentialChecklistPanel from '../components/ProviderCredentialChecklistPanel.jsx';
import StripeProofPanel from '../components/StripeProofPanel.jsx';
import AiProviderProofPanel from '../components/AiProviderProofPanel.jsx';
import StripeTestCheckoutPanel from '../components/StripeTestCheckoutPanel.jsx';
import SecurityAuditPanel from '../components/SecurityAuditPanel.jsx';
import RouteDiagnosticsPanel from '../components/RouteDiagnosticsPanel.jsx';
import OwnerApprovalPanel from '../components/OwnerApprovalPanel.jsx';
import HandoverStatusPanel from '../components/HandoverStatusPanel.jsx';
import { PreviewAccessDecisionPanel } from '../components/PreviewAccessDecisionPanel.jsx';
import { OWNER_APPROVAL_SCOPES } from '../services/owner-approval-client.js';

/**
 * PH EVO STUDIO — PROOF CENTER VIEW
 * ═══════════════════════════════════════════════════════════════
 * Frontend dashboard for proof-gated readiness.
 * No external provider calls required to view. No fake success.
 */
export function ProofCenterView() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pb-10">
      <header className="mb-[var(--space-24)]">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-violet))',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 className="font-[var(--text-page-title)] text-[var(--text-primary)] m-0">Proof Center</h1>
            <p className="font-[var(--text-body)] text-[var(--text-secondary)] mt-1 mb-0">
              Provider verification, security audits, and truth-state execution gates.
            </p>
          </div>
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Diagnostics & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <HandoverStatusPanel />
          <PreviewAccessDecisionPanel />
          <RouteDiagnosticsPanel />
          <SecurityAuditPanel />
        </div>

        {/* Right Column: Provider & Owner Approvals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ProviderCredentialChecklistPanel />
          <StripeProofPanel />
          <StripeTestCheckoutPanel />
          <AiProviderProofPanel />
          <ProviderStatusPanel />

          <div style={{
            padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Shield size={18} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Owner Approvals</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Execution Envelopes
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Explicit owner approval is required for sensitive mutation routes.
              <strong> An approval envelope does not equal provider success.</strong> It only satisfies the local verification gate.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <OwnerApprovalPanel
                scope={OWNER_APPROVAL_SCOPES.DEPLOY}
                title="Deploy Pipeline Gate"
                description="Explicit approval required to push builds to external hosts."
                riskLevel="high"
                compact
              />
              <OwnerApprovalPanel
                scope={OWNER_APPROVAL_SCOPES.COMMERCE}
                title="Live Commerce Gate"
                description="Explicit approval required to mutate live billing objects."
                riskLevel="critical"
                compact
              />
              <OwnerApprovalPanel
                scope={OWNER_APPROVAL_SCOPES.SELF_IMPLEMENTATION}
                title="Self-Implementation"
                description="Allow the studio to modify its own source code files."
                riskLevel="moderate"
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProofCenterView;
