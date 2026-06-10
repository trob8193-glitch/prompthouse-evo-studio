import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Brain, CheckCircle2, PauseCircle, PlayCircle, RefreshCw, Shield, Square, Zap } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

function Badge({ value, tone = 'cyan' }) {
  const colors = {
    green: { bg: 'rgba(0,255,136,0.12)', color: '#00ff88', border: 'rgba(0,255,136,0.3)', glow: 'rgba(0,255,136,0.2)' },
    red: { bg: 'rgba(255,0,85,0.12)', color: '#ff0055', border: 'rgba(255,0,85,0.3)', glow: 'rgba(255,0,85,0.2)' },
    amber: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.2)' },
    cyan: { bg: 'rgba(0,240,255,0.12)', color: '#00f0ff', border: 'rgba(0,240,255,0.3)', glow: 'rgba(0,240,255,0.2)' },
  };
  const c = colors[tone] || colors.cyan;
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 900,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      boxShadow: `0 0 12px ${c.glow}`,
    }}>
      {value || 'UNKNOWN'}
    </span>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div style={{
      background: 'rgba(5,5,8,0.8)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 20, padding: 20,
      backdropFilter: 'blur(20px)', boxShadow: '0 0 20px rgba(0,240,255,0.05)', transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8a8a9a', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {Icon && <Icon size={14} color="#00f0ff" style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }} />} {label}
      </div>
      <div style={{ marginTop: 12, fontSize: 24, fontWeight: 900, color: '#fff', textShadow: '0 0 15px rgba(0,240,255,0.3)' }}>{value}</div>
    </div>
  );
}

const ActionButton = ({ children, danger, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      border: `1px solid ${danger ? 'rgba(255,0,85,0.4)' : 'rgba(0,240,255,0.3)'}`,
      background: danger ? 'rgba(255,0,85,0.1)' : 'rgba(0,240,255,0.08)',
      color: danger ? '#ff0055' : '#00f0ff',
      borderRadius: 14, padding: '10px 16px', fontSize: 12, fontWeight: 800,
      cursor: disabled ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      boxShadow: `0 0 15px ${danger ? 'rgba(255,0,85,0.15)' : 'rgba(0,240,255,0.15)'}`,
      transition: 'all 0.3s', opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.boxShadow = `0 0 25px ${danger ? 'rgba(255,0,85,0.3)' : 'rgba(0,240,255,0.3)'}`; } }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 15px ${danger ? 'rgba(255,0,85,0.15)' : 'rgba(0,240,255,0.15)'}`; }}
  >
    {children}
  </button>
);

const SectionCard = ({ title, children }) => (
  <div style={{
    background: 'rgba(5,5,8,0.8)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 24, padding: 24,
    backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(0,240,255,0.05)',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: '#00f0ff', filter: 'blur(120px)', opacity: 0.06, pointerEvents: 'none' }} />
    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 0 15px rgba(0,240,255,0.4)', position: 'relative', zIndex: 1 }}>{title}</h2>
    <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
  </div>
);

export default function SelfEvolutionDashboard() {
  const [status, setStatus] = React.useState(null);
  const [receipts, setReceipts] = React.useState([]);
  const [memory, setMemory] = React.useState([]);
  const [approvals, setApprovals] = React.useState([]);
  const [objective, setObjective] = React.useState('Remove unverified self-evolution language and verify proof-gated safety.');
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
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#e2e8f0' }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: '-0.04em', color: '#fff', textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>Self-Evolution Control</h1>
            <p style={{ margin: '10px 0 0', color: '#00ff88', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', maxWidth: 780 }}>
              Proof-gated repair cycles, sandbox patching, rollback receipts, daemon controls.
            </p>
          </div>
          <ActionButton onClick={refresh} disabled={busy}><RefreshCw size={14} /> Refresh</ActionButton>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        <Stat label="Truth State" value={<Badge value={truthState} tone={truthState.includes('PASS') || truthState === 'ROLLED_BACK' ? 'green' : truthState.includes('FAIL') ? 'red' : 'cyan'} />} icon={Shield} />
        <Stat label="Recent Runs" value={receipts.length} icon={Activity} />
        <Stat label="Memory Patterns" value={memory.length} icon={Brain} />
        <Stat label="Approval Queue" value={approvals.length} icon={AlertTriangle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 20 }}>
        <SectionCard title="Run Cycle">
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            style={{
              marginTop: 16, width: '100%', minHeight: 86,
              background: 'rgba(0,0,0,0.4)', color: '#b4b4c4',
              border: '1px solid rgba(0,240,255,0.15)', borderRadius: 14, padding: 14,
              resize: 'vertical', fontSize: 13, fontWeight: 600, lineHeight: 1.5,
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(0,240,255,0.4)'; e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <ActionButton disabled={busy} onClick={() => run('/api/self-evolution/propose', { objective })}><Zap size={14} /> Propose</ActionButton>
            <ActionButton disabled={busy} onClick={() => run('/api/self-evolution/apply-sandbox', { objective })}><Shield size={14} /> Sandbox</ActionButton>
            <ActionButton disabled={busy} onClick={() => run('/api/self-evolution/proof', { objective, runTests: true, runBuild: true, allowRollback: true })}><CheckCircle2 size={14} /> Proof</ActionButton>
            <ActionButton disabled={busy} onClick={() => run('/api/self-evolution/daemon/run-once', {})}><Activity size={14} /> Auto Run Once</ActionButton>
          </div>
          {message && <div style={{ marginTop: 14, color: message.startsWith('ERROR') ? '#ff0055' : '#00ff88', fontSize: 12, fontWeight: 800, textShadow: message.startsWith('ERROR') ? '0 0 10px rgba(255,0,85,0.3)' : '0 0 10px rgba(0,255,136,0.3)' }}>{message}</div>}
        </SectionCard>

        <SectionCard title="Daemon & Kill Switch">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <ActionButton disabled={busy} onClick={() => run('/api/self-evolution/daemon/start', { autonomyLevel: 2, intervalMinutes: 60 })}><PlayCircle size={14} /> Start</ActionButton>
            <ActionButton disabled={busy} onClick={() => run('/api/self-evolution/daemon/stop', {})}><PauseCircle size={14} /> Stop</ActionButton>
            <ActionButton danger disabled={busy} onClick={() => run('/api/self-evolution/kill-switch', { reason: 'Manual dashboard safety stop' })}><Square size={14} /> Kill</ActionButton>
            <ActionButton disabled={busy} onClick={() => run('/api/self-evolution/kill-switch/release', { reason: 'Manual dashboard release' })}><PlayCircle size={14} /> Release</ActionButton>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: '#8a8a9a', lineHeight: 2 }}>
            <div>Enabled: <Badge value={String(daemon?.enabled ?? false)} tone={daemon?.enabled ? 'green' : 'amber'} /></div>
            <div style={{ marginTop: 8 }}>Kill Switch: <Badge value={killSwitch?.engaged ? 'ENGAGED' : 'CLEAR'} tone={killSwitch?.engaged ? 'red' : 'green'} /></div>
          </div>
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SectionCard title="Recent Receipts">
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {receipts.length === 0 && <p style={{ color: '#8a8a9a', fontSize: 13 }}>No receipts yet.</p>}
            {receipts.map((item) => (
              <div key={item.id} style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: 14, padding: 14,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <b style={{ fontSize: 12, color: '#fff' }}>{item.id}</b>
                  <Badge value={item.truthState} tone={item.truthState === 'PROOF_PASSED' || item.truthState === 'ROLLED_BACK' ? 'green' : 'cyan'} />
                </div>
                <div style={{ marginTop: 8, color: '#8a8a9a', fontSize: 12, fontWeight: 600 }}>{item.objective}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Evolution Memory">
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {memory.length === 0 && <p style={{ color: '#8a8a9a', fontSize: 13 }}>No memory patterns yet.</p>}
            {memory.slice(0, 8).map((item) => (
              <div key={item.pattern} style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(138,43,226,0.15)', borderRadius: 14, padding: 14,
              }}>
                <b style={{ fontSize: 12, color: '#fff' }}>{item.pattern}</b>
                <div style={{ marginTop: 8, color: '#8a8a9a', fontSize: 12, fontWeight: 600 }}>
                  Success: {item.successfulFixes || 0} · Failed: {item.failedFixes || 0} · Risk: {item.risk || 'LOW'}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </motion.div>
  );
}
