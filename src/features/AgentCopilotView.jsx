/**
 * PromptHouse Evo Studio — Antigravity Agent Copilot View
 * ═══════════════════════════════════════════════════════════════
 * Full studio page for the autonomous Claude Opus + Gemini blended
 * agent daemon. Controls, tether status, task queue, cycle history.
 */
import React, { useState, useEffect, useCallback } from 'react';

// ─── API Wrappers ───────────────────────────────────────────────
async function agentFetch(path, opts = {}) {
  const r = await fetch(`/api/agent${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  return r.json();
}

const api = {
  status: () => agentFetch('/status'),
  metrics: () => agentFetch('/metrics'),
  tasks: () => agentFetch('/tasks'),
  cycle: () => agentFetch('/cycle', { method: 'POST', body: '{}' }),
  startDaemon: (intervalMinutes = 30) => agentFetch('/daemon/start', { method: 'POST', body: JSON.stringify({ intervalMinutes }) }),
  stopDaemon: () => agentFetch('/daemon/stop', { method: 'POST', body: '{}' }),
  approveTask: (id) => agentFetch(`/tasks/${id}/approve`, { method: 'POST' }),
  rejectTask: (id) => agentFetch(`/tasks/${id}/reject`, { method: 'POST' }),
  tetherPing: () => agentFetch('/tether/ping', { method: 'POST', body: JSON.stringify({ ideVersion: 'antigravity-ide' }) }),
};

// ─── Styles ─────────────────────────────────────────────────────
const card = {
  background: 'rgba(15, 15, 30, 0.85)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  padding: 20,
  marginBottom: 14,
};
const badge = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 10,
  fontWeight: 800,
  padding: '3px 10px',
  borderRadius: 6,
  background: `${color}18`,
  color,
  border: `1px solid ${color}40`,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
});
const btn = (color = '#818cf8') => ({
  background: `linear-gradient(135deg, ${color}20, ${color}44)`,
  border: `1px solid ${color}80`,
  color,
  padding: '8px 18px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
  transition: 'all 0.2s',
});
const dot = (color) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 8px ${color}`,
  display: 'inline-block',
});

// ─── Component ──────────────────────────────────────────────────
export default function AgentCopilotView() {
  const [state, setState] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const log = useCallback((msg, type = 'info') => {
    setLogs(l => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0, 60)]);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [statusRes, metricsRes, tasksRes] = await Promise.all([
        api.status(), api.metrics(), api.tasks(),
      ]);
      if (statusRes?.state) setState(statusRes.state);
      if (metricsRes?.metrics) setMetrics(metricsRes.metrics);
      if (tasksRes?.tasks) setTasks(tasksRes.tasks);
    } catch (e) {
      log(`Refresh failed: ${e.message}`, 'error');
    }
  }, [log]);

  useEffect(() => {
    refresh();
    // Tether ping to register IDE connection
    api.tetherPing().catch(() => {});
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  const handleCycle = async () => {
    setRunning(true);
    log('Starting Antigravity Agent cycle...');
    try {
      const res = await api.cycle();
      if (res?.result) {
        log(`Cycle complete. ${res.result.proposalCount || 0} proposals. Status: ${res.result.status}`, 'success');
        if (res.result.providerResults?.consulted) {
          log(`Providers: ${res.result.providerResults.consulted.join(' + ')} (${res.result.providerResults.blendMode})`, 'info');
        }
      }
      await refresh();
    } catch (e) {
      log(`Cycle failed: ${e.message}`, 'error');
    }
    setRunning(false);
  };

  const handleStartDaemon = async () => {
    log('Starting agent daemon (30min interval)...');
    try {
      await api.startDaemon(30);
      log('Agent daemon started.', 'success');
      await refresh();
    } catch (e) {
      log(`Daemon start failed: ${e.message}`, 'error');
    }
  };

  const handleStopDaemon = async () => {
    log('Stopping agent daemon...');
    try {
      await api.stopDaemon();
      log('Agent daemon stopped.', 'warn');
      await refresh();
    } catch (e) {
      log(`Daemon stop failed: ${e.message}`, 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveTask(id);
      log(`Task ${id.slice(0, 20)} approved.`, 'success');
      await refresh();
    } catch (e) {
      log(`Approve failed: ${e.message}`, 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectTask(id);
      log(`Task ${id.slice(0, 20)} rejected.`, 'warn');
      await refresh();
    } catch (e) {
      log(`Reject failed: ${e.message}`, 'error');
    }
  };

  const tetherColor = state?.tether?.connected ? '#4ade80' : '#f87171';
  const daemonActive = state?.active;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, background: 'linear-gradient(90deg, #a78bfa, #22d3ee, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🤖 Antigravity Blended Agent
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Claude Opus + Gemini • Autonomous Dev/Build Copilot • Full Auto-Write
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={dot(tetherColor)} />
            <span style={{ fontSize: 10, fontWeight: 700, color: tetherColor }}>
              {state?.tether?.connected ? 'IDE TETHERED' : 'IDE OFFLINE'}
            </span>
          </div>
          <span style={badge(daemonActive ? '#4ade80' : '#64748b')}>
            {daemonActive ? '● DAEMON ACTIVE' : '○ DAEMON IDLE'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={handleCycle} disabled={running} style={btn('#a78bfa')}>
          {running ? '⏳ Running...' : '⚡ Run Agent Cycle'}
        </button>
        {!daemonActive ? (
          <button onClick={handleStartDaemon} style={btn('#4ade80')}>▶ Start Daemon</button>
        ) : (
          <button onClick={handleStopDaemon} style={btn('#f87171')}>■ Stop Daemon</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14 }}>
        {/* Left Column */}
        <div>
          {/* Provider Blend Panel */}
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', marginBottom: 12 }}>PROVIDER BLEND</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {['claude_opus', 'gemini', 'evo_lm'].map(p => {
                const info = state?.providers?.[p] || {};
                const isAvail = info.available || info.status === 'local';
                const label = p === 'claude_opus' ? 'Claude Opus' : p === 'gemini' ? 'Gemini' : 'Evo LM';
                const icon = p === 'claude_opus' ? '🟣' : p === 'gemini' ? '🔵' : '🟢';
                return (
                  <div key={p} style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    background: isAvail ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isAvail ? '#4ade8030' : '#ffffff08'}`,
                  }}>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isAvail ? '#e2e8f0' : '#475569' }}>{label}</div>
                    <div style={{ fontSize: 9, color: isAvail ? '#4ade80' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      {info.status || 'unknown'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daemon Runtime Panel */}
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#22d3ee', marginBottom: 12 }}>DAEMON RUNTIME</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 11 }}>
              <div>Active: <strong style={{ color: daemonActive ? '#4ade80' : '#f87171' }}>{daemonActive ? 'YES' : 'NO'}</strong></div>
              <div>Running: <strong>{state?.running ? 'YES' : 'NO'}</strong></div>
              <div>Interval: <strong>{state?.intervalMinutes || 30}min</strong></div>
              <div>Cycles: <strong>{state?.cycleCount ?? 0}</strong></div>
              <div>Success: <strong style={{ color: '#4ade80' }}>{state?.successfulCycles ?? 0}</strong></div>
              <div>Failed: <strong style={{ color: '#f87171' }}>{state?.failedCycles ?? 0}</strong></div>
              <div>Last cycle: <strong>{state?.lastCycleAt ? new Date(state.lastCycleAt).toLocaleTimeString() : '—'}</strong></div>
              <div>Next cycle: <strong>{state?.nextCycleAt ? new Date(state.nextCycleAt).toLocaleTimeString() : '—'}</strong></div>
            </div>
          </div>

          {/* Handshake Panel */}
          <div style={card}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f5c842', marginBottom: 12 }}>DAEMON HANDSHAKES</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {Object.entries(state?.handshakes || {}).map(([id, hs]) => (
                <div key={id} style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  background: hs?.connected ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)',
                  border: `1px solid ${hs?.connected ? '#4ade8020' : '#f8717120'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={dot(hs?.connected ? '#4ade80' : '#f87171')} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', textTransform: 'capitalize' }}>{id}</span>
                  </div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>
                    {hs?.lastSync ? `Synced ${new Date(hs.lastSync).toLocaleTimeString()}` : 'Never synced'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Queue */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fb923c' }}>TASK QUEUE</div>
              <span style={{ fontSize: 10, color: '#475569' }}>{tasks.length} total</span>
            </div>
            {tasks.length === 0 ? (
              <div style={{ fontSize: 11, color: '#334155', fontStyle: 'italic' }}>No tasks yet. Run a cycle to scan for issues.</div>
            ) : (
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {tasks.slice(-20).reverse().map((t, i) => (
                  <div key={t.id || i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', marginBottom: 4, borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{t.issueType || t.type || 'task'}</div>
                      <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{t.detail}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={badge(
                        t.status === 'approved' ? '#4ade80' :
                        t.status === 'rejected' ? '#f87171' :
                        t.severity === 'high' ? '#f87171' :
                        t.severity === 'medium' ? '#f5c842' : '#818cf8'
                      )}>
                        {t.status || t.severity || 'pending'}
                      </span>
                      {t.status === 'pending_review' && (
                        <>
                          <button onClick={() => handleApprove(t.id)} style={{ ...btn('#4ade80'), padding: '4px 10px', fontSize: 9 }}>✓</button>
                          <button onClick={() => handleReject(t.id)} style={{ ...btn('#f87171'), padding: '4px 10px', fontSize: 9 }}>✕</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cost Dashboard */}
          {metrics && (
            <div style={card}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#818cf8', marginBottom: 12 }}>COST DASHBOARD</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 11 }}>
                <div>Total cycles: <strong>{metrics.totalCycles}</strong></div>
                <div>Today: <strong>{metrics.cyclesToday}</strong></div>
                <div>Receipts: <strong>{metrics.totalReceipts}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Logs */}
        <div style={{
          ...card,
          background: '#030408',
          height: 'fit-content',
          maxHeight: 700,
          position: 'sticky',
          top: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 10 }}>AGENT LOGS</div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, maxHeight: 620, overflowY: 'auto' }}>
            {logs.length === 0 && <div style={{ color: '#333' }}>// agent idle</div>}
            {logs.map((l, i) => (
              <div key={i} style={{
                marginBottom: 5,
                color: l.type === 'success' ? '#4ade80' : l.type === 'warn' ? '#f5c842' : l.type === 'error' ? '#f87171' : '#94a3b8',
              }}>
                <span style={{ opacity: 0.4 }}>[{l.ts}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
