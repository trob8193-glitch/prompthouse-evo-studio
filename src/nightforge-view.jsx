/**
 * PromptHouse Evo Studio — NightForge View
 * Owner: Temporal Raven | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { runNightForgeCycle, startNightForge, stopNightForge } from './nightforge.js';

export function NightForgeView() {
  const [proposal, setProposal] = useState(null);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState([]);

  const log = useCallback((msg, type = 'info') => {
    setLogs(l => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0, 30)]);
  }, []);

  const runCycle = useCallback(async () => {
    setRunning(true);
    log('🌙 Starting NightForge scan cycle...', 'info');
    
    try {
      const res = await runNightForgeCycle();
      setProposal(res);
      log(`✅ Cycle complete. ${res.proposedActions?.length} proposals generated.`, 'success');
    } catch (e) {
      log(`❌ Cycle failed: ${e.message}`, 'error');
    }
    
    setRunning(false);
  }, [log]);

  const toggleDaemon = useCallback(() => {
    if (active) {
      stopNightForge();
      setActive(false);
      log('🛑 NightForge Daemon deactivated.', 'warn');
    } else {
      startNightForge();
      setActive(true);
      log('⚡ NightForge Daemon activated (6h cycle).', 'success');
    }
  }, [active, log]);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">🌙 NightForge Daemon</div>
          <div className="page-subtitle">Background system health monitor. Scans for broken gates, UI friction, and dependency risks.</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className={`btn btn-sm ${active ? 'btn-danger' : 'btn-primary'}`}
            onClick={toggleDaemon}
          >
            {active ? '🛑 Stop Daemon' : '⚡ Start Daemon'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={runCycle} disabled={running}>
            {running ? '⏳ Scanning...' : '↻ Run Manual Cycle'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div className="flex-col gap-16">
          {proposal ? (
            <div className="card">
              <div className="card-header">
                <div className="flex-between">
                  <div className="card-title">Latest Patch Proposal</div>
                  <span className="badge badge-dim">ID: {proposal.id?.slice(0, 8)}</span>
                </div>
              </div>
              <div className="card-body flex-col gap-16">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-secondary)' }}>SCANNED ITEMS</div>
                  <div className="flex-col gap-4">
                    {proposal.scannedItems?.map((s, i) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {s}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-secondary)' }}>PROPOSED ACTIONS</div>
                  <div className="flex-col gap-8">
                    {proposal.proposedActions?.map((p, i) => (
                      <div key={i} className="card" style={{ background: 'var(--bg-void)', padding: 12, borderLeft: `4px solid ${p.priority === 'HIGH' ? '#f87171' : '#f5c842'}` }}>
                        <div className="flex-between" style={{ marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 12 }}>{p.action?.replace(/_/g, ' ')}</span>
                          <span className="badge badge-dim" style={{ fontSize: 9 }}>{p.priority}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.targets?.join(', ') || p.note}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 12, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#f87171', marginBottom: 4 }}>⚠️ SAFETY CONSTRAINTS</div>
                  <div className="flex-row gap-8 flex-wrap">
                    {proposal.cannot?.map(c => <span key={c} className="badge badge-dim" style={{ fontSize: 9 }}>BLOCK: {c}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🌙</div>
              <div className="empty-title">No proposals generated</div>
              <div className="empty-sub">Run a manual cycle or activate the daemon to see background health checks.</div>
            </div>
          )}
        </div>

        <div className="card" style={{ background: '#030408' }}>
          <div className="card-header"><div className="card-title">Daemon Logs</div></div>
          <div className="card-body" style={{ height: 400, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
            {logs.length === 0 && <div style={{ color: '#444' }}>// Daemon idle...</div>}
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
