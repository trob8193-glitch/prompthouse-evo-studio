import React, { useEffect, useMemo, useState } from 'react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
import { safeFetchBridge } from '../config/bridge-config.js';

function badgeClass(verdict) {
  if (verdict === 'PLATFORM_READY') return 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
  if (verdict === 'READY_FOR_PILOT' || verdict === 'PROVIDER_GATED') return 'text-amber-300 border-amber-500/40 bg-amber-500/10';
  return 'text-red-300 border-red-500/40 bg-red-500/10';
}

export default function PlatformSentinelDashboard() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [learningStatus, setLearningStatus] = useState(null);
  const [learningError, setLearningError] = useState('');
  const [learningLoading, setLearningLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await safeFetchBridge('/api/platform-sentinel/status');
      if (!res.ok) throw new Error(`Platform Sentinel API failed`);
      setStatus(res.data?.status || res.data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }

    setLearningLoading(true);
    setLearningError('');
    try {
      const res = await safeFetchBridge('/api/evo-signal-learning/status');
      if (!res.ok) throw new Error(`Signal Learning API failed`);
      setLearningStatus(res.data?.status || res.data);
    } catch (err) {
      setLearningError(err.message || String(err));
    } finally {
      setLearningLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const release = status?.release || { verdict: 'UNKNOWN', truthLabel: 'NEEDS_REPAIR', reason: 'No status loaded.' };
  const p0 = useMemo(() => (status?.repairQueue || []).filter(item => item.priority === 'P0'), [status]);
  const onlineBlockers = status?.onlineBlockers || [];
  const requiredOnline = onlineBlockers.filter(item => !item.optional);

  return (
    <IDEPageLayout
      title="Platform Readiness Governor"
      description="Enforces proof-backed platform readiness across modules, APIs, UI actions, unproven claims, provider gates, release docs, and repair queues."
      actions={
        <button onClick={load} disabled={loading || learningLoading} className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-60">
          {loading || learningLoading ? 'Auditing…' : 'Refresh Audit'}
        </button>
      }
    >
      {error && <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Score</p>
          <p className="mt-2 text-3xl font-black text-white">{status?.score ?? '—'}</p>
        </div>
        <div className={`rounded-xl border p-4 ${badgeClass(release.verdict)}`}>
          <p className="text-xs uppercase tracking-widest opacity-80">Verdict</p>
          <p className="mt-2 text-lg font-black">{release.verdict}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">P0 Blockers</p>
          <p className="mt-2 text-3xl font-black text-white">{p0.length}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Online Blockers</p>
          <p className="mt-2 text-3xl font-black text-white">{requiredOnline.length}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Truth Label</p>
          <p className="mt-2 text-sm font-bold text-cyan-100">{release.truthLabel}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">{release.reason}</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="text-lg font-bold text-white">Module Readiness</h3>
          <div className="mt-4 space-y-3">
            {(status?.modules || []).map(module => (
              <div key={module.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-100">{module.label}</span>
                  <span className={module.status === 'PASS' ? 'text-emerald-300' : 'text-red-300'}>{module.status}</span>
                </div>
                {module.missing?.length > 0 && <p className="mt-2 text-xs text-slate-400">Missing: {module.missing.join(', ')}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="text-lg font-bold text-white">Repair Queue</h3>
          <div className="mt-4 space-y-3">
            {(status?.repairQueue || []).slice(0, 10).map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-sm font-semibold text-slate-100"><span className="text-cyan-300">{item.priority}</span> {item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{String(item.detail || '').slice(0, 240)}</p>
              </div>
            ))}
            {status?.repairQueue?.length === 0 && <p className="text-sm text-emerald-300">No repairs detected in the current audit.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="text-lg font-bold text-white">Online Blockers</h3>
          <div className="mt-4 space-y-3">
            {onlineBlockers.slice(0, 10).map((item, index) => (
              <div key={`${item.id}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-100"><span className="text-amber-300">{item.severity}</span> {item.label}</p>
                  <span className={item.optional ? 'text-slate-400' : 'text-amber-300'}>{item.optional ? 'OPTIONAL' : 'REQUIRED'}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{(item.reasons || []).join('; ')}</p>
                <p className="mt-2 text-xs text-cyan-200">{item.nextAction}</p>
              </div>
            ))}
            {onlineBlockers.length === 0 && <p className="text-sm text-emerald-300">No online provider blockers detected.</p>}
          </div>
        </section>
      </div>

      {/* 📡 Signal Fabric & Learning Status */}
      <div className="mt-8 border-t border-slate-800 pt-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">📡</span>
          <h3 className="text-lg font-bold text-white">Signal Fabric & Learning Status</h3>
        </div>

        {learningError && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200">
            {learningError}
          </div>
        )}

        {learningStatus && (
          <div className="mt-4 grid gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Captured Signals</p>
              <p className="mt-2 text-2xl font-black text-white">{learningStatus.eventCount ?? 0}</p>
              <p className="mt-1 text-[10px] text-slate-500 truncate">{learningStatus.files?.eventLog}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Training Examples</p>
              <p className="mt-2 text-2xl font-black text-cyan-300">{learningStatus.trainingEventCount ?? 0}</p>
              <p className="mt-1 text-[10px] text-slate-500 truncate">{learningStatus.files?.datasetJson}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Truth State</p>
              <p className="mt-2 text-sm font-black text-emerald-400 uppercase tracking-wider">{learningStatus.truthState ?? 'Waiting'}</p>
              <p className="mt-1 text-[10px] text-slate-500">Version: {learningStatus.version}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Observations Total</p>
              <p className="mt-2 text-2xl font-black text-white">
                {learningStatus.featureMemory ? Object.values(learningStatus.featureMemory).reduce((sum, item) => sum + (item.observations || 0), 0) : 0}
              </p>
              <p className="mt-1 text-[10px] text-slate-500 truncate">Feature Memory Count: {learningStatus.featureMemory ? Object.keys(learningStatus.featureMemory).length : 0}</p>
            </div>
          </div>
        )}

        {learningStatus?.featureMemory && Object.keys(learningStatus.featureMemory).length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Active Feature Observations</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400">
                    <th className="py-2 px-3">Feature Area</th>
                    <th className="py-2 px-3 text-right">Observations</th>
                    <th className="py-2 px-3 text-right">Normalized score</th>
                    <th className="py-2 px-3 text-right">Recommendations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {Object.entries(learningStatus.featureMemory).map(([featureName, metrics]) => (
                    <tr key={featureName} className="hover:bg-slate-900/20">
                      <td className="py-2 px-3 font-medium text-slate-200">{featureName}</td>
                      <td className="py-2 px-3 text-right text-slate-300">{metrics.observations ?? 1}</td>
                      <td className="py-2 px-3 text-right text-cyan-400 font-semibold">
                        {metrics.normalizedScore !== undefined ? `${(metrics.normalizedScore * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">{metrics.recommendations?.join('; ') || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </IDEPageLayout>
  );
}
