import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ScrollText, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

function useBridgeJson(path, maxRetries = 3) {
  const [state, setState] = React.useState({ loading: true, data: null, error: null });
  React.useEffect(() => {
    let active = true;
    let retryCount = 0;
    
    const fetchData = async () => {
      try {
        if (!active) return;
        setState(prev => ({ ...prev, loading: true }));
        const result = await safeFetchBridge(path);
        
        if (!active) return;
        if (!result.ok) throw new Error(result.error || `Request failed: ${path}`);
        
        setState({ loading: false, data: result.data, error: null });
      } catch (error) {
        if (!active) return;
        
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 500;
          setTimeout(fetchData, delay);
        } else {
          setState({ loading: false, data: null, error: error.message });
        }
      }
    };
    
    fetchData();
    return () => { active = false; };
  }, [path, maxRetries]);
  return state;
}

function Panel({ title, icon: Icon, color = '#00f0ff', children }) {
  return (
    <section style={{
      background: 'rgba(5,5,8,0.8)',
      border: `1px solid ${color}33`,
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      backdropFilter: 'blur(20px)',
      boxShadow: `0 0 30px ${color}15`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: color, filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none' }} />
      <h2 style={{
        margin: '0 0 16px',
        fontSize: 15,
        fontWeight: 900,
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textShadow: `0 0 15px ${color}60`,
        position: 'relative',
        zIndex: 1,
      }}>
        {Icon && <Icon size={18} color={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />}
        {title}
      </h2>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </section>
  );
}

function StateBlock({ state }) {
  if (state.loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8a8a9a', fontSize: 13, fontWeight: 600 }}>
      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading bridge data...
    </div>
  );
  if (state.error) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ff0055', fontSize: 13, fontWeight: 600 }}>
      <AlertCircle size={16} /> Bridge error: {state.error}
    </div>
  );
  return (
    <pre style={{
      whiteSpace: 'pre-wrap',
      overflow: 'auto',
      maxHeight: 520,
      fontSize: 12,
      fontWeight: 600,
      color: '#b4b4c4',
      lineHeight: 1.6,
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 14,
      padding: 16,
      margin: 0,
    }}>
      {JSON.stringify(state.data, null, 2)}
    </pre>
  );
}

function PageHeader({ title, subtitle, icon: Icon, color = '#00f0ff' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ marginBottom: 32 }}
    >
      <h1 style={{
        fontSize: 36,
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '-0.04em',
        margin: 0,
        textShadow: `0 0 20px ${color}40`,
      }}>
        {title}
      </h1>
      <div style={{
        fontSize: 13,
        color,
        marginTop: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {subtitle}
      </div>
    </motion.div>
  );
}

export function SelfEvolutionDashboard() {
  const metrics = useBridgeJson('/api/metrics');
  return (
    <IDEPageLayout
      title="Self-Evolution Dashboard"
      description="Readiness view for mutation, receipts, and maturity evidence."
      icon={Shield}
    >
      <Panel title="Maturity + Review Snapshot" icon={Shield} color="#00ff88">
        <StateBlock state={metrics} />
      </Panel>
    </IDEPageLayout>
  );
}

export function CostFirewallDashboard() {
  const metrics = useBridgeJson('/api/metrics');
  return (
    <IDEPageLayout
      title="Cost Firewall"
      description="Budget, review, and cost velocity evidence for autonomous safety."
      icon={Lock}
    >
      <Panel title="Cost Velocity" icon={Lock} color="#f59e0b">
        <StateBlock state={metrics} />
      </Panel>
    </IDEPageLayout>
  );
}

export function ReviewLedgerView() {
  const reviews = useBridgeJson('/api/reviews');
  return (
    <IDEPageLayout
      title="Review Ledger"
      description="Stored Gatekeeper and Auditor review records."
      icon={ScrollText}
    >
      <Panel title="Reviews" icon={ScrollText} color="#8a2be2">
        <StateBlock state={reviews} />
      </Panel>
    </IDEPageLayout>
  );
}

export function ProofDocsView() {
  const docs = useBridgeJson('/api/proof-docs');
  const data = docs.data?.docs || {};
  return (
    <IDEPageLayout
      title="Proof Docs"
      description="Generated proof-facing documentation from local receipts."
      icon={FileCheck}
    >
      {docs.loading || docs.error ? (
        <Panel title="Status" icon={FileCheck} color="#00f0ff">
          <StateBlock state={docs} />
        </Panel>
      ) : (
        <>
          <Panel title="Proof Ledger" icon={Shield} color="#00ff88">
            <pre style={{
              whiteSpace: 'pre-wrap',
              color: '#b4b4c4',
              fontSize: 12,
              lineHeight: 1.6,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: 16,
              margin: 0,
            }}>
              {data.proofLedger || 'No proof ledger doc found.'}
            </pre>
          </Panel>
          <Panel title="Maturity" icon={Lock} color="#f59e0b">
            <pre style={{
              whiteSpace: 'pre-wrap',
              color: '#b4b4c4',
              fontSize: 12,
              lineHeight: 1.6,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: 16,
              margin: 0,
            }}>
              {data.maturity || 'No maturity doc found.'}
            </pre>
          </Panel>
          <Panel title="Self-Evolution" icon={Shield} color="#8a2be2">
            <pre style={{
              whiteSpace: 'pre-wrap',
              color: '#b4b4c4',
              fontSize: 12,
              lineHeight: 1.6,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: 16,
              margin: 0,
            }}>
              {data.selfEvolution || 'No self-evolution doc found.'}
            </pre>
          </Panel>
        </>
      )}
    </IDEPageLayout>
  );
}

export default SelfEvolutionDashboard;
