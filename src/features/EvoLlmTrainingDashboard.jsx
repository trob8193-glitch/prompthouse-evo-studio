import React from 'react';
import { Brain, CheckCircle2, FileJson, Play, RefreshCw, RotateCcw, ShieldAlert, Trophy } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';

const card = { background: 'rgba(15,23,42,.84)', border: '1px solid rgba(56,189,248,.22)', borderRadius: 18, padding: 18, boxShadow: '0 18px 60px rgba(0,0,0,.28)' };
const button = { border: '1px solid rgba(56,189,248,.35)', background: 'rgba(8,47,73,.35)', color: '#cffafe', borderRadius: 12, padding: '10px 12px', fontSize: 12, fontWeight: 850, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' };
function Badge({ children, tone = 'cyan' }) { const c = tone === 'green' ? ['#052e16', '#86efac'] : tone === 'red' ? ['#450a0a', '#fecaca'] : tone === 'amber' ? ['#451a03', '#fde68a'] : ['#083344', '#a5f3fc']; return <span style={{ background: c[0], color: c[1], borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900 }}>{children}</span>; }
async function post(path, body = {}) { return safeFetchBridge(path, { method: 'POST', timeout: 120000, body: JSON.stringify(body) }); }

export default function EvoLlmTrainingDashboard() {
  const [status, setStatus] = React.useState(null);
  const [plans, setPlans] = React.useState([]);
  const [runs, setRuns] = React.useState([]);
  const [versions, setVersions] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    try {
      const [s, p, r, v] = await Promise.all([
        safeFetchBridge('/api/evo-llm/status'),
        safeFetchBridge('/api/evo-llm/plans'),
        safeFetchBridge('/api/evo-llm/runs'),
        safeFetchBridge('/api/evo-llm/versions')
      ]);
      if (s.ok) setStatus(s.data.status);
      if (p.ok) setPlans(p.data.plans || []);
      if (r.ok) setRuns(r.data.runs || []);
      if (v.ok) setVersions(v.data.versions || []);
      setMessage('Evo LLM dashboard refreshed.');
    } finally { setBusy(false); }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const createPlan = async (provider = 'local-dataset') => {
    setBusy(true);
    try {
      const result = await post('/api/evo-llm/plan', { provider, objective: 'Improve Evo LLM studio reasoning from validated examples' });
      setMessage(result.ok ? `Plan created: ${result.data.plan?.id}` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  const approveLatest = async () => {
    const plan = plans[0];
    if (!plan) return setMessage('No plan exists to approve.');
    setBusy(true);
    try {
      const scope = plan.provider === 'local-dataset' ? 'dataset-only' : 'provider-training';
      const result = await post('/api/evo-llm/approve', { planId: plan.id, actor: 'studio_owner', scope });
      setMessage(result.ok ? `Approved: ${result.data.approval?.id}` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  const runLatest = async () => {
    const plan = plans[0];
    if (!plan) return setMessage('No plan exists to run.');
    setBusy(true);
    try {
      const result = await post('/api/evo-llm/run', { planId: plan.id });
      setMessage(result.ok ? `Run created: ${result.data.run?.id}` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  const promoteLatest = async () => {
    const run = runs.find(item => item.truthState === 'LOCAL_DATASET_PIPELINE_EXECUTED_NO_MODEL_WEIGHTS_TRAINED');
    if (!run) return setMessage('No completed local dataset run exists to promote.');
    setBusy(true);
    try {
      const result = await post('/api/evo-llm/promote', { runId: run.id, actor: 'studio_owner' });
      setMessage(result.ok ? `Promoted: ${result.data.version?.id}` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  const rollback = async () => {
    setBusy(true);
    try {
      const result = await post('/api/evo-llm/rollback', { actor: 'studio_owner', reason: 'Dashboard rollback' });
      setMessage(result.ok ? `Rollback created: ${result.data.rollback?.id}` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: '#e2e8f0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
      <div><h1 style={{ margin: 0, fontSize: 28, fontWeight: 950 }}>Evo LLM Training Orchestrator</h1><p style={{ color: '#94a3b8', maxWidth: 840 }}>Approval-gated dataset preparation, training receipts, model-card versioning, provider blocking, cost firewall checks, promotion, and rollback. It improves the pipeline without pretending model weights trained themselves in a broom closet. 🧠</p></div>
      <button style={button} onClick={refresh} disabled={busy}><RefreshCw size={15}/>Refresh</button>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
      <div style={card}><Brain size={18}/><h3>Truth State</h3><Badge tone={status?.truthState?.includes('BLOCK') ? 'red' : 'cyan'}>{status?.truthState || 'NO_STATUS'}</Badge></div>
      <div style={card}><FileJson size={18}/><h3>Plans</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{plans.length}</div></div>
      <div style={card}><Play size={18}/><h3>Runs</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{runs.length}</div></div>
      <div style={card}><Trophy size={18}/><h3>Versions</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{versions.length}</div></div>
    </div>
    <div style={card}>
      <h2>Controls</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button style={button} onClick={() => createPlan('local-dataset')} disabled={busy}><FileJson size={15}/>Plan Local Dataset</button>
        <button style={button} onClick={() => createPlan('openai')} disabled={busy}><ShieldAlert size={15}/>Plan Provider Gate Test</button>
        <button style={button} onClick={approveLatest} disabled={busy}><CheckCircle2 size={15}/>Approve Latest</button>
        <button style={button} onClick={runLatest} disabled={busy}><Play size={15}/>Run Latest</button>
        <button style={button} onClick={promoteLatest} disabled={busy}><Trophy size={15}/>Promote Dataset Version</button>
        <button style={button} onClick={rollback} disabled={busy}><RotateCcw size={15}/>Rollback Active</button>
      </div>
      {message && <p style={{ color: message.startsWith('ERROR') ? '#fecaca' : '#a5f3fc', fontWeight: 800 }}>{message}</p>}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div style={card}><h2>Latest Plans</h2>{plans.slice(0,5).map(plan => <pre key={plan.id} style={{ whiteSpace: 'pre-wrap', background: '#020617', padding: 10, borderRadius: 10, fontSize: 10 }}>{JSON.stringify({ id: plan.id, provider: plan.provider, truthState: plan.truthState, risk: plan.risk }, null, 2)}</pre>)}</div>
      <div style={card}><h2>Latest Runs / Receipts</h2>{runs.slice(0,5).map(run => <pre key={run.id} style={{ whiteSpace: 'pre-wrap', background: '#020617', padding: 10, borderRadius: 10, fontSize: 10 }}>{JSON.stringify({ id: run.id, provider: run.provider, truthState: run.truthState, receiptFile: run.receiptFile, blockedReasons: run.blockedReasons }, null, 2)}</pre>)}</div>
    </div>
    <div style={card}><h2>Model / Dataset Versions</h2>{versions.slice(0,10).map(version => <pre key={version.id} style={{ whiteSpace: 'pre-wrap', background: '#020617', padding: 10, borderRadius: 10, fontSize: 10 }}>{JSON.stringify(version, null, 2)}</pre>)}</div>
  </div>;
}
