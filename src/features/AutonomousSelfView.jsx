import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Zap, RefreshCw, Brain, TrendingUp, CheckCircle } from 'lucide-react';
import { useSovereignStore } from '../store.js';

/**
 * PH EVO STUDIO — AUTONOMOUS SELF & TRAINING (ENTERPRISE GRADE)
 * ═══════════════════════════════════════════════════════════════
 * Manages self-evolution, maintenance, and training loops.
 */

function StatusBadge({ active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20,
      background: active ? '#22c55e14' : '#ef444414',
      border: `1px solid ${active ? '#22c55e44' : '#ef444444'}`,
      color: active ? '#22c55e' : '#ef4444', fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#22c55e' : '#ef4444', animation: active ? 'pulse 2s infinite' : 'none' }} />
      {active ? 'Active' : 'Standby'}
    </div>
  );
}

export function AutonomousSelfView() {
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const runMaintenance = useSovereignStore((s) => s.runMaintenance);
  const metrics = useSovereignStore((s) => s.metrics);
  const bridgeData = useSovereignStore((s) => s.bridgeData);
  
  const [evolving, setEvolving] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [nuclearAudit, setNuclearAudit] = useState(null);
  const [selfImplementation, setSelfImplementation] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Self-Evolution Panel */}
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99,102,241,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Zap size={20} color="#6366f1" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Self-Evolution Cycle</h2>
            </div>
            <StatusBadge active={evolving} />
          </div>
          
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
              Evolution status is read from the bridge, and operational reality is sourced from the live Nuclear Truth audit and self-implementation status.
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cycle Progress</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>{Number(effectiveProgress || 0).toFixed(1)}%</span>
              </div>
              <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${effectiveProgress}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #818cf8)', transition: 'width 1s linear' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: '12px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Logic Density</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>
                  {typeof nuclearAudit?.score === 'number' ? `${nuclearAudit.score}%` : (metrics?.logic?.density || 'N/A')}
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Truth Gaps</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: (nuclearAudit?.summary?.brokenWires || 0) > 0 ? '#ef4444' : '#22c55e' }}>
                  {(nuclearAudit?.summary?.brokenWires ?? 'N/A')} Broken
                </div>
              </div>
            </div>

            <button 
              onClick={evolving ? () => setEvolving(false) : startEvolution}
              disabled={bridgeStatus !== 'connected'}
              style={{ 
                width: '100%', padding: '12px', borderRadius: 10, border: 'none', 
                background: evolving ? '#1e293b' : '#4f46e5', color: 'white', 
                fontSize: 13, fontWeight: 700, cursor: bridgeStatus === 'connected' ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
              }}
            >
              {evolving ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
              {evolving ? 'Evolution Active' : 'Start Evolution Loop'}
            </button>
          </div>
        </div>

        {/* Studio Training & Edges Panel */}
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16,185,129,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Brain size={20} color="#10b981" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Training & Intelligence Edges</h2>
            </div>
            <TrendingUp size={18} color="#10b981" />
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #10b98120', borderTopColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 10s linear infinite' }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#10b981' }}>2M</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>Sovereign IQ Baseline</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Current resonance: {bridgeData?.iq_metrics?.truth_density || `${nuclearAudit?.score ?? 0}%`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {auditEdges.map((edge, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{edge.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{edge.val}</span>
                    {edge.status === 'verified' ? <CheckCircle size={12} color="#22c55e" /> : <RefreshCw size={12} color="#f59e0b" className="animate-spin" />}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={runMaintenance}
              style={{ 
                width: '100%', marginTop: 24, padding: '12px', borderRadius: 10, 
                background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', 
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <Shield size={16} />
              Run Manual Maintenance Cycle
            </button>
          </div>
        </div>
      </div>

      {/* Cost Firewall & Emergency Controls */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={20} color="#ef4444" />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Cost Firewall & Emergency Controls</h2>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Phase 11 Enforced</div>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
            Enforce safety gates, credit checks, and emergency shutoff for all autonomous operations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: '16px', background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Emergency Shutoff</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>OFF</span>
                <button disabled style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#334155', color: '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'not-allowed' }}>OWNER ONLY</button>
              </div>
            </div>
            <div style={{ padding: '16px', background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Paid AI Access</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#64748b' }}>DISABLED</span>
                <span style={{ fontSize: 10, color: '#64748b' }}>Local Only</span>
              </div>
            </div>
            <div style={{ padding: '16px', background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Daily Spend Cap</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>$5.00 (local policy)</div>
            </div>
            <div style={{ padding: '16px', background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Monthly Spend Cap</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>$50.00 (local policy)</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'SELF_IMPLEMENTATION_ACTIVE', val: String(Boolean(selfImplementation?.active)), safe: Boolean(selfImplementation?.active) },
              { label: 'PROOF_REQUIRED_FOR_COMPLETE_CLAIM', val: String(Boolean(selfImplementation?.policies?.proofRequiredForCompleteClaim)), safe: Boolean(selfImplementation?.policies?.proofRequiredForCompleteClaim) },
              { label: 'LOCAL_ONLY_GATING', val: 'true', safe: true },
            ].map((setting, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b' }}>
                <code style={{ fontSize: 11, color: '#94a3b8' }}>{setting.label}</code>
                <span style={{ fontSize: 11, fontWeight: 700, color: setting.safe ? '#22c55e' : '#ef4444' }}>{setting.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutonomousSelfView;
