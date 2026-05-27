import React from 'react';
import { BrainCircuit, CheckCircle2, ClipboardList, FileText, Gauge, ShieldCheck, ToggleLeft, XCircle } from 'lucide-react';
import { TRIBRAIN_ABILITY_CLASSES, TRIBRAIN_BRAINS, TRIBRAIN_RISK_LEVELS, createTriBrainSystem } from '../core/tribrain/index.js';

const card = {
  background: 'rgba(15,23,42,0.82)',
  border: '1px solid rgba(148,163,184,0.16)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 45px rgba(0,0,0,0.24)',
};

function pct(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
}

function auditScore(status) {
  const values = [status?.score, status?.overallScore, status?.readinessScore, status?.release?.score];
  for (const value of values) {
    const score = pct(value);
    if (score !== null) return score;
  }
  return null;
}

function normalizeRepairs(payload) {
  const raw = payload?.repairQueue || payload?.status?.repairQueue || [];
  return Array.isArray(raw) ? raw.slice(0, 10).map((item, index) => ({
    id: item.id || item.module || `repair_${index + 1}`,
    title: item.title || item.module || item.name || `Repair ${index + 1}`,
    detail: item.summary || item.message || item.reason || 'Repair proposal needs review.',
    severity: item.severity || item.priority || 'medium',
  })) : [];
}

function normalizeReceipts(payload) {
  const raw = payload?.receipts || [];
  return Array.isArray(raw) ? raw.slice(0, 10).map((item, index) => ({
    id: item.id || `receipt_${index + 1}`,
    title: item.truthLabel || item.status || item.type || `Receipt ${index + 1}`,
    detail: item.summary || item.path || item.generatedAt || item.createdAt || 'Proof receipt recorded.',
  })) : [];
}

function Pill({ children, tone = 'neutral' }) {
  const colors = {
    good: ['#052e16', '#22c55e', '#bbf7d0'],
    warn: ['#422006', '#f59e0b', '#fde68a'],
    bad: ['#450a0a', '#ef4444', '#fecaca'],
    neutral: ['#111827', '#64748b', '#cbd5e1'],
  }[tone];
  return <span style={{ background: colors[0], border: `1px solid ${colors[1]}55`, color: colors[2], borderRadius: 999, padding: '4px 9px', fontSize: 11, fontWeight: 900 }}>{children}</span>;
}

function Stat({ icon: Icon, label, value, sub, tone }) {
  return <div style={card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ color: '#64748b', fontSize: 11, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      <Icon size={18} color={tone === 'good' ? '#22c55e' : tone === 'warn' ? '#f59e0b' : '#818cf8'} />
    </div>
    <div style={{ fontSize: 30, fontWeight: 950, color: '#f8fafc' }}>{value}</div>
    {sub && <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12 }}>{sub}</div>}
  </div>;
}

function Button({ children, onClick, variant = 'primary' }) {
  const style = variant === 'danger'
    ? { background: 'rgba(127,29,29,0.45)', border: '1px solid rgba(248,113,113,0.45)', color: '#fecaca' }
    : variant === 'ghost'
      ? { background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(148,163,184,0.16)', color: '#cbd5e1' }
      : { background: 'linear-gradient(135deg, rgba(79,70,229,0.95), rgba(14,165,233,0.82))', border: '1px solid rgba(129,140,248,0.55)', color: '#eef2ff' };
  return <button onClick={onClick} style={{ ...style, borderRadius: 12, padding: '10px 13px', fontWeight: 900, cursor: 'pointer', fontSize: 12 }}>{children}</button>;
}

export default function TriBrainControlPanel() {
  const [status, setStatus] = React.useState(null);
  const [repairs, setRepairs] = React.useState([]);
  const [receipts, setReceipts] = React.useState([]);
  const [decisions, setDecisions] = React.useState({});
  const [report, setReport] = React.useState(null);
  const [error, setError] = React.useState('');

  const system = React.useMemo(() => createTriBrainSystem({
    brainSettings: {
      [TRIBRAIN_BRAINS.STUDIO]: { enabled: true, available: true, localMode: true },
      [TRIBRAIN_BRAINS.CHATGPT_OPERATOR]: { enabled: true, available: false, localMode: false },
      [TRIBRAIN_BRAINS.IDE_AGENT]: { enabled: true, available: false, localMode: true },
    },
  }), []);

  const route = React.useMemo(() => system.plan({
    sourceBrain: TRIBRAIN_BRAINS.STUDIO,
    intent: 'RUN_PLATFORM_AUDIT',
    abilityClass: TRIBRAIN_ABILITY_CLASSES.AUDIT,
    riskLevel: TRIBRAIN_RISK_LEVELS.LOW,
    payload: { projectId: 'studio-core' },
  }, { role: 'builder', userId: 'studio_user', tenantId: 'tenant_default', projectIds: ['studio-core'] }), [system]);

  const refresh = React.useCallback(async () => {
    setError('');
    try {
      const [statusPayload, repairPayload, receiptPayload] = await Promise.all([
        fetch('/api/platform-sentinel/status').then(res => res.json()).catch(() => null),
        fetch('/api/platform-sentinel/repair-queue').then(res => res.json()).catch(() => null),
        fetch('/api/platform-sentinel/receipts?limit=10').then(res => res.json()).catch(() => null),
      ]);
      setStatus(statusPayload?.status || null);
      setRepairs(normalizeRepairs(repairPayload));
      setReceipts(normalizeReceipts(receiptPayload));
    } catch (err) {
      setError(err?.message || 'TriBrain proof state failed to load.');
    }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const score = auditScore(status);
  const approved = Object.values(decisions).filter(value => value === 'approved').length;
  const rejected = Object.values(decisions).filter(value => value === 'rejected').length;
  const brainStatus = system.status();

  const generateReport = () => {
    setReport({
      generatedAt: new Date().toISOString(),
      truthState: repairs.length > 0 ? 'REPAIR_REVIEW_REQUIRED' : 'READY_FOR_PROOF_REVIEW',
      auditScore: score,
      pendingRepairs: repairs.length,
      proofReceipts: receipts.length,
      selectedBrain: route?.evidence?.selectedBrain || route?.respondingBrain,
      decisions: { approved, rejected },
      nextActions: ['Review repair queue', 'Verify proof receipts', 'Run strict checks before demo'],
    });
  };

  return <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
      <div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#818cf8', fontSize: 12, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
          <BrainCircuit size={18} /> PH Evo TriBrain Control
        </div>
        <h1 style={{ margin: '10px 0 8px', fontSize: 34, color: '#f8fafc' }}>Autonomous studio cockpit</h1>
        <p style={{ margin: 0, maxWidth: 860, color: '#94a3b8', lineHeight: 1.65 }}>Pending repairs, audit score, proof ledger, approve/reject controls, bot status, and one-click platform report from the same governed TriBrain contract.</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" onClick={refresh}>Refresh</Button>
        <Button onClick={generateReport}>Generate report</Button>
      </div>
    </div>

    {error && <div style={{ border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(69,10,10,0.45)', color: '#fecaca', padding: 14, borderRadius: 14 }}>{error}</div>}

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
      <Stat icon={Gauge} label="Audit Score" value={score === null ? 'No proof' : `${score}%`} sub="Platform Sentinel" tone={score === null ? 'warn' : score >= 90 ? 'good' : 'warn'} />
      <Stat icon={ClipboardList} label="Pending Repairs" value={repairs.length} sub={`${approved} approved · ${rejected} rejected`} tone={repairs.length ? 'warn' : 'good'} />
      <Stat icon={FileText} label="Proof Ledger" value={receipts.length} sub="Latest receipts" tone={receipts.length ? 'good' : 'warn'} />
      <Stat icon={BrainCircuit} label="Route Brain" value={route?.evidence?.selectedBrain || 'studio'} sub={route?.truthState || 'TRIBRAIN'} tone="neutral" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 16 }}>
      <div style={card}>
        <h2 style={{ color: '#f8fafc', marginTop: 0 }}>Pending repairs</h2>
        {repairs.length === 0 && <p style={{ color: '#94a3b8' }}>No repair queue returned. Run a platform repair plan before making launch claims.</p>}
        <div style={{ display: 'grid', gap: 10 }}>
          {repairs.map(item => <div key={item.id} style={{ border: '1px solid rgba(148,163,184,0.14)', borderRadius: 14, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ color: '#f8fafc', fontWeight: 900 }}>{item.title}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>{item.detail}</div>
              </div>
              <Pill tone={decisions[item.id] === 'approved' ? 'good' : decisions[item.id] === 'rejected' ? 'bad' : 'warn'}>{decisions[item.id] || item.severity}</Pill>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button onClick={() => setDecisions(prev => ({ ...prev, [item.id]: 'approved' }))}><CheckCircle2 size={14} /> Approve</Button>
              <Button variant="danger" onClick={() => setDecisions(prev => ({ ...prev, [item.id]: 'rejected' }))}><XCircle size={14} /> Reject</Button>
              <Button variant="ghost" onClick={() => setDecisions(prev => ({ ...prev, [item.id]: 'needs_changes' }))}>Request changes</Button>
            </div>
          </div>)}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div style={card}>
          <h2 style={{ color: '#f8fafc', marginTop: 0 }}>Bot / daemon status</h2>
          {Object.entries(brainStatus.router.brains).map(([brain, state]) => <div key={brain} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(148,163,184,0.10)' }}>
            <span style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 850 }}>{brain}</span>
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><ToggleLeft size={16} color={state.enabled ? '#22c55e' : '#64748b'} /><Pill tone={state.available ? 'good' : 'warn'}>{state.available ? 'online' : 'fallback'}</Pill></span>
          </div>)}
          <div style={{ marginTop: 12 }}><Pill tone="good"><ShieldCheck size={12} /> Approval gate active</Pill></div>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 16 }}>
      <div style={card}>
        <h2 style={{ color: '#f8fafc', marginTop: 0 }}>Proof ledger</h2>
        {receipts.length === 0 && <p style={{ color: '#94a3b8' }}>No receipts returned yet.</p>}
        {receipts.map(item => <div key={item.id} style={{ border: '1px solid rgba(148,163,184,0.14)', borderRadius: 12, padding: 11, marginBottom: 9 }}>
          <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 12 }}>{item.title}</div>
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 5 }}>{item.detail}</div>
        </div>)}
      </div>

      <div style={card}>
        <h2 style={{ color: '#f8fafc', marginTop: 0 }}>One-click platform report</h2>
        {!report ? <p style={{ color: '#94a3b8' }}>Generate a report from current audit state, repairs, receipts, and TriBrain routing.</p> : <pre style={{ margin: 0, whiteSpace: 'pre-wrap', background: 'rgba(2,6,23,0.55)', border: '1px solid rgba(148,163,184,0.14)', borderRadius: 14, padding: 14, color: '#dbeafe', fontSize: 12, lineHeight: 1.55 }}>{JSON.stringify(report, null, 2)}</pre>}
      </div>
    </div>
  </section>;
}
