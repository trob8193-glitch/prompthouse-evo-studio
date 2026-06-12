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
import { PreviewAccessDecisionPanel } from '../components/PreviewAccessDecisionPanel.jsx';
import StripeCheckoutBrowserVerificationPanel from '../components/StripeCheckoutBrowserVerificationPanel.jsx';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';


/**
 * PH EVO STUDIO — DEPLOYMENT CENTER VIEW
 * ═══════════════════════════════════════════════════════════════
 * Centralized dashboard for deployment readiness, receipts,
 * and owner-approved deploy actions.
 * No unverified deployment. No release claim without receipts.
 */
export default function DeploymentCenterView() {
  return (
    <IDEPageLayout
      title="Deployment Center"
      description="Pre-flight readiness, deployment receipts, and owner-approved deploy actions."
      icon={Rocket}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <HandoverStatusPanel />
          <PreviewAccessDecisionPanel />
          <StripeCheckoutBrowserVerificationPanel />
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
    </IDEPageLayout>
  );
}
