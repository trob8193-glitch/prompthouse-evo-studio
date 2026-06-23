import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';
import { useSovereignStore } from '../store.js';

export const OwnerApprovalRail = () => {
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const extensionTheme = globalTheme?.extension || 'alpha';
  const pipelineTheme = globalTheme?.pipeline || 'alpha';
  const [pendingApproval, setPendingApproval] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Poll for suspended workflows awaiting approval
  useEffect(() => {
    const checkKernel = async () => {
      try {
        // We simulate a poll to our execution_routes or terminal routes
        // For the sake of this UI, we'll intercept kernel status
        const res = await safeFetchBridge('/api/intelligence/execute', {
          method: 'POST',
          body: JSON.stringify({ module: 'Terminal', action: 'run', payload: { command: 'evo kernel status' } })
        });
        
        if (res.ok && res.data?.result?.output?.includes('Suspended Executions: 1')) {
          // Detected a suspended workflow requiring owner approval
          if (!pendingApproval) {
            setPendingApproval({
              id: 'exec_vercel_deploy_01',
              action: 'Vercel Orchestrator Deployment',
              risk: 'HIGH',
              costEstimate: '$0.00',
              description: 'The agent is requesting permission to push the "SaaS Scaffold" directly to a live Vercel production URL using your vaulted token.'
            });
          }
        } else {
          setPendingApproval(null);
        }
      } catch (e) {
        // Ignore polling errors
      }
    };
    
    const interval = setInterval(checkKernel, 5000);
    return () => clearInterval(interval);
  }, [pendingApproval]);

  const handleDecision = async (approved) => {
    setProcessing(true);
    try {
      // If approved, trigger the deploy. If rejected, clear it.
      if (approved) {
        await safeFetchBridge('/api/deploy/vercel', { method: 'POST', body: JSON.stringify({ executionId: pendingApproval.id }) });
      }
      setPendingApproval(null);
    } catch (e) {
      console.error('Approval resolution failed', e);
    } finally {
      setProcessing(false);
    }
  };

  if (!pendingApproval) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,0,0,0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998 }}>
      <div style={{ 
        background: pipelineTheme === 'omega' ? '#000' : pipelineTheme === 'sigma' ? 'rgba(139, 92, 246, 0.2)' : extensionTheme === 'gamma' ? '#2a0044' : extensionTheme === 'zeta' ? '#fff' : '#0f172a', 
        border: pipelineTheme === 'omega' ? '10px solid #f00' : pipelineTheme === 'sigma' ? '2px dashed rgba(139, 92, 246, 0.8)' : extensionTheme === 'zeta' ? '4px solid #000' : '2px solid #ef4444', 
        borderRadius: pipelineTheme === 'omega' ? 0 : pipelineTheme === 'sigma' ? 30 : extensionTheme === 'zeta' ? 0 : 12, 
        padding: 32, width: 500, 
        boxShadow: pipelineTheme === 'omega' ? 'inset 0 0 50px rgba(255,0,0,0.5)' : extensionTheme === 'gamma' ? '8px 8px 0 #ef4444' : '0 0 50px rgba(239,68,68,0.2)',
        transform: pipelineTheme === 'omega' ? 'scale(1.1)' : 'none'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, color: '#ef4444' }}>
          <ShieldAlert size={32} />
          <h2 style={{ margin: 0, fontSize: 22, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner Approval Required</h2>
        </div>
        
        <div style={{ background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>ACTION</span>
            <span style={{ color: '#f8fafc', fontSize: 13, fontWeight: 'bold' }}>{pendingApproval.action}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>RISK_LEVEL</span>
            <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 'bold' }}>{pendingApproval.risk}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>ESTIMATED_COST</span>
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 'bold' }}>{pendingApproval.costEstimate}</span>
          </div>
          
          <div style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.5, borderTop: '1px solid #334155', paddingTop: 12 }}>
            {pendingApproval.description}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => handleDecision(false)}
            disabled={processing}
            style={{ flex: 1, background: 'transparent', color: '#f8fafc', border: '1px solid #ef4444', padding: '12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <X size={18} /> Reject & Suspend
          </button>
          <button 
            onClick={() => handleDecision(true)}
            disabled={processing}
            style={{ flex: 1, background: '#ef4444', color: '#f8fafc', border: 'none', padding: '12px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Check size={18} /> Authorize Action
          </button>
        </div>

      </div>
    </div>
  );
};
