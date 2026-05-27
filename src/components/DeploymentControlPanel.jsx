import React, { useState, useEffect } from 'react';
import { Rocket, AlertTriangle } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import OwnerApprovalPanel from './OwnerApprovalPanel.jsx';
import { OWNER_APPROVAL_SCOPES } from '../services/owner-approval-client.js';
import { requestVercelPreviewDeploy, getDeploymentReadiness } from '../services/deployment-client.js';

export default function DeploymentControlPanel() {
  const [approval, setApproval] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [deployResult, setDeployResult] = useState(null);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    let active = true;
    getDeploymentReadiness().then(res => {
      if (active && res.ok && res.data) setReadiness(res.data);
    });
    return () => { active = false; };
  }, []);

  const hasHardBlockers = readiness?.blockers?.length > 0;
  const canDeploy = approval && !hasHardBlockers && !deploying;

  const handleDeploy = async () => {
    if (!canDeploy) return;
    setDeploying(true);
    setDeployResult(null);
    const result = await requestVercelPreviewDeploy({ ownerApproval: approval.ownerApproval });
    setDeployResult(result);
    setDeploying(false);
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Rocket size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Deployment Control</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Owner-Approved Actions</div>
        </div>
      </div>

      <OwnerApprovalPanel
        scope={OWNER_APPROVAL_SCOPES.DEPLOY}
        title="Deploy Approval Gate"
        description="Explicit owner approval is required before any deployment action can proceed."
        riskLevel="high"
        onApprovalCreated={setApproval}
        compact
      />

      {hasHardBlockers && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--accent-red-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '11px', color: 'var(--accent-red)' }}>
          <AlertTriangle size={14} />
          <span>Hard blockers prevent deployment. Resolve readiness checks first.</span>
        </div>
      )}

      <button
        onClick={handleDeploy}
        disabled={!canDeploy}
        style={{
          width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
          background: canDeploy ? 'var(--accent-indigo)' : 'var(--bg-deep)',
          color: canDeploy ? '#fff' : 'var(--text-muted)',
          fontSize: '13px', fontWeight: 800, cursor: canDeploy ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s',
        }}
      >
        {deploying ? 'Requesting Deploy...' : 'Request Vercel Preview Deploy'}
      </button>

      {deployResult && (
        <div style={{ padding: '12px', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Deploy Result</span>
            <TruthBadge state={deployResult.truthState || deployResult.data?.truthState || 'UNKNOWN'} compact />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {deployResult.data?.message || deployResult.error || 'No additional detail.'}
          </div>
          {deployResult.data?.nextAction && (
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>→ {deployResult.data.nextAction}</div>
          )}
        </div>
      )}

      <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        A successful deploy request does not equal a live deployment. Real deployment requires provider response and a confirmed deployment URL. This control creates receipts for all attempts.
      </div>
    </div>
  );
}
