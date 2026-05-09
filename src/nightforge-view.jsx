/**
 * PromptHouse Evo Studio — NightForge View
 * Real daemon control + diagnostics-backed cycle reports.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  runNightForgeCycle,
  startNightForge,
  stopNightForge,
  getNightForgeStatus,
  getNightForgeMetrics,
  getNightForgeSettings,
  updateNightForgeSettings,
} from './nightforge.js';

function tone(priority = 'LOW') {
  if (priority === 'HIGH') return '#f87171';
  if (priority === 'MEDIUM') return '#f5c842';
  return '#60a5fa';
}

export function NightForgeView() {
  const [proposal, setProposal] = useState(null);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(false);
  const [daemonState, setDaemonState] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [forceThreeProviderTeam, setForceThreeProviderTeam] = useState(false);
  const [savingForceMode, setSavingForceMode] = useState(false);
  const [logs, setLogs] = useState([]);

  const log = useCallback((msg, type = 'info') => {
    setLogs((l) => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0, 40)]);
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await getNightForgeStatus();
      setDaemonState(status.state);
      setActive(Boolean(status.state?.active));
      if (status.state?.lastResult && !proposal) {
        setProposal(status.state.lastResult);
      }
      const [metricsPayload, settingsPayload] = await Promise.all([
        getNightForgeMetrics().catch(() => null),
        getNightForgeSettings().catch(() => null),
      ]);
      if (metricsPayload?.metrics) setMetrics(metricsPayload.metrics);
      if (typeof settingsPayload?.settings?.forceThreeProviderTeam === 'boolean') {
        setForceThreeProviderTeam(settingsPayload.settings.forceThreeProviderTeam);
      }
    } catch (e) {
      log(`Status refresh failed: ${e.message}`, 'error');
    }
  }, [log, proposal]);

  useEffect(() => {
    refreshStatus();
    const timer = setInterval(refreshStatus, 10000);
    return () => clearInterval(timer);
  }, [refreshStatus]);

  const runCycle = useCallback(async () => {
    setRunning(true);
    log('Starting NightForge diagnostics cycle...', 'info');
    try {
      const res = await runNightForgeCycle({
        includeProviders: ['evo_lm', 'openai', 'gemini'],
        forceThreeProviderTeam,
        train: true,
        useLiveStudio: true,
        mode: 'cost_guarded',
      });
      setProposal(res);
      log(`Cycle complete. ${res.proposedActions?.length || 0} actions generated.`, 'success');
      if (res.costSummary) {
        log(`Cost guard: external=${res.costSummary.externalCalls}, cache=${res.costSummary.cacheHits}, savedTokens=${res.costSummary.estimatedSavedTokens}`, 'info');
      }
      await refreshStatus();
    } catch (e) {
      log(`Cycle failed: ${e.message}`, 'error');
    }
    setRunning(false);
  }, [forceThreeProviderTeam, log, refreshStatus]);

  const toggleDaemon = useCallback(async () => {
    try {
      if (active) {
        await stopNightForge();
        setActive(false);
        log('NightForge daemon stopped.', 'warn');
      } else {
        const started = await startNightForge({
          intervalMinutes: 360,
          includeProviders: ['evo_lm', 'openai', 'gemini'],
          forceThreeProviderTeam,
          train: true,
          useLiveStudio: true,
          mode: 'cost_guarded',
          runNow: false,
        });
        setActive(true);
        log(`NightForge daemon started (${started?.state?.intervalMinutes || 360}m cycle).`, 'success');
      }
      await refreshStatus();
    } catch (e) {
      log(`Daemon toggle failed: ${e.message}`, 'error');
    }
  }, [active, forceThreeProviderTeam, log, refreshStatus]);

  const toggleForceMode = useCallback(async () => {
    const nextValue = !forceThreeProviderTeam;
    setSavingForceMode(true);
    try {
      await updateNightForgeSettings({ forceThreeProviderTeam: nextValue });
      setForceThreeProviderTeam(nextValue);
      log(
        nextValue
          ? 'Strict 3-provider team mode enabled (evo_lm + openai + gemini).'
          : 'Strict 3-provider team mode disabled.',
        'success',
      );
      await refreshStatus();
    } catch (e) {
      log(`Failed to update strict team mode: ${e.message}`, 'error');
    }
    setSavingForceMode(false);
  }, [forceThreeProviderTeam, log, refreshStatus]);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">NightForge Daemon</div>
          <div className="page-subtitle">Live diagnostics cycle with cost-guarded multi-provider team run and Evo LM training capture.</div>
          <div style={{ marginTop: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={toggleForceMode}
              disabled={savingForceMode}
            >
              {savingForceMode
                ? 'Saving...'
                : forceThreeProviderTeam
                  ? 'Strict 3-Team Mode: ON'
                  : 'Strict 3-Team Mode: OFF'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className={`btn btn-sm ${active ? 'btn-danger' : 'btn-primary'}`} onClick={toggleDaemon}>
            {active ? 'Stop Daemon' : 'Start Daemon'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={runCycle} disabled={running}>
            {running ? 'Running...' : 'Run Manual Cycle'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div className="flex-col gap-16">
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header"><div className="card-title">Daemon Runtime</div></div>
            <div className="card-body" style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              <div>Active: <strong>{daemonState?.active ? 'YES' : 'NO'}</strong></div>
              <div>Running: <strong>{daemonState?.running ? 'YES' : 'NO'}</strong></div>
              <div>Interval: <strong>{daemonState?.intervalMinutes || '—'} min</strong></div>
              <div>Org: <strong>{daemonState?.orgId || '—'}</strong></div>
              <div>Last cycle: <strong>{daemonState?.lastCycleAt || '—'}</strong></div>
              <div>Next cycle: <strong>{daemonState?.nextCycleAt || '—'}</strong></div>
              <div>Success cycles: <strong>{daemonState?.successfulCycles ?? 0}</strong></div>
              <div>Failed cycles: <strong>{daemonState?.failedCycles ?? 0}</strong></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header"><div className="card-title">Cost Dashboard</div></div>
            <div className="card-body" style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              <div>Today cycles: <strong>{metrics?.cyclesToday ?? 0}</strong></div>
              <div>Today credits: <strong>{metrics?.creditsToday ?? 0}</strong></div>
              <div>External calls: <strong>{metrics?.externalCallsToday ?? 0}</strong></div>
              <div>Cache hits: <strong>{metrics?.cacheHitsToday ?? 0}</strong></div>
              <div>Saved tokens: <strong>{metrics?.savedTokensToday ?? 0}</strong></div>
              <div>Provider mix: <strong>{`L:${metrics?.providerMix?.evo_lm ?? 0} O:${metrics?.providerMix?.openai ?? 0} G:${metrics?.providerMix?.gemini ?? 0}`}</strong></div>
            </div>
            {metrics?.trend?.length ? (
              <div style={{ marginTop: 10, padding: '0 16px 14px', fontSize: 11, color: 'var(--text-secondary)' }}>
                Last cycle trend: {metrics.trend.slice(-4).map((t) => `${t.creditsUsed}c/${t.savedTokens}tok`).join(' • ')}
              </div>
            ) : null}
          </div>

          {proposal ? (
            <div className="card">
              <div className="card-header">
                <div className="flex-between">
                  <div className="card-title">Latest Cycle Plan</div>
                  <span className="badge badge-dim">ID: {proposal.id?.slice(0, 14)}</span>
                </div>
              </div>
              <div className="card-body flex-col gap-16">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-secondary)' }}>SCANNED ITEMS</div>
                  <div className="flex-col gap-4">
                    {(proposal.scannedItems || []).map((s, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {s}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-secondary)' }}>PROPOSED ACTIONS</div>
                  <div className="flex-col gap-8">
                    {(proposal.proposedActions || []).map((p, i) => (
                      <div key={i} className="card" style={{ background: 'var(--bg-void)', padding: 12, borderLeft: `4px solid ${tone(p.priority)}` }}>
                        <div className="flex-between" style={{ marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 12 }}>{String(p.action || 'action').replace(/_/g, ' ')}</span>
                          <span className="badge badge-dim" style={{ fontSize: 9 }}>{p.priority || 'LOW'}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{(p.targets || []).join(', ') || p.note}</div>
                        {p.note ? <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>{p.note}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>

                {proposal.costSummary ? (
                  <div style={{ padding: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', marginBottom: 6 }}>COST SUMMARY</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      External calls: {proposal.costSummary.externalCalls} • Cache hits: {proposal.costSummary.cacheHits} • Local calls: {proposal.costSummary.localCalls}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Credits used: {proposal.costSummary.creditsUsed} • Saved tokens: {proposal.costSummary.estimatedSavedTokens}
                    </div>
                  </div>
                ) : null}

                <div style={{ padding: 12, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#f87171', marginBottom: 4 }}>SAFETY CONSTRAINTS</div>
                  <div className="flex-row gap-8 flex-wrap">
                    {(proposal.cannot || []).map((c) => <span key={c} className="badge badge-dim" style={{ fontSize: 9 }}>BLOCK: {c}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">NF</div>
              <div className="empty-title">No cycle results yet</div>
              <div className="empty-sub">Run a manual cycle to generate real diagnostics and repair actions.</div>
            </div>
          )}
        </div>

        <div className="card" style={{ background: '#030408' }}>
          <div className="card-header"><div className="card-title">Daemon Logs</div></div>
          <div className="card-body" style={{ height: 460, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
            {logs.length === 0 && <div style={{ color: '#444' }}>// daemon idle</div>}
            {logs.map((l, i) => (
              <div key={i} style={{ marginBottom: 6, color: l.type === 'success' ? '#4ade80' : l.type === 'warn' ? '#f5c842' : l.type === 'error' ? '#f87171' : '#94a3b8' }}>
                <span style={{ opacity: 0.5 }}>[{l.ts}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
