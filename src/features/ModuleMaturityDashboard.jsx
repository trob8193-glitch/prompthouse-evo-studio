import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, FileJson, RefreshCw, ShieldCheck, Trophy } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

const card = {
  background: 'rgba(15,23,42,0.82)',
  border: '1px solid rgba(56,189,248,0.22)',
  borderRadius: 18,
  padding: 18,
  boxShadow: '0 18px 60px rgba(0,0,0,0.28)'
};

const button = {
  border: '1px solid rgba(56,189,248,0.35)',
  background: 'rgba(8,47,73,0.35)',
  color: '#cffafe',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 12,
  fontWeight: 850,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8
};

function Badge({ value, tone = 'cyan' }) {
  const colors = {
    green: ['rgba(22,163,74,0.18)', '#86efac', 'rgba(34,197,94,0.32)'],
    red: ['rgba(153,27,27,0.22)', '#fecaca', 'rgba(239,68,68,0.32)'],
    amber: ['rgba(180,83,9,0.18)', '#fde68a', 'rgba(245,158,11,0.32)'],
    cyan: ['rgba(8,145,178,0.20)', '#a5f3fc', 'rgba(34,211,238,0.30)'],
    slate: ['rgba(30,41,59,0.7)', '#cbd5e1', 'rgba(148,163,184,0.25)']
  };
  const c = colors[tone] || colors.cyan;
  return <span style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900 }}>{value}</span>;
}

function gradeTone(grade) {
  if (grade === 'A') return 'green';
  if (grade === 'B') return 'cyan';
  if (grade === 'C') return 'amber';
  return 'red';
}

function Stat({ label, value, icon: Icon, tone = 'cyan' }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {Icon && <Icon size={15} />} {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 26, fontWeight: 950, color: '#f8fafc' }}>{value}</div>
      <div style={{ marginTop: 8 }}><Badge value={tone.toUpperCase()} tone={tone} /></div>
    </div>
  );
}

export default function ModuleMaturityDashboard() {
  const [report, setReport] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const refresh = React.useCallback(async () => {
    setBusy(true);
    try {
      const result = await safeFetchBridge('/api/module-maturity/status', { timeout: 120000 });
      if (result.ok) {
        setReport(result.data.report || null);
        if (!selectedId && result.data.report?.modules?.length) setSelectedId(result.data.report.modules[0].id);
        setMessage('Maturity report refreshed.');
      } else {
        setMessage(`ERROR: ${result.error}`);
      }
    } finally {
      setBusy(false);
    }
  }, [selectedId]);

  React.useEffect(() => { refresh(); }, [refresh]);

  const writeReceipt = async () => {
    setBusy(true);
    try {
      const result = await safeFetchBridge('/api/module-maturity/receipt', { method: 'POST', timeout: 120000, body: JSON.stringify({}) });
      setMessage(result.ok ? `Receipt saved: ${result.data.receipt?.file || 'saved'}` : `ERROR: ${result.error}`);
      if (result.ok) setReport(result.data.receipt?.report || report);
    } finally {
      setBusy(false);
    }
  };

  const modules = report?.modules || [];
  const selected = modules.find(item => item.id === selectedId) || modules[0] || null;
  const blockers = report?.blockers || [];
  const avg = report?.averageScore || 0;
  const avgTone = avg >= 90 ? 'green' : avg >= 75 ? 'cyan' : avg >= 60 ? 'amber' : 'red';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0, letterSpacing: '-.04em' }}>Module Maturity Engine</h1>
          <p style={{ margin: '8px 0 0', color: '#94a3b8', maxWidth: 860 }}>Grades every major studio module against the 14-point production checklist: routes, UI, actions, services, data, errors, tests, build, audit, receipts, and user-readable success/failure. Finally, a scoreboard for the chaos. 🧪</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={button} onClick={refresh} disabled={busy}><RefreshCw size={15} /> Refresh</button>
          <button style={button} onClick={writeReceipt} disabled={busy}><FileJson size={15} /> Write Receipt</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        <Stat label="Average Maturity" value={`${avg}%`} icon={Trophy} tone={avgTone} />
        <Stat label="Modules Scanned" value={report?.moduleCount || 0} icon={Activity} tone="cyan" />
        <Stat label="A/B Modules" value={`${report?.summary?.a || 0}/${report?.summary?.b || 0}`} icon={ShieldCheck} tone="green" />
        <Stat label="Open Blockers" value={blockers.length} icon={AlertTriangle} tone={blockers.length ? 'amber' : 'green'} />
      </div>

      {message && <div style={{ color: message.startsWith('ERROR') ? '#fecaca' : '#a5f3fc', fontSize: 12, fontWeight: 850 }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 16 }}>
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Modules</h2>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {modules.map(module => (
              <button key={module.id} onClick={() => setSelectedId(module.id)} style={{ textAlign: 'left', width: '100%', background: selected?.id === module.id ? 'rgba(8,145,178,.22)' : '#020617', border: selected?.id === module.id ? '1px solid rgba(34,211,238,.45)' : '1px solid #1e293b', borderRadius: 12, padding: 12, cursor: 'pointer', color: '#e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <b style={{ fontSize: 12 }}>{module.name}</b>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Badge value={module.grade} tone={gradeTone(module.grade)} /><Badge value={`${module.score}%`} tone={gradeTone(module.grade)} /></span>
                </div>
                <div style={{ marginTop: 7, color: '#94a3b8', fontSize: 11 }}>{module.missing.length ? `${module.missing.length} missing checks` : 'All checks detected'}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>{selected?.name || 'No module selected'}</h2>
          {selected && <>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <Badge value={`Grade ${selected.grade}`} tone={gradeTone(selected.grade)} />
              <Badge value={`${selected.score}%`} tone={gradeTone(selected.grade)} />
              <Badge value={`${selected.missing.length} gaps`} tone={selected.missing.length ? 'amber' : 'green'} />
            </div>

            <h3 style={{ margin: '18px 0 8px', fontSize: 13, fontWeight: 900 }}>14-Point Checklist</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.entries(selected.checks).map(([key, passed]) => {
                const label = report?.checklist?.find(item => item.key === key)?.label || key;
                return <div key={key} style={{ background: '#020617', border: `1px solid ${passed ? 'rgba(34,197,94,.25)' : 'rgba(245,158,11,.28)'}`, borderRadius: 10, padding: 10, display: 'flex', gap: 8, alignItems: 'center' }}>{passed ? <CheckCircle2 size={14} color="#86efac" /> : <AlertTriangle size={14} color="#fde68a" />}<span style={{ color: passed ? '#dcfce7' : '#fde68a', fontSize: 11, fontWeight: 750 }}>{label}</span></div>;
              })}
            </div>

            <h3 style={{ margin: '18px 0 8px', fontSize: 13, fontWeight: 900 }}>Evidence</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: 10 }}><b style={{ fontSize: 11 }}>UI Files</b><pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', fontSize: 10 }}>{(selected.evidence.uiFiles || []).join('\n') || 'none found'}</pre></div>
              <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: 10 }}><b style={{ fontSize: 11 }}>API Files</b><pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', fontSize: 10 }}>{(selected.evidence.apiFiles || []).join('\n') || 'none found'}</pre></div>
              <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: 10 }}><b style={{ fontSize: 11 }}>Test Files</b><pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', fontSize: 10 }}>{(selected.evidence.testFiles || []).join('\n') || 'none found'}</pre></div>
            </div>

            {selected.evidence.bannedLanguage?.length > 0 && <div style={{ marginTop: 12, background: 'rgba(127,29,29,.22)', border: '1px solid rgba(248,113,113,.35)', borderRadius: 12, padding: 12 }}><b style={{ color: '#fecaca', fontSize: 12 }}>Banned Language Evidence</b><pre style={{ whiteSpace: 'pre-wrap', color: '#fecaca', fontSize: 10 }}>{JSON.stringify(selected.evidence.bannedLanguage, null, 2)}</pre></div>}
          </>}
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Top Blockers</h2>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {blockers.length === 0 && <p style={{ color: '#86efac', fontSize: 12 }}>No maturity blockers detected by static scan.</p>}
          {blockers.slice(0, 24).map((item, index) => <div key={`${item.moduleId}-${item.key}-${index}`} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ fontSize: 12, color: '#e2e8f0' }}>{item.moduleName}</span><Badge value={item.label} tone="amber" /></div>)}
        </div>
      </div>
    </div>
  );
}
