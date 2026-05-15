import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import TruthBadge from './TruthBadge.jsx';
import OwnerApprovalPanel from './OwnerApprovalPanel.jsx';
import { getAiProviderStatus, runOpenAiProbe, runGeminiProbe } from '../services/ai-provider-client.js';

export default function AiProviderProofPanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalEnvelope, setApprovalEnvelope] = useState(null);
  const [probeResult, setProbeResult] = useState(null);
  const [probeLoading, setProbeLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getAiProviderStatus();
        if (cancelled) return;
        if (result.ok && result.data) {
          setStatus(result.data);
        } else {
          setError(result.error || 'Failed to fetch AI provider status');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleProbe = async (provider) => {
    setProbeLoading(true);
    setProbeResult(null);
    try {
      let result;
      if (provider === 'openai') {
        result = await runOpenAiProbe(approvalEnvelope);
      } else if (provider === 'gemini') {
        result = await runGeminiProbe(approvalEnvelope);
      }
      setProbeResult({ provider, result });
    } catch (err) {
      setProbeResult({ provider, result: { ok: false, truthState: 'ERROR', error: err.message } });
    } finally {
      setProbeLoading(false);
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
            <Cpu size={16} color="var(--accent-indigo)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>AI Provider Proof</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Loading status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-red)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>AI Provider Proof</span>
          </div>
          <TruthBadge state="ERROR" compact />
        </div>
        <p style={{ color: 'var(--accent-red)', fontSize: '12px' }}>Bridge unavailable: {error}</p>
      </div>
    );
  }

  const { openai, gemini } = status || {};
  
  // Aggregate truth state
  let overallTruthState = 'VERIFIED';
  if (openai?.truthState === 'PROVIDER_GATED' && gemini?.truthState === 'PROVIDER_GATED') {
    overallTruthState = 'PROVIDER_GATED';
  }

  const renderProviderStatus = (label, providerData, id) => {
    if (!providerData) return null;
    const isConfigured = providerData.configured;
    
    return (
      <div style={{ marginBottom: '16px' }} id={id}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <TruthBadge state={providerData.truthState} compact />
        </div>
        {isConfigured ? (
          <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '10px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 500 }}>
              <CheckCircle size={14} /> Local configuration verified
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(251, 146, 60, 0.05)', border: '1px solid rgba(251, 146, 60, 0.2)', padding: '10px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 500 }}>
              <AlertTriangle size={14} /> {providerData.blockedReason}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={panelStyle} id="ai-provider-proof-panel">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>AI Provider Proof</span>
        </div>
        <TruthBadge state={overallTruthState} compact />
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
        Keys are detected locally. Autonomous execution is suspended.
        To verify network connectivity, approve and run a minimal ping.
      </div>

      {renderProviderStatus('OpenAI', openai, 'openai-status')}
      {renderProviderStatus('Gemini', gemini, 'gemini-status')}

      {(openai?.configured || gemini?.configured) && (
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-mid)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Network Verification Gate
          </div>
          
          <OwnerApprovalPanel 
            scope="provider_probe" 
            onApprovalGranted={setApprovalEnvelope} 
            title="Provider Probe Gate"
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {openai?.configured && (
              <button
                onClick={() => handleProbe('openai')}
                disabled={!approvalEnvelope || probeLoading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: !approvalEnvelope ? 'var(--bg-surface)' : 'var(--accent-indigo)',
                  color: !approvalEnvelope ? 'var(--text-dim)' : '#fff',
                  border: !approvalEnvelope ? '1px solid var(--border-subtle)' : 'none', 
                  cursor: !approvalEnvelope ? 'not-allowed' : 'pointer',
                  fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={14} /> Run OpenAI Safe Probe
              </button>
            )}

            {gemini?.configured && (
              <button
                onClick={() => handleProbe('gemini')}
                disabled={!approvalEnvelope || probeLoading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: !approvalEnvelope ? 'var(--bg-surface)' : 'var(--accent-indigo)',
                  color: !approvalEnvelope ? 'var(--text-dim)' : '#fff',
                  border: !approvalEnvelope ? '1px solid var(--border-subtle)' : 'none', 
                  cursor: !approvalEnvelope ? 'not-allowed' : 'pointer',
                  fontSize: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={14} /> Run Gemini Safe Probe
              </button>
            )}
          </div>

          {probeResult && (
            <div style={{ 
              marginTop: '16px', padding: '12px', borderRadius: '6px', fontSize: '12px',
              background: probeResult.result.ok ? 'rgba(34, 197, 94, 0.05)' : 'rgba(248, 113, 113, 0.05)',
              border: `1px solid ${probeResult.result.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {probeResult.provider} Probe Result
                </span>
                <TruthBadge state={probeResult.result.truthState} compact />
              </div>
              <div style={{ color: probeResult.result.ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {probeResult.result.ok 
                  ? probeResult.result.data?.message || 'Success'
                  : probeResult.result.error || 'Failed'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
