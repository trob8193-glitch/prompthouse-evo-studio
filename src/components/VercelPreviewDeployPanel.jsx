import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import OwnerApprovalPanel from './OwnerApprovalPanel.jsx';
import { getVercelReadiness, requestVercelPreviewDeploy } from '../services/vercel-client.js';

export default function VercelPreviewDeployPanel() {
  const [readiness, setReadiness] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalEnvelope, setApprovalEnvelope] = useState(null);
  const [deployResult, setDeployResult] = useState(null);
  const [deployLoading, setDeployLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getVercelReadiness();
        if (cancelled) return;
        if (result.ok && result.data) {
          setReadiness(result.data);
        } else {
          setError(result.error || 'Failed to fetch Vercel readiness');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDeploy = async () => {
    setDeployLoading(true);
    setDeployResult(null);
    try {
      const result = await requestVercelPreviewDeploy(approvalEnvelope);
      setDeployResult(result);
    } catch (err) {
      setDeployResult({ ok: false, truthState: 'ERROR', error: err.message });
    } finally {
      setDeployLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={16} color="var(--accent-indigo)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Vercel Preview Deploy Proof</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading readiness...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={16} color="var(--accent-red)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Vercel Preview Deploy Proof</span>
          </div>
          <TruthBadge state="ERROR" compact />
        </div>
        <p style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Bridge unavailable: {error}</p>
      </div>
    );
  }

  const { tokenStatus, previewReadiness, productionReadiness } = readiness || {};
  const isPreviewReady = previewReadiness?.ready;

  return (
    <div style={panelStyle} id="vercel-preview-deploy-panel">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cloud size={16} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>Vercel Preview Deploy Proof</span>
        </div>
        <TruthBadge state={previewReadiness?.truthState || 'ERROR'} compact />
      </div>

      <div style={{ marginBottom: '16px' }}>
        {tokenStatus?.configured ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 500, padding: '10px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle size={14} /> Vercel Token Configured
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 500, padding: '10px', background: 'rgba(251, 146, 60, 0.05)', borderRadius: '6px', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
            <AlertTriangle size={14} /> {tokenStatus?.blockedReason || 'Missing Vercel Token'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Preview Deploy Readiness:</span>
          <span style={{ color: isPreviewReady ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
            {isPreviewReady ? 'READY' : 'BLOCKED'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Production Deploy Readiness:</span>
          <span style={{ color: productionReadiness?.ready ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
            {productionReadiness?.ready ? 'READY' : 'BLOCKED'}
          </span>
        </div>
      </div>

      {isPreviewReady && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-mid)' }}>
          <OwnerApprovalPanel 
            scope="deploy" 
            onApprovalGranted={setApprovalEnvelope} 
            title="Preview Deploy Gate"
          />

          <button
            onClick={handleDeploy}
            disabled={!approvalEnvelope || deployLoading}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', marginTop: '16px',
              background: !approvalEnvelope ? 'var(--bg-surface)' : 'var(--accent-indigo)',
              color: !approvalEnvelope ? 'var(--text-dim)' : '#fff',
              border: !approvalEnvelope ? '1px solid var(--border-subtle)' : 'none', 
              cursor: !approvalEnvelope ? 'not-allowed' : 'pointer',
              fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <PlayCircle size={16} /> {deployLoading ? 'Deploying...' : 'Request Vercel Preview Deploy'}
          </button>

          {deployResult && (
            <div style={{ 
              marginTop: '16px', padding: '12px', borderRadius: '6px', fontSize: '12px',
              background: deployResult.ok ? 'rgba(34, 197, 94, 0.05)' : 'rgba(248, 113, 113, 0.05)',
              border: `1px solid ${deployResult.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Deployment Result</span>
                <TruthBadge state={deployResult.truthState} compact />
              </div>
              <div style={{ color: deployResult.ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {deployResult.ok ? deployResult.data?.message || 'Deploy Successful' : deployResult.error || deployResult.message || 'Deploy Failed'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
