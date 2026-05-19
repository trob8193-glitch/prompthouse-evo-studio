import React from 'react';
import { BrainCircuit, RefreshCw, Flame, Layers3 } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

const card = { background: 'rgba(15,23,42,.84)', border: '1px solid rgba(16,185,129,.22)', borderRadius: 18, padding: 18, boxShadow: '0 18px 60px rgba(0,0,0,.28)' };
const button = { border: '1px solid rgba(16,185,129,.35)', background: 'rgba(6,78,59,.35)', color: '#d1fae5', borderRadius: 12, padding: '10px 12px', fontSize: 12, fontWeight: 850, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' };
function Badge({ children, tone = 'emerald' }) { const c = tone === 'red' ? ['#450a0a', '#fecaca'] : ['#064e3b', '#a7f3d0']; return <span style={{ background: c[0], color: c[1], borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900 }}>{children}</span>; }
async function post(path, body = {}) { return safeFetchBridge(path, { method: 'POST', timeout: 120000, body: JSON.stringify(body) }); }

const STATUS_PATH = '/api/evo-bridge/status';
const RUN_PATH = '/api/evo-bridge/run';

export default function EvoSpineCoreDashboard() {
  const [status, setStatus] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    try {
      const response = await safeFetchBridge(STATUS_PATH);
      if (response.ok) {
        setStatus(response.data);
        setMessage('Evo bridge status refreshed.');
      } else {
        setMessage(`ERROR: ${response.error}`);
      }
    } finally { setBusy(false); }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const run = async () => {
    setBusy(true);
    try {
      const response = await post(RUN_PATH, { objective: 'Improve Evo pipeline', lessons: [] });
      if (response.ok) {
        setResult(response.data);
        setMessage('Evo bridge run completed.');
      } else {
        setMessage(`ERROR: ${response.error}`);
      }
    } finally { setBusy(false); }
  };

  const modules = status?.contract?.modules || result?.modules || [];
  const counts = result?.counts || {};

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: '#e2e8f0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 950 }}>Evo Learning Bridge</h1>
        <p style={{ color: '#94a3b8', maxWidth: 860 }}>Evo bridge surface for learning pipeline status, run results, module counts, and proof-safe review.</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={button} onClick={refresh} disabled={busy}><RefreshCw size={15}/>Refresh</button>
        <button style={button} onClick={run} disabled={busy}><Flame size={15}/>Run Evo</button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
      <div style={card}><BrainCircuit size={18}/><h3>Truth State</h3><Badge tone={String(status?.truthState || result?.truthState || '').includes('FAILED') ? 'red' : 'emerald'}>{status?.truthState || result?.truthState || 'WAITING'}</Badge></div>
      <div style={card}><Layers3 size={18}/><h3>Modules</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{modules.length}</div></div>
      <div style={card}><Flame size={18}/><h3>Queue</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{counts.queue || 0}</div></div>
    </div>

    <div style={card}>
      <h2>Evo Modules</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{modules.map(item => <Badge key={item}>{item}</Badge>)}</div>
    </div>

    <div style={card}><h2>Latest Result</h2><pre style={{ whiteSpace: 'pre-wrap', background: '#020617', padding: 12, borderRadius: 12, fontSize: 11 }}>{JSON.stringify({ counts, truthState: result?.truthState }, null, 2)}</pre></div>

    {message && <p style={{ color: message.startsWith('ERROR') ? '#fecaca' : '#a7f3d0', fontWeight: 850 }}>{message}</p>}
  </div>;
}
