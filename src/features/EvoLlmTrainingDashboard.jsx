import React from 'react';
import { Brain, CheckCircle2, FileJson, Globe2, PackageCheck, Play, RefreshCw, RotateCcw, ShieldAlert, Trophy } from 'lucide-react';
import { safeFetchBridge } from '../config/bridge-config.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

const card = { background: 'rgba(15,23,42,.84)', border: '1px solid rgba(56,189,248,.22)', borderRadius: 18, padding: 18, boxShadow: '0 18px 60px rgba(0,0,0,.28)' };
const button = { border: '1px solid rgba(56,189,248,.35)', background: 'rgba(8,47,73,.35)', color: '#cffafe', borderRadius: 12, padding: '10px 12px', fontSize: 12, fontWeight: 850, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' };
function Badge({ children, tone = 'cyan' }) { const c = tone === 'green' ? ['#052e16', '#86efac'] : tone === 'red' ? ['#450a0a', '#fecaca'] : tone === 'amber' ? ['#451a03', '#fde68a'] : ['#083344', '#a5f3fc']; return <span style={{ background: c[0], color: c[1], borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900 }}>{children}</span>; }
async function post(path, body = {}) { return safeFetchBridge(path, { method: 'POST', timeout: 120000, body: JSON.stringify(body) }); }

export default function EvoLlmTrainingDashboard() {
  const [status, setStatus] = React.useState(null);
  const [plans, setPlans] = React.useState([]);
  const [runs, setRuns] = React.useState([]);
  const [versions, setVersions] = React.useState([]);
  const [globalNode, setGlobalNode] = React.useState(null);
  const [deepEvalMetrics, setDeepEvalMetrics] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [globalConsent, setGlobalConsent] = React.useState(false);
  const [dataRights, setDataRights] = React.useState(false);
  const [includeExamples, setIncludeExamples] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    try {
      const [s, p, r, v, g] = await Promise.all([
        safeFetchBridge('/api/evo-llm/status'),
        safeFetchBridge('/api/evo-llm/plans'),
        safeFetchBridge('/api/evo-llm/runs'),
        safeFetchBridge('/api/evo-llm/versions'),
        safeFetchBridge('/api/evo-llm/global-node/status')
      ]);
      if (s.ok) setStatus(s.data.status);
      if (p.ok) setPlans(p.data.plans || []);
      if (r.ok) setRuns(r.data.runs || []);
      if (v.ok) setVersions(v.data.versions || []);
      if (g.ok) setGlobalNode(g.data.status);
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

  const synthesize = async () => {
    setBusy(true);
    try {
      const result = await post('/api/evo-llm/synthesize');
      setMessage(result.ok ? `Synthesized ${result.data?.synthesizedCount || 0} examples` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  const runForceSelfTrain = async () => {
    setBusy(true);
    try {
      setMessage('Running forced self-train cycle (this may take a minute)...');
      const result = await post('/api/evo-llm/force-self-train');
      setMessage(result.ok ? `Force Self-Train Complete. ${result.data.message}` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  const runDeepEval = async () => {
    setBusy(true);
    try {
      const result = await safeFetchBridge('/api/evo-llm/eval/deep');
      if (result.ok) {
        setDeepEvalMetrics(result.data?.deepEvalMetrics);
        setMessage('Deep Semantic Evaluation Complete');
      } else {
        setMessage(`ERROR: ${result.error}`);
      }
    } finally { setBusy(false); }
  };

  const packageGlobalContribution = async () => {
    setBusy(true);
    try {
      const result = await post('/api/evo-llm/global-node/package', {
        includeExamples,
        scope: 'global-corpus',
        consent: {
          globalContribution: globalConsent,
          dataRightsConfirmed: dataRights,
          privateProviderTraining: true
        }
      });
      setMessage(result.ok ? `Global packet: ${result.data.packet?.truthState}` : `ERROR: ${result.error}`);
      await refresh();
    } finally { setBusy(false); }
  };

  return (
    <IDEPageLayout
      title="Evo LLM Training Orchestrator"
      description="Approval-gated dataset preparation, training receipts, model-card versioning, provider blocking, cost firewall checks, promotion, and rollback. It improves the pipeline without pretending model weights trained themselves in a broom closet. 🧠"
      actions={
        <button style={button} onClick={refresh} disabled={busy}><RefreshCw size={15}/>Refresh</button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: '#e2e8f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          <div style={card}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2"><Brain size={18}/><h3>Truth</h3></div>
              <Badge tone={status?.truthState?.includes('WARNING') ? 'amber' : 'green'}>{status?.truthState || 'NO_STATUS'}</Badge>
            </div>
            <div className="text-xs text-slate-300 mt-2 flex justify-between"><span>Total Valid Examples:</span> <span className="font-mono">{status?.validExamples} / {status?.totalExamples}</span></div>
            <div className="text-xs text-slate-300 flex justify-between"><span>Dataset Quality:</span> <span className="font-mono">{status?.datasetQualityScore}%</span></div>
            {deepEvalMetrics && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deep Evaluation</div>
                <div className="text-xs text-slate-300 flex justify-between"><span>Hallucination Score:</span> <span className="font-mono text-fuchsia-400">{deepEvalMetrics.hallucinationScore}/100</span></div>
                <div className="text-xs text-slate-300 flex justify-between"><span>Context Coherence:</span> <span className="font-mono text-indigo-400">{deepEvalMetrics.contextCoherence}/100</span></div>
                <div className="text-xs text-slate-300 flex justify-between mt-1"><span>Matrix Status:</span> <Badge tone="cyan">{deepEvalMetrics.matrixStatus}</Badge></div>
              </div>
            )}
          </div>
          <div style={card}><FileJson size={18}/><h3>Plans</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{plans.length}</div></div>
          <div style={card}><Play size={18}/><h3>Runs</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{runs.length}</div></div>
          <div style={card}><Trophy size={18}/><h3>Versions</h3><div style={{ fontSize: 28, fontWeight: 950 }}>{versions.length}</div></div>
        </div>
        <div style={card}>
          <h2>Controls</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {status && status.truthState === 'DATASET_READY' && <button style={button} onClick={() => createPlan('local-dataset')} disabled={busy}>Create Dataset Plan</button>}
            {status && <button style={button} onClick={synthesize} disabled={busy}><RefreshCw size={14} /> Synthesize Data</button>}
            {status && <button style={button} onClick={runDeepEval} disabled={busy}><Brain size={14} /> Deep Eval</button>}
            <button style={{ ...button, borderColor: '#a855f7', color: '#e9d5ff' }} onClick={runForceSelfTrain} disabled={busy}><Brain size={15}/>Force Self-Train Cycle</button>
            {plans[0] && plans[0].status === 'NEEDS_APPROVAL' && <button style={{ ...button, borderColor: '#34d399', background: 'rgba(5,46,22,.4)' }} onClick={approveLatest} disabled={busy}>Approve Plan {plans[0].id.split('_')[0]}</button>}
            <button style={button} onClick={() => createPlan('openai')} disabled={busy}><ShieldAlert size={15}/>Plan Provider Gate Test</button>
            <button style={button} onClick={approveLatest} disabled={busy}><CheckCircle2 size={15}/>Approve Latest</button>
            <button style={button} onClick={runLatest} disabled={busy}><Play size={15}/>Run Latest</button>
            <button style={button} onClick={promoteLatest} disabled={busy}><Trophy size={15}/>Promote Dataset Version</button>
            <button style={button} onClick={rollback} disabled={busy}><RotateCcw size={15}/>Rollback Active</button>
          </div>
          {message && <p style={{ color: message.startsWith('ERROR') ? '#fecaca' : '#a5f3fc', fontWeight: 800 }}>{message}</p>}
        </div>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginTop: 0 }}><Globe2 size={18}/> Global Node</h2>
              <Badge tone={globalNode?.truthState?.includes('READY') ? 'green' : 'amber'}>{globalNode?.truthState || 'NOT_LOADED'}</Badge>
            </div>
            <button style={button} onClick={packageGlobalContribution} disabled={busy}><PackageCheck size={15}/>Package Contribution</button>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14, color: '#cbd5e1', fontSize: 12, fontWeight: 800 }}>
            <label><input type="checkbox" checked={globalConsent} onChange={event => setGlobalConsent(event.target.checked)} /> Opt in global contribution</label>
            <label><input type="checkbox" checked={dataRights} onChange={event => setDataRights(event.target.checked)} /> Data rights confirmed</label>
            <label><input type="checkbox" checked={includeExamples} onChange={event => setIncludeExamples(event.target.checked)} /> Include redacted examples</label>
          </div>
          {(globalNode?.blockers || []).slice(0, 6).map((blocker) => <div key={blocker} style={{ marginTop: 8, color: '#fcd34d', fontSize: 12 }}>{blocker}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={card}><h2>Latest Plans</h2>{plans.slice(0,5).map(plan => <pre key={plan.id} style={{ whiteSpace: 'pre-wrap', background: '#020617', padding: 10, borderRadius: 10, fontSize: 10 }}>{JSON.stringify({ id: plan.id, provider: plan.provider, truthState: plan.truthState, risk: plan.risk }, null, 2)}</pre>)}</div>
          <div style={card}><h2>Latest Runs / Receipts</h2>{runs.slice(0,5).map(run => <pre key={run.id} style={{ whiteSpace: 'pre-wrap', background: '#020617', padding: 10, borderRadius: 10, fontSize: 10 }}>{JSON.stringify({ id: run.id, provider: run.provider, truthState: run.truthState, receiptFile: run.receiptFile, blockedReasons: run.blockedReasons }, null, 2)}</pre>)}</div>
        </div>
        <div style={card}><h2>Model / Dataset Versions</h2>{versions.slice(0,10).map(version => <pre key={version.id} style={{ whiteSpace: 'pre-wrap', background: '#020617', padding: 10, borderRadius: 10, fontSize: 10 }}>{JSON.stringify(version, null, 2)}</pre>)}</div>
      </div>
    </IDEPageLayout>
  );
}
