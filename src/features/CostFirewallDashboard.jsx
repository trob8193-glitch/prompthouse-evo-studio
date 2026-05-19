import React from 'react';
import { BadgeDollarSign, BarChart3, Database, RefreshCw, ShieldCheck, Trash2, WalletCards, Zap } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

const card = {
  background: 'rgba(15,23,42,0.82)',
  border: '1px solid rgba(34,197,94,0.20)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 60px rgba(0,0,0,0.28)'
};

const button = {
  border: '1px solid rgba(74,222,128,0.32)',
  background: 'rgba(22,101,52,0.20)',
  color: '#dcfce7',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 12,
  fontWeight: 850,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8
};

function Badge({ value, tone = 'green' }) {
  const colors = {
    green: ['rgba(22,163,74,0.18)', '#86efac', 'rgba(34,197,94,0.32)'],
    red: ['rgba(153,27,27,0.22)', '#fecaca', 'rgba(239,68,68,0.32)'],
    amber: ['rgba(180,83,9,0.18)', '#fde68a', 'rgba(245,158,11,0.32)'],
    slate: ['rgba(30,41,59,0.7)', '#cbd5e1', 'rgba(148,163,184,0.25)']
  };
  const c = colors[tone] || colors.green;
  return <span style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900 }}>{value}</span>;
}

function Stat({ label, value, sub, icon: Icon }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {Icon && <Icon size={15} />} {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 26, fontWeight: 950, color: '#f8fafc' }}>{value}</div>
      {sub && <div style={{ marginTop: 6, color: '#64748b', fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export default function CostFirewallDashboard() {
  const [status, setStatus] = React.useState(null);
  const [ledger, setLedger] = React.useState([]);
  const [claims, setClaims] = React.useState([]);
  const [cache, setCache] = React.useState(null);
  const [estimate, setEstimate] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const refresh = React.useCallback(async () => {
    const [statusRes, ledgerRes, claimsRes, cacheRes] = await Promise.all([
      safeFetchBridge('/api/cost-firewall/status'),
      safeFetchBridge('/api/cost-firewall/ledger?limit=30'),
      safeFetchBridge('/api/cost-firewall/claims'),
      safeFetchBridge('/api/cost-firewall/cache')
    ]);
    if (statusRes.ok) setStatus(statusRes.data);
    if (ledgerRes.ok) setLedger(ledgerRes.data.receipts || []);
    if (claimsRes.ok) setClaims(claimsRes.data.claims || []);
    if (cacheRes.ok) setCache(cacheRes.data.cache || null);
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const runEstimate = async (orgPlan = 'free') => {
    setBusy(true);
    setMessage('Estimating...');
    try {
      const result = await safeFetchBridge('/api/cost-firewall/estimate', {
        method: 'POST',
        body: JSON.stringify({
          orgPlan,
          endpoint: '/api/nightforge/cycle',
          taskType: 'dashboard_cost_probe',
          messages: [{ role: 'user', content: 'Audit PromptHouse Evo Studio and recommend proof-gated repairs without wasting paid API calls.' }],
          expectedOutputTokens: 1200
        })
      });
      if (result.ok) {
        setEstimate(result.data.result);
        setMessage(`Estimate complete: ${result.data.result?.route?.selectedProvider || 'unknown'}`);
        await refresh();
      } else {
        setMessage(`ERROR: ${result.error}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const clearCache = async () => {
    setBusy(true);
    try {
      const result = await safeFetchBridge('/api/cost-firewall/cache/clear', { method: 'POST', body: JSON.stringify({}) });
      setMessage(result.ok ? 'Cache cleared.' : `ERROR: ${result.error}`);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const savings = status?.savings || {};
  const pending = status?.reviews || [];
  const certified80 = claims.find((claim) => String(claim.claim || '').includes('80'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0, letterSpacing: '-.04em' }}>Cost Firewall Command</h1>
          <p style={{ margin: '8px 0 0', color: '#94a3b8', maxWidth: 760 }}>Provider routing, budget gates, profit protection, cache tracking, savings receipts, and claim certification. The wallet gets a helmet. 💸</p>
        </div>
        <button style={button} onClick={refresh} disabled={busy}><RefreshCw size={15} /> Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        <Stat label="Requests Measured" value={savings.requests || 0} icon={Database} />
        <Stat label="Avg Savings" value={`${savings.averageSavingsPercent || 0}%`} sub={`$${Number(savings.estimatedSavingsDollars || 0).toFixed(6)} saved`} icon={BadgeDollarSign} />
        <Stat label="Cloud Calls Avoided" value={savings.cloudCallsAvoided || 0} icon={ShieldCheck} />
        <Stat label="Pending Reviews" value={pending.length} icon={WalletCards} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Run Cost Probe</h2>
          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>Runs a real gateway estimate and writes a savings receipt. It does not call paid providers unless the rules allow it.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button style={button} disabled={busy} onClick={() => runEstimate('free')}><Zap size={15} /> Free Plan Probe</button>
            <button style={button} disabled={busy} onClick={() => runEstimate('paid')}><BarChart3 size={15} /> Paid Plan Probe</button>
            <button style={{ ...button, background: 'rgba(127,29,29,.20)', borderColor: 'rgba(248,113,113,.35)', color: '#fecaca' }} disabled={busy} onClick={clearCache}><Trash2 size={15} /> Clear Cache</button>
          </div>
          {message && <div style={{ marginTop: 12, color: message.startsWith('ERROR') ? '#fecaca' : '#86efac', fontSize: 12, fontWeight: 800 }}>{message}</div>}
          {estimate && <pre style={{ marginTop: 12, maxHeight: 220, overflow: 'auto', background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12, color: '#bbf7d0', fontSize: 11 }}>{JSON.stringify({ allowed: estimate.allowed, route: estimate.route, savings: estimate.receipt }, null, 2)}</pre>}
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Claim Certification</h2>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {claims.map((claim) => <div key={claim.claim} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><b style={{ fontSize: 12 }}>{claim.claim}</b><Badge value={claim.certified ? 'CERTIFIED' : 'NOT YET'} tone={claim.certified ? 'green' : 'amber'} /></div><div style={{ marginTop: 7, color: '#94a3b8', fontSize: 12 }}>Samples: {claim.sampleSize} · Avg: {claim.averageSavingsPercent}% · Confidence: {claim.confidence}</div></div>)}
            {!certified80?.certified && <p style={{ color: '#64748b', fontSize: 12 }}>The 80% claim stays blocked until enough receipts prove it. Annoying honesty, but buyers like receipts.</p>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Recent Savings Ledger</h2>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ledger.length === 0 && <p style={{ color: '#64748b' }}>No cost receipts yet.</p>}
            {ledger.slice(0, 12).map((item) => <div key={item.id} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><b style={{ fontSize: 12 }}>{item.endpoint || item.taskType}</b><Badge value={`${item.estimatedSavingsPercent || 0}%`} tone={Number(item.estimatedSavingsPercent || 0) >= 50 ? 'green' : 'slate'} /></div><div style={{ marginTop: 6, color: '#94a3b8', fontSize: 12 }}>Provider: {item.selectedProvider}:{item.selectedModel} · Saved: ${Number(item.estimatedSavingsDollars || 0).toFixed(6)}</div></div>)}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Cache + Reviews</h2>
          <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13, lineHeight: 1.9 }}>
            <div>Cache entries: <Badge value={cache?.entries || 0} tone="slate" /></div>
            <div>Total hits: <Badge value={cache?.totalHits || 0} tone="slate" /></div>
            <div>Expired entries: <Badge value={cache?.expired || 0} tone="slate" /></div>
          </div>
          <h3 style={{ margin: '18px 0 8px', fontSize: 13, fontWeight: 900 }}>Pending Cost Reviews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.length === 0 && <p style={{ color: '#64748b', fontSize: 12 }}>No pending review items.</p>}
            {pending.slice(0, 8).map((item) => <div key={item.id} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}><b style={{ fontSize: 12 }}>{item.endpoint}</b><div style={{ marginTop: 6, color: '#94a3b8', fontSize: 12 }}>{item.reason || 'Review required'} · ${Number(item.estimatedCost || 0).toFixed(6)}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
