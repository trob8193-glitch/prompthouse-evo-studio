import React, { useEffect, useMemo, useState } from 'react';
import { Eye, AlertTriangle, CheckCircle2, Clock, Link2, RefreshCw } from 'lucide-react';

const BRIDGE_URL = 'http://127.0.0.1:3001';

function pillTone(health) {
  if (health === 'error') return { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', text: '#fca5a5' };
  if (health === 'warning') return { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)', text: '#fde68a' };
  return { bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)', text: '#86efac' };
}

export function EvoEyesView() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BRIDGE_URL}/api/studio/diagnostics?limit=70`, { signal: AbortSignal.timeout(12000) });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Diagnostics failed (${res.status})`);
        if (!mounted) return;
        setDiagnostics(data);
        if (!selectedId && data?.modules?.length) setSelectedId(data.modules[0].id);
      } catch (e) {
        if (!mounted) return;
        setError(String(e.message || e));
        setDiagnostics(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, [selectedId]);

  const summary = diagnostics?.summary || {};
  const probes = diagnostics?.probes || [];
  const modules = diagnostics?.modules || [];

  const selected = useMemo(() => modules.find((m) => m.id === selectedId) || null, [modules, selectedId]);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 14 }}>
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eye size={20} /> Evo Eyes
          </div>
          <div className="page-subtitle">Live module health, runtime probes, dependency edges (bridge-backed only).</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {loading ? <span className="badge badge-dim">Scanning...</span> : null}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedId((v) => v)}
            title="Refresh on next poll tick"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="card" style={{ border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(248,113,113,0.06)' }}>
          <div className="card-body" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertTriangle size={16} color="#f87171" />
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Diagnostics offline: {error}</div>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        <div className="card">
          <div className="card-body">
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.08em' }}>MODULES</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{summary.modules_scanned ?? '—'}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.08em' }}>ERRORS</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#f87171' }}>{summary.modules_error ?? '—'}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.08em' }}>WARNINGS</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>{summary.modules_warning ?? '—'}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.08em' }}>PROBE AVG</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{summary.avg_probe_latency_ms ?? '—'} ms</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14, marginTop: 14 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Modules</div></div>
          <div className="card-body" style={{ maxHeight: 520, overflowY: 'auto' }}>
            {modules.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>No diagnostics modules available.</div>
            ) : modules.map((m) => {
              const tone = pillTone(m.health);
              return (
                <button
                  key={m.id}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedId(m.id)}
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    background: selectedId === m.id ? 'rgba(99,102,241,0.12)' : 'rgba(2,6,23,0.35)',
                    border: selectedId === m.id ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.08)',
                    padding: '10px 10px'
                  }}
                >
                  <span style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 900 }}>{m.label || m.id}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{m.path}</div>
                  </span>
                  <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 999, background: tone.bg, border: `1px solid ${tone.border}`, color: tone.text }}>
                    {m.health}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-col gap-16">
          <div className="card">
            <div className="card-header"><div className="card-title">Selected Module</div></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              {!selected ? (
                <div style={{ color: 'var(--text-dim)' }}>Select a module.</div>
              ) : (
                <div className="flex-col gap-8">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    <div><div style={{ color: 'var(--text-dim)', fontSize: 10, fontWeight: 800 }}>HEALTH</div><div style={{ fontWeight: 900 }}>{selected.health}</div></div>
                    <div><div style={{ color: 'var(--text-dim)', fontSize: 10, fontWeight: 800 }}>LINES</div><div style={{ fontWeight: 900 }}>{selected.lines}</div></div>
                    <div><div style={{ color: 'var(--text-dim)', fontSize: 10, fontWeight: 800 }}>DEPS</div><div style={{ fontWeight: 900 }}>{(selected.dependencies || []).length}</div></div>
                  </div>

                  {(selected.issues || []).length ? (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>ISSUES</div>
                      <div style={{ marginTop: 8 }}>
                        {(selected.issues || []).slice(0, 10).map((iss, idx) => (
                          <div key={idx} style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(2,6,23,0.35)', marginBottom: 8 }}>
                            <div style={{ fontWeight: 900 }}>{iss.code}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>{iss.message}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#86efac' }}>
                      <CheckCircle2 size={16} /> No issues detected for this module.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Runtime Probes</div></div>
            <div className="card-body" style={{ fontSize: 12 }}>
              {probes.length === 0 ? (
                <div style={{ color: 'var(--text-dim)' }}>No probes available.</div>
              ) : (
                <div className="flex-col gap-8">
                  {probes.map((p) => (
                    <div key={p.id || p.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(2,6,23,0.35)' }}>
                      <div>
                        <div style={{ fontWeight: 900, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Link2 size={14} /> {p.path}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>status={p.status ?? '—'} latency={p.latency_ms ?? '—'}ms</div>
                      </div>
                      <span className="badge" style={{ background: p.ok ? 'rgba(34,197,94,0.10)' : 'rgba(248,113,113,0.12)', border: `1px solid ${p.ok ? 'rgba(34,197,94,0.35)' : 'rgba(248,113,113,0.35)'}`, color: p.ok ? '#86efac' : '#fca5a5' }}>
                        {p.ok ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-dim)', fontSize: 11 }}>
            <Clock size={14} /> Polls every 15s. No synthetic values.
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvoEyesView;

