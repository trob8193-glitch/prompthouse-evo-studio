import React from 'react';
import { safeFetchBridge } from '../config/bridge-config.js';

function useBridgeJson(path) {
  const [state, setState] = React.useState({ loading: true, data: null, error: null });
  React.useEffect(() => {
    let active = true;
    setState({ loading: true, data: null, error: null });
    safeFetchBridge(path)
      .then(result => {
        if (!active) return;
        if (!result.ok) throw new Error(result.error || `Request failed: ${path}`);
        setState({ loading: false, data: result.data, error: null });
      })
      .catch(error => active && setState({ loading: false, data: null, error: error.message }));
    return () => { active = false; };
  }, [path]);
  return state;
}

function Panel({ title, children }) {
  return (
    <section style={{ border: '1px solid #1e293b', borderRadius: 16, background: 'rgba(15,23,42,0.72)', padding: 18, marginBottom: 16 }}>
      <h2 style={{ margin: '0 0 12px', fontSize: 16, color: '#c7d2fe' }}>{title}</h2>
      {children}
    </section>
  );
}

function StateBlock({ state }) {
  if (state.loading) return <p style={{ color: '#94a3b8' }}>Loading bridge data...</p>;
  if (state.error) return <p style={{ color: '#fca5a5' }}>Bridge error: {state.error}</p>;
  return <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 520, fontSize: 12, color: '#dbeafe' }}>{JSON.stringify(state.data, null, 2)}</pre>;
}

export function SelfEvolutionDashboard() {
  const metrics = useBridgeJson('/api/metrics');
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Self-Evolution Dashboard</h1>
      <p style={{ color: '#94a3b8' }}>Readiness view for mutation, receipts, and maturity evidence.</p>
      <Panel title="Maturity + Review Snapshot"><StateBlock state={metrics} /></Panel>
    </div>
  );
}

export function CostFirewallDashboard() {
  const metrics = useBridgeJson('/api/metrics');
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Cost Firewall</h1>
      <p style={{ color: '#94a3b8' }}>Budget, review, and cost velocity evidence for autonomous safety.</p>
      <Panel title="Cost Velocity"><StateBlock state={metrics} /></Panel>
    </div>
  );
}

export function ReviewLedgerView() {
  const reviews = useBridgeJson('/api/reviews');
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Review Ledger</h1>
      <p style={{ color: '#94a3b8' }}>Stored Gatekeeper and Auditor review records.</p>
      <Panel title="Reviews"><StateBlock state={reviews} /></Panel>
    </div>
  );
}

export function ProofDocsView() {
  const docs = useBridgeJson('/api/proof-docs');
  const data = docs.data?.docs || {};
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Proof Docs</h1>
      <p style={{ color: '#94a3b8' }}>Generated proof-facing documentation from local receipts.</p>
      {docs.loading || docs.error ? <Panel title="Status"><StateBlock state={docs} /></Panel> : (
        <>
          <Panel title="Proof Ledger"><pre style={{ whiteSpace: 'pre-wrap', color: '#dbeafe' }}>{data.proofLedger || 'No proof ledger doc found.'}</pre></Panel>
          <Panel title="Maturity"><pre style={{ whiteSpace: 'pre-wrap', color: '#dbeafe' }}>{data.maturity || 'No maturity doc found.'}</pre></Panel>
          <Panel title="Self-Evolution"><pre style={{ whiteSpace: 'pre-wrap', color: '#dbeafe' }}>{data.selfEvolution || 'No self-evolution doc found.'}</pre></Panel>
        </>
      )}
    </div>
  );
}

export default SelfEvolutionDashboard;
