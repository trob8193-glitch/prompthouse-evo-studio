/**
 * PromptHouse Evo Studio — Pattern Miner Full View
 * Owner: Signal Foxhound | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { addProofReceipt } from './prompt-base.js';
import { minePatterns, getAllPatterns, generateRecipeFromPattern } from './worktwin-vault.js';

export function PatternMinerView() {
  const [patterns, setPatterns] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState([]);

  const log = useCallback((msg, type = 'info') => {
    setLogs(l => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0, 20)]);
  }, []);

  const refresh = useCallback(() => {
    setPatterns(getAllPatterns());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const scan = useCallback(async () => {
    setScanning(true);
    log('📡 Starting pattern scan of WorkTwin signals...', 'info');

    try {
      const found = minePatterns({ minFrequency: 1 });
      setPatterns(found);
      log(`✅ Scan complete: ${found.length} pattern(s) detected.`, found.length > 0 ? 'success' : 'info');
      addProofReceipt('pattern_miner', 'scan', 'verified', { count: found.length });
    } catch (e) {
      log(`❌ Scan failed: ${e.message}`, 'error');
    }
    
    setScanning(false);
  }, [log]);

  const createRecipe = useCallback((pattern) => {
    try {
      const recipe = generateRecipeFromPattern(pattern);
      log(`🪄 Generated recipe: ${recipe.name}`, 'success');
      refresh();
    } catch (e) {
      log(`❌ Failed to generate recipe: ${e.message}`, 'error');
    }
  }, [log, refresh]);

  return (
    <div className="flex-col gap-4 animate-in">
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-2">📡 Pattern Miner</div>
          <div className="text-sm font-bold text-cyan-500/50 uppercase tracking-widest mb-8">Analyze WorkTwin signals to find repeatable developer workflows and auto-generate tools.</div>
        </div>
        <button 
          className="glass-extreme text-neon-cyan border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-cyan-500/10 hover:scale-[1.02] active:scale-95" 
          onClick={scan} 
          disabled={scanning}
        >
          {scanning ? '📡 Scanning...' : '🔍 Scan for Patterns'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div className="flex-col gap-16">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header">
              <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Detected Patterns</div>
            </div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
              {patterns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📡</div>
                  <div className="empty-title">No patterns detected</div>
                  <div className="empty-sub">Capture more signals in the WorkTwin Vault and run a scan.</div>
                </div>
              ) : (
                <div className="flex-col gap-12">
                  {patterns.map(p => (
                    <div key={p.id} className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                      <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
                        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                          <span className="badge badge-violet">{p.patternType}</span>
                          <span style={{ fontSize: 11, color: 'var(--accent-gold)' }}>Frequency: {p.count}x</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
                          Examples:
                        </div>
                        <div className="flex-col gap-4">
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-void)', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                            "{p.example || p.signature || ''}"
                          </div>
                        </div>
                        <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Last seen: {p.lastSeenAt || '—'}</span>
                          <button className="glass-extreme shadow-[0_0_15px_rgba(217,70,239,0.1)] active:scale-95 text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/5 hover:scale-[1.02] active:scale-95-sm" onClick={() => createRecipe(p)}>🪄 Gen Recipe</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-col gap-16">
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-header"><div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-title">Miner Logs</div></div>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body" style={{ maxHeight: 400, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-dim)' }}>Awaiting signal analysis...</div>
              ) : logs.map((l, i) => (
                <div key={i} style={{ marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--border-dim)' }}>
                  <span style={{ color: 'var(--text-dim)' }}>[{l.ts}]</span>{' '}
                  <span style={{ color: l.type === 'success' ? '#4ade80' : l.type === 'error' ? '#f87171' : 'inherit' }}>
                    {l.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl" style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl-body">
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 8 }}>💡 About Pattern Miner</div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The Miner scans your private signal history to identify repeating tasks. 
                Higher frequency patterns are prioritized for tool autogeneration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
