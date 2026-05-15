import React from 'react';
import { Rocket } from 'lucide-react';
import DeploymentReadinessPanel from '../components/DeploymentReadinessPanel.jsx';
import DeploymentReceiptsPanel from '../components/DeploymentReceiptsPanel.jsx';
import DeploymentControlPanel from '../components/DeploymentControlPanel.jsx';
import EnvironmentStatusPanel from '../components/EnvironmentStatusPanel.jsx';
import ProviderCredentialChecklistPanel from '../components/ProviderCredentialChecklistPanel.jsx';
import StripeProofPanel from '../components/StripeProofPanel.jsx';
import AiProviderProofPanel from '../components/AiProviderProofPanel.jsx';
import VercelPreviewDeployPanel from '../components/VercelPreviewDeployPanel.jsx';
import StripeTestCheckoutPanel from '../components/StripeTestCheckoutPanel.jsx';
import BrowserPreviewVerificationPanel from '../components/BrowserPreviewVerificationPanel.jsx';
import HandoverStatusPanel from '../components/HandoverStatusPanel.jsx';

/**
 * PH EVO STUDIO — DEPLOYMENT CENTER VIEW
 * ═══════════════════════════════════════════════════════════════
 * Centralized dashboard for deployment readiness, receipts,
 * and owner-approved deploy actions.
 * No fake deployment. No market-ready claim.
 */
export default function DeploymentCenterView() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 pb-10">
      <header style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Rocket size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Deployment Center</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: 0 }}>
              Pre-flight readiness, deployment receipts, and owner-approved deploy actions.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <HandoverStatusPanel />
          <DeploymentReadinessPanel />
          <BrowserPreviewVerificationPanel />
          <DeploymentReceiptsPanel />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <EnvironmentStatusPanel />
          <ProviderCredentialChecklistPanel />
          <StripeProofPanel />
          <StripeTestCheckoutPanel />
          <AiProviderProofPanel />
          <VercelPreviewDeployPanel />
          <DeploymentControlPanel />
        </div>
      </div>
    </div>
  );
}
