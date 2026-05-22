import React, { useState, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { Button, Card, StatusBadge } from './primitives.jsx';
import { Sparkles, Check, RefreshCw } from 'lucide-react';
import { BRIDGE_URL } from '../config/bridge-config.js';

/**
 * PH EVO STUDIO — GHOST EDITOR
 * ═══════════════════════════════════════════════════════════════
 * Holographic overlay editor that shows AI-suggested code on top
 * of the original file, allowing one-click sovereign merge.
 */

export function GhostEditor() {
  const { activeFile, addNotification, logToLedger } = useSovereignStore();
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [originalCode, setOriginalCode] = useState('// Select a file to begin...');
  const [ghostCode, setGhostCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeFile) loadOptimization();
  }, [activeFile]);

  const loadOptimization = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'GhostEditor', action: 'get', payload: { filePath: activeFile } }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalCode(data.result.originalCode);
        setGhostCode(data.result.ghostCode);
        setIsGhostActive(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      addNotification(`Failed to load ghost layer: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'GhostEditor', action: 'merge', payload: { filePath: activeFile, code: ghostCode } }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification(`Merged Sovereign Optimization into ${activeFile}`, 'success');
        setOriginalCode(ghostCode);
        setIsGhostActive(false);
        logToLedger('ghost_editor', 'merge_success', null, 'VERIFIED', 50);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      addNotification(`Merge failed: ${err.message}`, 'error');
    }
  };

  return (
    <Card
      className="flex-1 relative p-0 font-mono text-sm overflow-hidden h-full flex flex-col border-none"
      style={{ background: 'var(--bg-deep)' }}
    >
      {/* Ghost Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-subtle)', zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} color="var(--accent-indigo)" />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeFile || 'No file selected'}
          </span>
          {loading && <RefreshCw size={12} color="var(--text-dim)" style={{ animation: 'spin 1s linear infinite' }} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isGhostActive && <StatusBadge status="executing" label="GHOST LAYER ACTIVE" />}
          <Button size="sm" variant="ghost" onClick={() => setIsGhostActive(!isGhostActive)} className="text-[10px]">
            {isGhostActive ? 'Hide Overlay' : 'Show Ghost'}
          </Button>
          <Button size="sm" variant="primary" onClick={handleMerge} disabled={!isGhostActive || loading} className="text-[10px] gap-2">
            <Check size={14} /> Merge
          </Button>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, overflow: 'auto', padding: 24, background: 'rgba(2,6,23,0.5)' }}>
        {/* Original Code Layer */}
        <pre style={{ color: 'var(--text-dim)', transition: 'opacity 0.4s', opacity: isGhostActive ? 0.3 : 1 }}>
          <code>{originalCode}</code>
        </pre>

        {/* Holographic Ghost Layer */}
        {isGhostActive && !loading && (
          <pre style={{
            position: 'absolute', top: 24, left: 24,
            color: 'var(--accent-violet)',
            filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.6))',
            pointerEvents: 'none',
            animation: 'fadeInUp 0.4s ease',
          }}>
            <code>{ghostCode}</code>
          </pre>
        )}

        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <RefreshCw size={28} color="var(--accent-indigo)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 10, color: 'var(--accent-indigo)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Generating Sovereign Reality...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mini Info Bar */}
      <div style={{
        padding: '6px 16px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>Active File: {activeFile || '—'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Overlay ratio: {originalCode && ghostCode ? `${(ghostCode.length / Math.max(1, originalCode.length)).toFixed(2)}x` : '—'}</span>
          <span>Chars delta: {originalCode && ghostCode ? `${ghostCode.length - originalCode.length}` : '—'}</span>
        </span>
      </div>
    </Card>
  );
}
