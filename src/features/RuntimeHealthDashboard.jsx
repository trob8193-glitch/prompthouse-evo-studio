import React from 'react';
import { safeFetchBridge } from '../config/bridge-config.js';

function HealthCard({ title, value, detail }) {
  return (
    <section style={{ border: '1px solid #1e293b', borderRadius: 16, background: 'rgba(15,23,42,0.78)', padding: 18 }}>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#e0e7ff', marginTop: 8 }}>{value}</div>
      {detail && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{detail}</div>}
    </section>
  );
}

export default function RuntimeHealthDashboard() {
  const [state, setState] = React.useState({ loading: true, data: null, error: null });

  const refresh = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const result = await safeFetchBridge('/api/runtime-health', { timeout: 8000 });
    if (!result.ok) {
      setState({ loading: false, data: null, error: result.error || 'Runtime health unavailable' });
      return;
    }
    setState({ loading: false, data: result.data, error: null });
  }, []);

  React.useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [refresh]);

  const data = state.data || {};
  const route = data.routeVerification?.data || data.routeVerification || null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0 }}>Runtime Health</h1>
          <p style={{ color: '#94a3b8', marginTop: 8 }}>Live bridge, proof, route, cost, and maturity status.</p>
        </div>
        <button onClick={refresh} style={{ border: '1px solid #334155', borderRadius: 10, background: '#111827', color: '#dbeafe', padding: '10px 14px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {state.error && <div style={{ color: '#fca5a5', marginBottom: 16 }}>Runtime health error: {state.error}</div>}
      {state.loading && !state.data && <div style={{ color: '#94a3b8' }}>Loading runtime health...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
        <HealthCard title="Bridge" value={data.bridge?.truthState || 'UNKNOWN'} detail={data.checkedAt || ''} />
        <HealthCard title="Maturity" value={`${data.maturity?.averageScore ?? '—'}%`} detail={`${data.maturity?.moduleCount ?? 0} modules · ${data.maturity?.truthState || 'UNKNOWN'}`} />
        <HealthCard title="Cost Velocity" value={data.costVelocity?.truthState || 'UNKNOWN'} detail={`${data.costVelocity?.requests ?? 0} requests · $${Number(data.costVelocity?.dollars || 0).toFixed(4)}`} />
        <HealthCard title="Routes" value={route?.truthState || 'NO_RECEIPT'} detail={`${route?.passed ?? 0} passed · ${route?.failed ?? 0} failed`} />
        <HealthCard title="Reviews" value={data.reviews?.count ?? 0} detail="recent stored reviews" />
        <HealthCard title="Proof Docs" value={Object.values(data.proofDocs || {}).filter(Boolean).length + '/3'} detail="generated documentation availability" />
      </div>

      <section style={{ border: '1px solid #1e293b', borderRadius: 16, background: 'rgba(15,23,42,0.78)', padding: 18 }}>
        <h2 style={{ marginTop: 0, color: '#c7d2fe' }}>Raw Health Payload</h2>
        <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 520, color: '#dbeafe', fontSize: 12 }}>{JSON.stringify(data, null, 2)}</pre>
      </section>
    </div>
  );
}
