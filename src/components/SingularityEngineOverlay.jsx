import React, { useState, useEffect } from 'react';
import { X, Activity, Shield, Zap, Network, Clock, Layers, Database } from 'lucide-react';
import { useSovereignStore } from '../store.js';
import TruthBadge from './TruthBadge.jsx';
import { TRUTH_STATES } from '../constants/truth-states.js';
import { BRIDGE_URL } from '../config/bridge-config.js';

/**
 * PH EVO STUDIO — SINGULARITY ENGINE OVERLAY
 * ═══════════════════════════════════════════════════════════════
 * Real-time management interface for the singularity layer.
 */
export default function SingularityEngineOverlay() {
  const singularityActive = useSovereignStore((s) => s.singularityActive);
  const setSingularityActive = useSovereignStore((s) => s.setSingularityActive);
  const activePage = useSovereignStore((s) => s.activePage);
  const singularityLayer = useSovereignStore((s) => s.singularityLayer);
  const setSingularityLayer = useSovereignStore((s) => s.setSingularityLayer);
  const bridgeStatus = useSovereignStore((s) => s.bridgeStatus);
  const bondedNodes = useSovereignStore((s) => s.bondedNodes || []);
  const bridgeData = useSovereignStore((s) => s.bridgeData);
  const fetchMetrics = useSovereignStore((s) => s.fetchMetrics);

  const [latency, setLatency] = useState(4);
  const [sovereigntyScore, setSovereigntyScore] = useState(99.8);

  useEffect(() => {
    if (!singularityActive) return;

    const updateStats = async () => {
      const startTime = performance.now();
      try {
        await fetchMetrics();
        const endTime = performance.now();
        setLatency(Math.max(1, Math.round(endTime - startTime)));

        const auditRes = await fetch(`${BRIDGE_URL}/api/nuclear-truth/audit`);
        const auditData = await auditRes.json();
        if (auditData && typeof auditData.score === 'number') {
          setSovereigntyScore(auditData.score);
        }
      } catch (err) {
        console.warn('Singularity Telemetry Sync Failed:', err);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 3000);
    return () => clearInterval(interval);
  }, [singularityActive, fetchMetrics]);

  if (!singularityActive) return null;

  const layers = [
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'semantic', label: 'Semantic', icon: Layers },
    { id: 'temporal', label: 'Temporal', icon: Clock },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'sprouts', label: 'Sprouts', icon: Zap },
  ];

  const runtimeTruth = bridgeData ? TRUTH_STATES.LOCAL_ONLY : TRUTH_STATES.PROVIDER_GATED;
  const apiKeysTruth = bridgeData?.keys?.openai ? TRUTH_STATES.VERIFIED : TRUTH_STATES.NEEDS_CREDENTIALS;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(9, 9, 11, 0.95)',
      backdropFilter: 'blur(12px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: 'var(--text-primary)',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        height: '100%',
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 100px rgba(0,0,0,0.8)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, var(--accent-gold), #e8a020)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--accent-gold-glow)',
            }}>
              <Zap size={20} color="#000" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>Singularity Engine</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '2px' }}>Operational Intelligence Layer</div>
            </div>
          </div>

          <button 
            onClick={() => setSingularityActive(false)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-mid)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{
            width: '280px',
            borderRight: '1px solid var(--border-subtle)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}>
            {/* Status Section */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>System Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <StatusItem label="Active Page" value={activePage} icon={<Layers size={14} />} />
                <StatusItem label="Bridge" value={bridgeStatus} color={bridgeStatus === 'connected' ? 'var(--accent-green)' : 'var(--accent-red)'} icon={<Activity size={14} />} />
                <StatusItem label="Bonded Nodes" value={bondedNodes.length} icon={<Network size={14} />} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                    <Shield size={14} />
                    Runtime
                  </div>
                  <TruthBadge state={runtimeTruth} compact />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                    <Database size={14} />
                    API Keys
                  </div>
                  <TruthBadge state={apiKeysTruth} compact />
                </div>
              </div>
            </div>

            {/* Layers Selection */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Intelligence Layers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {layers.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSingularityLayer(l.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: singularityLayer === l.id ? 'var(--accent-gold-dim)' : 'transparent',
                      border: '1px solid',
                      borderColor: singularityLayer === l.id ? 'var(--accent-gold-glow)' : 'transparent',
                      color: singularityLayer === l.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <l.icon size={16} />
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Viewport */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{layers.find(l => l.id === singularityLayer)?.label} Overview</div>
              <div style={{ color: 'var(--text-dim)', maxWidth: '600px' }}>
                Analyzing {singularityLayer} interactions across the studio's autonomous fabric. This layer provides real-time visibility into the foundry's logic density and truth verification chains.
              </div>
            </div>

            {/* Layout area for real metrics/graphs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}>
              <MetricCard title="Logic Persistence" value={`${sovereigntyScore}%`} color="var(--accent-green)" />
              <MetricCard title="Cognitive Drift" value={`${(100 - sovereigntyScore).toFixed(2)}%`} color="var(--accent-cyan)" />
              <MetricCard title="Truth Velocity" value={`${latency}ms`} color="var(--accent-violet)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, color, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
        {icon}
        {label}
      </div>
      <div style={{ fontWeight: 700, color: color || 'var(--text-primary)', textTransform: 'capitalize' }}>{value}</div>
    </div>
  );
}

function MetricCard({ title, value, color }) {
  return (
    <div style={{
      padding: '24px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-mid)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 900, color: color }}>{value}</div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
        <div style={{ width: '70%', height: '100%', background: color }}></div>
      </div>
    </div>
  );
}
