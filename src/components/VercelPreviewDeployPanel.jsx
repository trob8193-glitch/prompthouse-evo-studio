import React, { useState, useEffect } from 'react';
import { ExternalLink, Rocket, ShieldCheck, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import OwnerApprovalPanel from './OwnerApprovalPanel.jsx';
import { getVercelPreviewStatus, requestVercelPreviewDeploy, getLatestPreviewDeploymentReceipt } from '../services/vercel-preview-client.js';

export default function VercelPreviewDeployPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [approvalEnvelope, setApprovalEnvelope] = useState(null);
  const [result, setResult] = useState(null);
  const [latestReceipt, setLatestReceipt] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, receiptRes] = await Promise.all([
        getVercelPreviewStatus(),
        getLatestPreviewDeploymentReceipt()
      ]);
      if (statusRes.ok) setStatus(statusRes.data);
      if (receiptRes.ok) setLatestReceipt(receiptRes.data);
    } catch (err) {
      console.error('Failed to fetch Vercel status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDeploy = async () => {
    if (!approvalEnvelope) return;
    setDeploying(true);
    setResult(null);
    try {
      const res = await requestVercelPreviewDeploy(approvalEnvelope);
      setResult(res);
      if (res.ok) {
        await fetchStatus(); // Refresh to show latest receipt
      }
    } catch (err) {
      setResult({ ok: false, error: err.message, truthState: 'ERROR' });
    } finally {
      setDeploying(false);
    }
  };

  const panelStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-mid)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  };

  if (loading) return <div style={panelStyle}><p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading Vercel readiness...</p></div>;

  const { tokenStatus, previewReadiness, productionReadiness } = status || {};
  const isReady = previewReadiness?.ready;

  return (
    <div style={panelStyle} id="vercel-preview-deploy-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Rocket size={16} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Vercel Preview Deploy Proof</span>
        </div>
        <TruthBadge state={previewReadiness?.truthState || 'UNKNOWN'} compact />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Vercel Token:</span>
          <span style={{ fontWeight: 600, color: tokenStatus?.configured ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {tokenStatus?.configured ? `CONFIGURED (${tokenStatus.redactedToken})` : 'MISSING'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span>Production Deploy:</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase' }}>
            {productionReadiness?.ready ? 'READY' : 'BLOCKED'}
          </span>
        </div>

        {previewReadiness?.blockers?.length > 0 && (
          <div style={{ color: 'var(--accent-orange)', padding: '10px', background: 'rgba(251, 146, 60, 0.05)', borderRadius: '6px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
              <AlertCircle size={14} /> Readiness Blockers
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              {previewReadiness.blockers.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-mid)' }}>
        <OwnerApprovalPanel 
          scope="deploy" 
          onApprovalGranted={setApprovalEnvelope} 
          title="Vercel Deployment Gate"
        />

        <button
          onClick={handleDeploy}
          disabled={!approvalEnvelope || deploying || !isReady}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', marginTop: '16px',
            background: (!approvalEnvelope || !isReady) ? 'var(--bg-surface)' : 'var(--accent-indigo)',
            color: (!approvalEnvelope || !isReady) ? 'var(--text-dim)' : '#fff',
            border: (!approvalEnvelope || !isReady) ? '1px solid var(--border-subtle)' : 'none', 
            cursor: (!approvalEnvelope || !isReady) ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          {deploying ? <RefreshCw size={16} className="animate-spin" /> : <Rocket size={16} />}
          {deploying ? 'Deploying to Vercel...' : 'Run Vercel Preview Deploy Proof'}
        </button>

        {result && (
          <div style={{ 
            marginTop: '16px', padding: '12px', borderRadius: '6px', fontSize: '12px',
            background: result.ok ? 'rgba(34, 197, 94, 0.05)' : 'rgba(248, 113, 113, 0.05)',
            border: `1px solid ${result.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Deployment Result</span>
              <TruthBadge state={result.truthState} compact />
            </div>
            {result.ok ? (
              <div>
                <p style={{ color: 'var(--accent-green)', margin: '0 0 8px 0' }}>Preview deploy successful!</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <a href={result.deploymentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-indigo)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                    Open Preview <ExternalLink size={12} />
                  </a>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>ID: {result.deploymentId}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>Receipt: {result.receiptId}</span>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--accent-red)' }}>{result.error || result.blockedReason || 'Deployment failed.'}</div>
            )}
          </div>
        )}

        {latestReceipt && !result && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', borderRadius: '6px', fontSize: '11px' }}>
            <div style={{ color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Latest Preview Receipt</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{new Date(latestReceipt.createdAt).toLocaleString()}</span>
              <TruthBadge state={latestReceipt.truthState} compact />
            </div>
            {latestReceipt.deploymentUrl && (
              <a href={latestReceipt.deploymentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-indigo)', display: 'block', marginTop: '4px' }}>
                {latestReceipt.deploymentUrl}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
