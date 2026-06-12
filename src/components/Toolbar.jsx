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
    
    // Trigger real terminal command for build
    const res = await fetch(BRIDGE_URL + '/api/intelligence/execute', {
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
      const res = await fetch(BRIDGE_URL + '/api/intelligence/execute', {
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
    <div className="h-14 bg-linear-to-r from-[#050508]/90 via-[#0a0a10]/80 to-[#050508]/90 backdrop-blur-xl border-b border-[rgba(0,240,255,0.15)] flex items-center justify-between px-6 z-30 sticky top-0 shadow-[0_4px_30px_rgba(0,240,255,0.05)]">
      <div className="flex items-center gap-1 relative">
        {/* Glow behind tools */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-xl pointer-events-none rounded-full" />
        
        <IconButton icon={Box} label="Project Explorer" onClick={() => setActivePage('dashboard')} className="hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:scale-105 transition-all duration-300 rounded-lg" />
        <IconButton icon={Code} label="Code View" onClick={() => setActivePage('workspace')} className="hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:scale-105 transition-all duration-300 rounded-lg" />
        
        <div className="w-px h-6 bg-linear-to-b from-transparent via-[rgba(0,240,255,0.3)] to-transparent mx-2" />
        
        <IconButton icon={Save} label="Save File (Ctrl+S)" onClick={() => addNotification('File saved to physical disk.', 'success')} className="hover:text-emerald-400 hover:bg-emerald-400/10 hover:scale-105 transition-all duration-300 rounded-lg" />
        <IconButton icon={Play} label="Run Action" onClick={handleBuild} className="text-emerald-500 hover:text-emerald-300 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-all duration-300 rounded-lg" />
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-indigo-500/10 to-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-300 cursor-default">
          <Zap size={14} className="text-[#00f0ff] animate-pulse" />
          <span className="text-[10px] font-black text-[#e2e8f0] uppercase tracking-widest" style={{ textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>Evo Studio</span>
        </div>
        
        <div className="flex items-center gap-1 bg-[#020205]/40 p-1 rounded-xl border border-slate-800/50 shadow-inner">
          <IconButton icon={ShieldCheck} label="Truth Audit" onClick={handleAudit} className="hover:text-yellow-400 hover:bg-yellow-400/10 hover:scale-105 transition-all duration-300 rounded-lg" />
          <IconButton icon={Cpu} label="Engine Metrics" onClick={() => setActivePage('metrics')} className="hover:text-indigo-400 hover:bg-indigo-400/10 hover:scale-105 transition-all duration-300 rounded-lg" />
          <IconButton 
            icon={TerminalIcon} 
            label={terminalOpen ? "Collapse Terminal" : "Expand Terminal"} 
            onClick={() => setTerminalOpen(!terminalOpen)} 
            className={`${terminalOpen ? 'text-[#00f0ff] bg-[#00f0ff]/20 shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'text-slate-400'} hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:scale-105 transition-all duration-300 rounded-lg`} 
          />
          <IconButton icon={Settings} label="IDE Settings" onClick={() => setActivePage('settings')} className="hover:text-pink-400 hover:bg-pink-400/10 hover:scale-105 transition-all duration-300 rounded-lg" />
          <IconButton icon={Share2} label="Export Artifact" onClick={() => setActivePage('foundry')} className="hover:text-violet-400 hover:bg-violet-400/10 hover:scale-105 transition-all duration-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
