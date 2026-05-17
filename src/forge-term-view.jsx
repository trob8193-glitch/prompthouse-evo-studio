/**
 * PromptHouse Evo Studio — ForgeTerm Panel
 * Owner: Dev | Truth State: built (virtual safe mode only)
 * Doctrine: Virtual terminal with safe mode, command classifier, approval gate, proof logging.
 * PTY backend only if real backend is running (promptbridge-server.js on :3001).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { addProofReceipt } from './prompt-base.js';

// ─── Command Classification ──────────────────────────────────────────────────────
const SAFE_COMMANDS = [
  /^ls\b/, /^dir\b/, /^pwd\b/, /^echo\b/, /^cat\b/,
  /^git (log|status|diff|show|branch)\b/, /^npm (list|run|test)\b/,
  /^node --version/, /^node -v/, /^npx vite\b/, /^npm run dev\b/,
  /^flutter (analyze|test|pub get|pub outdated)\b/,
];

const DANGEROUS_COMMANDS = [
  /^rm\s+-rf/, /^del\s+\/f/, /^format\b/, /^mkfs\b/,
  /^sudo\b/, /^su\b/, /^chmod\s+777/, /^git push.*--force/,
  /^npm publish/, /^stripe\b/, /^curl.*api_key/i,
  /^scp\b/, /^ssh\b/, /^wget\b.*exec/i,
];

function classifyCommand(cmd) {
  const trimmed = cmd.trim().toLowerCase();
  if (DANGEROUS_COMMANDS.some(p => p.test(trimmed))) return 'dangerous';
  if (SAFE_COMMANDS.some(p => p.test(trimmed))) return 'safe';
  return 'requires_approval';
}

// ─── Built-In Command Templates ──────────────────────────────────────────────────
const COMMAND_TEMPLATES = [
  { label: '📦 npm install', cmd: 'npm install', category: 'Setup' },
  { label: '🚀 Dev Server', cmd: 'npm run dev', category: 'Dev' },
  { label: '🌉 Start Bridge', cmd: 'npm run bridge', category: 'Dev' },
  { label: '🔄 Dev + Bridge', cmd: 'npm run dev:all', category: 'Dev' },
  { label: '🧪 Run Tests', cmd: 'npm test', category: 'Test' },
  { label: '🏗️ Build', cmd: 'npm run build', category: 'Build' },
  { label: '🔍 Vite Version', cmd: 'npx vite --version', category: 'Info' },
  { label: '📋 List Files', cmd: 'ls -la src/', category: 'Info' },
  { label: '🌿 Git Status', cmd: 'git status', category: 'Git' },
  { label: '📜 Git Log', cmd: 'git log --oneline -10', category: 'Git' },
  { label: '🔬 Flutter Analyze', cmd: 'flutter analyze', category: 'Flutter' },
  { label: '🧹 Flutter Test', cmd: 'flutter test', category: 'Flutter' },
];

// ─── ForgeTerm Component ─────────────────────────────────────────────────────────
export function ForgeTermView() {
  const [history, setHistory] = useState([
    { type: 'system', text: '╔══════════════════════════════════════╗' },
    { type: 'system', text: '║  ForgeTerm — Safe Mode Active        ║' },
    { type: 'system', text: '║  Owner: Dev Bot | Bridge: :3001      ║' },
    { type: 'system', text: '╚══════════════════════════════════════╝' },
    { type: 'info', text: '» Virtual safe-mode terminal. Real execution requires PromptBridge on port 3001.' },
    { type: 'info', text: '» Dangerous commands require Sovereignty approval before sending.' },
    { type: 'info', text: '» Type "help" to list available templates.' },
  ]);
  const [input, setInput] = useState('');
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [activeCategory, setActiveCategory] = useState('All');
  const termRef = useRef(null);
  const inputRef = useRef(null);

  // Check bridge connection
  useEffect(() => {
    async function check() {
      try {
        const r = await fetch('http://127.0.0.1:3001/status', { signal: AbortSignal.timeout(2000) });
        setBridgeConnected(r.ok);
      } catch { setBridgeConnected(false); }
    }
    check();
    const interval = setInterval(check, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [history]);

  const log = useCallback((type, text) => {
    setHistory(h => [...h, { type, text, ts: new Date().toLocaleTimeString() }]);
  }, []);

  const sendToBridge = useCallback(async (cmd) => {
    if (!bridgeConnected) {
      log('warn', `[LIVE-RUN BLOCKED] Bridge offline — cannot execute: ${cmd}`);
      log('output', `> ${cmd}`);
      log('output', '[BLOCKED] Start PromptBridge to execute this live run.');
      addProofReceipt('forge_term', `forge_term_exec`, 'blocked', { cmd, mode: 'live_run_blocked' });
      return;
    }
    try {
      const res = await fetch('http://127.0.0.1:3001/bridge/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, args: [] }),
      });
      const data = await res.json();
      log('output', `> ${cmd}`);
      log('output', data.message || data.error || 'Done.');
      addProofReceipt('forge_term', `forge_term_exec`, 'built', { cmd, bridgeResponse: data });
    } catch (e) {
      log('error', `Bridge error: ${e.message}`);
    }
  }, [bridgeConnected, log]);

  const runCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCmdHistory(h => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);

    if (trimmed === 'help') {
      log('system', '── Available Templates ──');
      COMMAND_TEMPLATES.forEach(t => log('info', `  ${t.label}: ${t.cmd}`));
      return;
    }

    if (trimmed === 'clear') {
      setHistory([{ type: 'system', text: 'Terminal cleared.' }]);
      return;
    }

    const classification = classifyCommand(trimmed);
    log('input', `$ ${trimmed} [${classification.toUpperCase()}]`);

    if (classification === 'dangerous') {
      log('error', '⛔ BLOCKED by Boundary: This command is classified as dangerous.');
      log('error', '   Sovereignty approval required. Contact the studio owner.');
      addProofReceipt('forge_term', `forge_term_blocked`, 'blocked', { cmd: trimmed, reason: 'dangerous_command' });
      return;
    }

    if (classification === 'requires_approval') {
      setPendingApproval(trimmed);
      log('warn', '⚠️  This command requires approval before execution.');
      log('warn', '   Review and click "Approve & Execute" or "Cancel".');
      return;
    }

    sendToBridge(trimmed);
  }, [log, sendToBridge]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      const newIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(newIdx);
      setInput(cmdHistory[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      const newIdx = Math.max(histIdx - 1, -1);
      setHistIdx(newIdx);
      setInput(newIdx === -1 ? '' : (cmdHistory[newIdx] || ''));
    }
  }, [input, cmdHistory, histIdx, runCommand]);

  const categories = ['All', ...new Set(COMMAND_TEMPLATES.map(t => t.category))];
  const filteredTemplates = activeCategory === 'All'
    ? COMMAND_TEMPLATES
    : COMMAND_TEMPLATES.filter(t => t.category === activeCategory);

  const logColors = {
    system: '#38bdf8',
    info: '#94a3b8',
    input: '#f5c842',
    output: '#4ade80',
    warn: '#fb923c',
    error: '#f87171',
  };

  return (
    <div className="flex-col animate-in" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title">⚡ ForgeTerm</div>
          <div className="page-subtitle">Virtual safe-mode terminal. Real execution via PromptBridge.</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1,
            background: bridgeConnected ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${bridgeConnected ? '#4ade80' : '#f87171'}`,
            color: bridgeConnected ? '#4ade80' : '#f87171',
          }}>
            {bridgeConnected ? '🟢 BRIDGE LIVE' : '🔴 BRIDGE OFFLINE — LIVE-RUN BLOCKED'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Command Templates Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '12px 16px' }}>
            <div className="card-title" style={{ fontSize: 13 }}>Command Templates</div>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-dim)' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  background: activeCategory === cat ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  color: activeCategory === cat ? '#000' : 'var(--text-muted)',
                  border: 'none',
                }}
              >{cat}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredTemplates.map((t, i) => (
              <button
                key={i}
                onClick={() => { setInput(t.cmd); inputRef.current?.focus(); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                  background: 'var(--bg-void)', border: '1px solid var(--border-dim)',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                  marginBottom: 4, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dim)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#030408' }}>
          {/* Output */}
          <div
            ref={termRef}
            style={{ flex: 1, overflowY: 'auto', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}
          >
            {history.map((line, i) => (
              <div key={i} style={{ color: logColors[line.type] || '#fff', marginBottom: 2 }}>
                {line.ts && <span style={{ color: '#333', marginRight: 8 }}>[{line.ts}]</span>}
                {line.text}
              </div>
            ))}
          </div>

          {/* Approval Gate */}
          {pendingApproval && (
            <div style={{
              padding: '12px 16px', background: 'rgba(251,146,60,0.1)',
              borderTop: '1px solid rgba(251,146,60,0.3)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ flex: 1, fontSize: 12, color: '#fb923c', fontFamily: 'var(--font-mono)' }}>
                ⚠️ APPROVAL REQUIRED: <strong>{pendingApproval}</strong>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => { sendToBridge(pendingApproval); setPendingApproval(null); }}
                style={{ background: '#fb923c', color: '#000', fontWeight: 800 }}
              >Approve & Execute</button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => { log('warn', 'Command cancelled by user.'); setPendingApproval(null); }}
              >Cancel</button>
            </div>
          )}

          {/* Input Row */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid #1a1a2e',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <span style={{ color: '#f5c842', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800 }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              ghostInput="Enter command... (↑↓ for history)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'var(--font-mono)', fontSize: 13, color: '#f5c842',
                caretColor: '#f5c842',
              }}
              autoFocus
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={() => { runCommand(input); setInput(''); }}
              style={{ minWidth: 80 }}
            >Run ↵</button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setHistory([{ type: 'system', text: 'Cleared.' }])}
            >Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
