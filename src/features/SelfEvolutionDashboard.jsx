import React from 'react';
import { Activity, AlertTriangle, Brain, CheckCircle2, PauseCircle, PlayCircle, RefreshCw, Shield, Square, Zap } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

const card = {
  background: 'rgba(15,23,42,0.82)',
  border: '1px solid rgba(99,102,241,0.22)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 60px rgba(0,0,0,0.28)'
};

const button = {
  border: '1px solid rgba(129,140,248,0.35)',
  background: 'rgba(67,56,202,0.22)',
  color: '#e0e7ff',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8
};

function Badge({ value, tone = 'indigo' }) {
  const colors = {
    green: ['rgba(22,163,74,0.18)', '#86efac', 'rgba(34,197,94,0.32)'],
    red: ['rgba(153,27,27,0.22)', '#fecaca', 'rgba(239,68,68,0.32)'],
    amber: ['rgba(180,83,9,0.18)', '#fde68a', 'rgba(245,158,11,0.32)'],
    indigo: ['rgba(67,56,202,0.22)', '#c7d2fe', 'rgba(129,140,248,0.32)']
  };
  const c = colors[tone] || colors.indigo;
  return <span style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900 }}>{value || 'UNKNOWN'}</span>;
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {Icon && <Icon size={15} />} {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 24, fontWeight: 900, color: '#f8fafc' }}>{value}</div>
    </div>
  );
}

export default function SelfEvolutionDashboard() {
  const [status, setStatus] = React.useState(null);
  const [receipts, setReceipts] = React.useState([]);
  const [memory, setMemory] = React.useState([]);
  const [approvals, setApprovals] = React.useState([]);
  const [objective, setObjective] = React.useState('Remove fake self-evolution language and verify proof-gated safety.');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const refresh = React.useCallback(async () => {
    const [statusRes, receiptsRes, memoryRes, approvalsRes] = await Promise.all([
      safeFetchBridge('/api/self-evolution/status'),
      safeFetchBridge('/api/self-evolution/receipts?limit=12'),
      safeFetchBridge('/api/self-evolution/memory'),
      safeFetchBridge('/api/self-evolution/approval-queue')
    ]);
    if (statusRes.ok) setStatus(statusRes.data.status || statusRes.data);
    if (receiptsRes.ok) setReceipts(receiptsRes.data.receipts || []);
    if (memoryRes.ok) setMemory(memoryRes.data.memory || []);
    if (approvalsRes.ok) setApprovals(approvalsRes.data.approvals || []);
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const run = async (path, body = {}) => {
    setBusy(true);
    setMessage('Running...');
    try {
      const result = await safeFetchBridge(path, { method: 'POST', timeout: 240000, body: JSON.stringify(body) });
      setMessage(result.ok ? `PASS: ${result.data.truthState || result.data.result?.truthState || 'OK'}` : `ERROR: ${result.error}`);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const last = status?.lastRun || status?.status?.lastRun || receipts[0] || null;
  const truthState = status?.truthState || status?.status?.truthState || last?.truthState || 'NOT_STARTED';
  const daemon = status?.daemon || null;
  const killSwitch = daemon?.killSwitch || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#e2e8f0' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0, letterSpacing: '-.04em' }}>Self-Evolution Control</h1>
            <p style={{ margin: '8px 0 0', color: '#94a3b8', maxWidth: 780 }}>Proof-gated repair cycles, sandbox patching, rollback receipts, daemon controls, memory, and approval queues. The robot gets a leash, finally.</p>
          </div>
          <button style={button} onClick={refresh} disabled={busy}><RefreshCw size={15} /> Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        <Stat label="Truth State" value={<Badge value={truthState} tone={truthState.includes('PASS') || truthState === 'ROLLED_BACK' ? 'green' : truthState.includes('FAIL') ? 'red' : 'indigo'} />} icon={Shield} />
        <Stat label="Recent Runs" value={receipts.length} icon={Activity} />
        <Stat label="Memory Patterns" value={memory.length} icon={Brain} />
        <Stat label="Approval Queue" value={approvals.length} icon={AlertTriangle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Run Cycle</h2>
          <textarea value={objective} onChange={(e) => setObjective(e.target.value)} style={{ marginTop: 12, width: '100%', minHeight: 86, background: '#020617', color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: 12, padding: 12, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <button style={button} disabled={busy} onClick={() => run('/api/self-evolution/propose', { objective })}><Zap size={15} /> Propose</button>
            <button style={button} disabled={busy} onClick={() => run('/api/self-evolution/apply-sandbox', { objective })}><Shield size={15} /> Sandbox</button>
            <button style={button} disabled={busy} onClick={() => run('/api/self-evolution/proof', { objective, runTests: true, runBuild: true, allowRollback: true })}><CheckCircle2 size={15} /> Proof</button>
            <button style={button} disabled={busy} onClick={() => run('/api/self-evolution/daemon/run-once', {})}><Activity size={15} /> Auto Run Once</button>
          </div>
          {message && <div style={{ marginTop: 12, color: message.startsWith('ERROR') ? '#fecaca' : '#86efac', fontSize: 12, fontWeight: 800 }}>{message}</div>}
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Daemon & Kill Switch</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <button style={button} disabled={busy} onClick={() => run('/api/self-evolution/daemon/start', { autonomyLevel: 2, intervalMinutes: 60 })}><PlayCircle size={15} /> Start</button>
            <button style={button} disabled={busy} onClick={() => run('/api/self-evolution/daemon/stop', {})}><PauseCircle size={15} /> Stop</button>
            <button style={{ ...button, borderColor: 'rgba(239,68,68,.45)', background: 'rgba(127,29,29,.28)' }} disabled={busy} onClick={() => run('/api/self-evolution/kill-switch', { reason: 'Manual dashboard safety stop' })}><Square size={15} /> Kill</button>
            <button style={button} disabled={busy} onClick={() => run('/api/self-evolution/kill-switch/release', { reason: 'Manual dashboard release' })}><PlayCircle size={15} /> Release</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>
            <div>Enabled: <Badge value={String(daemon?.enabled ?? false)} tone={daemon?.enabled ? 'green' : 'amber'} /></div>
            <div style={{ marginTop: 8 }}>Kill Switch: <Badge value={killSwitch?.engaged ? 'ENGAGED' : 'CLEAR'} tone={killSwitch?.engaged ? 'red' : 'green'} /></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Recent Receipts</h2>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {receipts.length === 0 && <p style={{ color: '#64748b' }}>No receipts yet.</p>}
            {receipts.map((item) => <div key={item.id} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><b style={{ fontSize: 12 }}>{item.id}</b><Badge value={item.truthState} tone={item.truthState === 'PROOF_PASSED' || item.truthState === 'ROLLED_BACK' ? 'green' : 'indigo'} /></div><div style={{ marginTop: 6, color: '#94a3b8', fontSize: 12 }}>{item.objective}</div></div>)}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Evolution Memory</h2>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memory.length === 0 && <p style={{ color: '#64748b' }}>No memory patterns yet.</p>}
            {memory.slice(0, 8).map((item) => <div key={item.pattern} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}><b style={{ fontSize: 12 }}>{item.pattern}</b><div style={{ marginTop: 6, color: '#94a3b8', fontSize: 12 }}>Success: {item.successfulFixes || 0} · Failed: {item.failedFixes || 0} · Risk: {item.risk || 'LOW'}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
