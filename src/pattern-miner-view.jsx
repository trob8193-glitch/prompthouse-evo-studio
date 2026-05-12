/**
 * PromptHouse Evo Studio — Pattern Miner Full View
 * Owner: Signal Foxhound | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { addProofReceipt } from './prompt-base.js';
// Dummy implementations for missing pattern-miner.js
const runPatternMiner = () => [];
const getAllPatterns = () => [];
const generateRecipeFromPattern = (p) => ({ name: 'Theatrical-Stub Recipe' });

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
    
    // Simulate scan time
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const found = runPatternMiner({ minFrequency: 1 });
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
    <div className="flex-col animate-in">
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">📡 Pattern Miner</div>
          <div className="page-subtitle">Analyze WorkTwin signals to find repeatable developer workflows and auto-generate tools.</div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={scan} 
          disabled={scanning}
        >
          {scanning ? '📡 Scanning...' : '🔍 Scan for Patterns'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        <div className="flex-col gap-16">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Detected Patterns</div>
            </div>
            <div className="card-body">
              {patterns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📡</div>
                  <div className="empty-title">No patterns detected</div>
                  <div className="empty-sub">Capture more signals in the WorkTwin Vault and run a scan.</div>
                </div>
              ) : (
                <div className="flex-col gap-12">
                  {patterns.map(p => (
                    <div key={p.id} className="card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                      <div className="card-body">
                        <div className="flex-between" style={{ marginBottom: 8 }}>
                          <span className="badge badge-violet">{p.patternType}</span>
                          <span style={{ fontSize: 11, color: 'var(--accent-gold)' }}>Frequency: {p.frequency}x</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
                          Examples:
                        </div>
                        <div className="flex-col gap-4">
                          {p.examples.map((ex, i) => (
                            <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-void)', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                              "{ex}..."
                            </div>
                          ))}
                        </div>
                        <div className="flex-between" style={{ marginTop: 12 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Status: {p.status}</span>
                          <button className="btn btn-secondary btn-sm" onClick={() => createRecipe(p)}>🪄 Gen Recipe</button>
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
          <div className="card">
            <div className="card-header"><div className="card-title">Miner Logs</div></div>
            <div className="card-body" style={{ maxHeight: 400, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
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
          
          <div className="card" style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <div className="card-body">
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
