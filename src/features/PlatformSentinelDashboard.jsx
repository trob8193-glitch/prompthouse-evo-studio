import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env?.VITE_BRIDGE_URL || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')));

function badgeClass(verdict) {
  if (verdict === 'PLATFORM_READY') return 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
  if (verdict === 'READY_FOR_PILOT' || verdict === 'PROVIDER_GATED') return 'text-amber-300 border-amber-500/40 bg-amber-500/10';
  return 'text-red-300 border-red-500/40 bg-red-500/10';
}

export default function PlatformSentinelDashboard() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/platform-sentinel/status`);
      if (!res.ok) throw new Error(`Platform Sentinel API failed with ${res.status}`);
      const data = await res.json();
      setStatus(data.status || data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const release = status?.release || { verdict: 'UNKNOWN', truthLabel: 'NEEDS_REPAIR', reason: 'No status loaded.' };
  const p0 = useMemo(() => (status?.repairQueue || []).filter(item => item.priority === 'P0'), [status]);
  const onlineBlockers = status?.onlineBlockers || [];
  const requiredOnline = onlineBlockers.filter(item => !item.optional);

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Platform Sentinel</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Platform Readiness Governor</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Enforces proof-backed platform readiness across modules, APIs, UI actions, unproven claims, provider gates, release docs, and repair queues.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-60">
          {loading ? 'Auditing…' : 'Refresh Audit'}
        </button>
      </div>

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
    </div>
  );
}
