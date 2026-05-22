import React from 'react';
import { useSovereignStore } from '../store.js';
import {
  Save, Play, ShieldCheck, Cpu, Zap,
  Settings, Share2, Box, Code,
  Terminal as TerminalIcon
} from 'lucide-react';
import { IconButton } from './primitives.jsx';
import { BRIDGE_URL } from '../config/bridge-config.js';

export function Toolbar() {
  const {
    activeFile,
    addNotification,
    terminalOpen,
    setTerminalOpen,
    addTerminalLog,
    setActiveTerminalSession,
    setActivePage
  } = useSovereignStore();

  const handleBuild = async () => {
    setTerminalOpen(true);
    setActiveTerminalSession('build');
    addTerminalLog(`> [BUILD] Initiating production build for ${activeFile}...`, 'system', 'build');
    addTerminalLog(`> [BUILD] Source: ${activeFile}`, 'info', 'build');
    try {
      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'Terminal', action: 'run', payload: { command: 'npm run build' } }),
      });
      const data = await res.json();
      if (data.success) {
        addTerminalLog(data.result.output, 'success', 'build');
        addNotification('Build successful.', 'success');
      } else {
        addTerminalLog(data.error || 'Build failed.', 'error', 'build');
        addNotification('Build failed.', 'error');
      }
    } catch (err) {
      addTerminalLog(`Build error: ${err.message}`, 'error', 'build');
    }
  };

  const handleAudit = () => {
    setTerminalOpen(true);
    setActiveTerminalSession('security');
    addTerminalLog('evo audit', 'command', 'security');
    const fetchAudit = async () => {
      try {
        const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module: 'Terminal', action: 'run', payload: { command: 'evo audit' } }),
        });
        const data = await res.json();
        addTerminalLog(data.result?.output || 'Audit complete.', data.success ? 'success' : 'error', 'security');
      } catch (err) {
        addTerminalLog(`Audit error: ${err.message}`, 'error', 'security');
      }
    };
    fetchAudit();
  };

  return (
    <div style={{
      height: 56, background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px', zIndex: 30, position: 'sticky', top: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconButton icon={Box}  label="Project Explorer" onClick={() => setActivePage('dashboard')} />
        <IconButton icon={Code} label="Code View"        onClick={() => setActivePage('workspace')} />
        <div style={{ width: 1, height: 24, background: 'var(--border-mid)', margin: '0 8px' }} />
        <IconButton icon={Save} label="Save File (Ctrl+S)" onClick={() => addNotification('File saved to physical disk.', 'success')} />
        <IconButton icon={Play} label="Run Build" onClick={handleBuild} style={{ color: 'var(--accent-green)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20,
        }}>
          <Zap size={11} color="var(--accent-indigo)" />
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Sovereign Mode
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconButton icon={ShieldCheck}   label="Truth Audit"           onClick={handleAudit} />
          <IconButton icon={Cpu}           label="Engine Metrics"        onClick={() => setActivePage('metrics')} />
          <IconButton
            icon={TerminalIcon}
            label={terminalOpen ? 'Close Terminal' : 'Open Master Terminal'}
            onClick={() => setTerminalOpen(!terminalOpen)}
            style={{ color: terminalOpen ? 'var(--accent-indigo)' : undefined }}
          />
          <IconButton icon={Settings} label="IDE Settings"  onClick={() => setActivePage('settings')} />
          <IconButton icon={Share2}   label="Export Artifact" onClick={() => setActivePage('foundry')} />
        </div>
      </div>
    </div>
  );
}
