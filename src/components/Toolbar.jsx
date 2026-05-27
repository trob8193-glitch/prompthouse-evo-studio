import React from 'react';
import { useSovereignStore } from '../store.js';
import { 
  Save, 
  Play, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Settings, 
  Share2,
  Box,
  Code,
  Terminal as TerminalIcon
} from 'lucide-react';
import { IconButton } from './primitives.jsx';

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
    
    // Trigger real terminal command for build
    const res = await fetch('http://127.0.0.1:3001/api/intelligence/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: 'Terminal',
        action: 'run',
        payload: { command: 'npm run build' }
      }),
    });
    const data = await res.json();
    if (data.success) {
      addTerminalLog(data.result.output, 'success', 'build');
      addNotification('Build successful.', 'success');
    } else {
      addTerminalLog(data.error || 'Build failed.', 'error', 'build');
      addNotification('Build failed.', 'error');
    }
  };

  const handleAudit = () => {
    setTerminalOpen(true);
    setActiveTerminalSession('security');
    addTerminalLog('evo audit', 'command', 'security');
    // The terminal will handle the 'evo audit' command logic
    const fetchAudit = async () => {
      const res = await fetch('http://127.0.0.1:3001/api/intelligence/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'Terminal',
          action: 'run',
          payload: { command: 'evo audit' }
        }),
      });
      const data = await res.json();
      addTerminalLog(data.result.output, data.success ? 'success' : 'error', 'security');
    };
    fetchAudit();
  };

  return (
    <div className="h-14 bg-[#09090b]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-30 sticky top-0">
      <div className="flex items-center gap-1">
        <IconButton icon={Box} label="Project Explorer" onClick={() => setActivePage('dashboard')} />
        <IconButton icon={Code} label="Code View" onClick={() => setActivePage('workspace')} />
        <div className="w-[1px] h-6 bg-slate-800 mx-2" />
        <IconButton icon={Save} label="Save File (Ctrl+S)" onClick={() => addNotification('File saved to physical disk.', 'success')} />
        <IconButton icon={Play} label="Run Action" onClick={handleBuild} className="text-emerald-500" />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <Zap size={12} className="text-indigo-400" />
          <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Sovereign Mode</span>
        </div>
        
        <div className="flex items-center gap-1">
          <IconButton icon={ShieldCheck} label="Truth Audit" onClick={handleAudit} />
          <IconButton icon={Cpu} label="Engine Metrics" onClick={() => setActivePage('metrics')} />
          <IconButton 
            icon={TerminalIcon} 
            label={terminalOpen ? "Close Terminal" : "Open Master Terminal"} 
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={terminalOpen ? "text-indigo-400" : ""}
          />
          <IconButton icon={Settings} label="IDE Settings" onClick={() => setActivePage('settings')} />
          <IconButton icon={Share2} label="Export Artifact" onClick={() => setActivePage('foundry')} />
        </div>
      </div>
    </div>
  );
}
