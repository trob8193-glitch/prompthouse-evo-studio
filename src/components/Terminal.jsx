import React, { useState, useRef, useEffect } from 'react';
import { useSovereignStore } from '../store.js';
import { 
  Terminal as TerminalIcon, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Trash2, 
  Maximize2, 
  Minimize2,
  Copy,
  Download,
  Settings,
  History,
  Shield,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

const BRIDGE_URL = 'http://127.0.0.1:3001';

export function Terminal() {
  const { 
    terminalOpen, 
    setTerminalOpen, 
    terminalSessions, 
    activeTerminalSession,
    setActiveTerminalSession,
    addTerminalLog, 
    clearTerminal,
    terminalTheme,
    setTerminalTheme,
    terminalHistory,
    addTerminalHistory,
    bondedNodes
  } = useSovereignStore();

  const [command, setCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef(null);

  const logs = terminalSessions[activeTerminalSession] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, terminalOpen]);

  const handleRunCommand = async (e) => {
    e?.preventDefault();
    if (!command.trim() || executing) return;

    const cmdText = command.trim();
    setCommand('');
    setHistoryIndex(-1);
    setExecuting(true);
    
    addTerminalLog(`$ ${cmdText}`, 'command', activeTerminalSession);
    addTerminalHistory(cmdText);

    try {
      const res = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'Terminal',
          action: 'run',
          payload: { command: cmdText, session: activeTerminalSession }
        }),
      });
      const data = await res.json();
      if (data.success) {
        addTerminalLog(data.result.output || 'EvoShell: Completed.', 'success', activeTerminalSession);
        if (data.result.node) {
          addBondedNode(data.result.node);
        }
      } else {
        addTerminalLog(data.error || 'EvoShell: Failed.', 'error', activeTerminalSession);
      }
    } catch (err) {
      addTerminalLog(`System Error: ${err.message}`, 'error', activeTerminalSession);
    } finally {
      setExecuting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < terminalHistory.length) {
        setHistoryIndex(nextIndex);
        setCommand(terminalHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setCommand(terminalHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const copyToClipboard = () => {
    const text = logs.map(l => l.content).join('\n');
    navigator.clipboard.writeText(text);
    // Simple notification would be nice, but we'll stick to the log
    addTerminalLog('System: Terminal output copied to clipboard.', 'system', activeTerminalSession);
  };

  const downloadLogs = () => {
    const text = logs.map(l => l.content).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evoshell_log_${activeTerminalSession}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!terminalOpen) return (
    <button 
      onClick={() => setTerminalOpen(true)}
      className="fixed bottom-0 left-[260px] right-0 h-9 bg-black border-t border-indigo-500/30 flex items-center px-6 hover:bg-slate-900 transition-all z-30 group"
    >
      <TerminalIcon size={14} className="text-indigo-400 mr-3 group-hover:scale-110 transition-transform" />
      <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Open Master EvoShell Terminal</span>
      <ChevronUp size={14} className="text-slate-500 ml-auto" />
    </button>
  );

  const themeStyles = {
    sovereign: {
      bg: 'bg-[#050508]',
      border: 'border-indigo-500/40',
      text: 'text-slate-300',
      accent: 'text-indigo-400',
      header: 'bg-indigo-500/5',
      logBg: 'bg-[rgba(10,10,15,0.7)]'
    },
    matrix: {
      bg: 'bg-black',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400/90',
      accent: 'text-emerald-400',
      header: 'bg-emerald-500/5',
      logBg: 'bg-black'
    },
    classic: {
      bg: 'bg-[#1e1e1e]',
      border: 'border-slate-700',
      text: 'text-white',
      accent: 'text-slate-400',
      header: 'bg-slate-800',
      logBg: 'bg-black/20'
    }
  };

  const s = themeStyles[terminalTheme] || themeStyles.sovereign;

  return (
    <div className={`fixed bottom-0 left-[260px] right-0 ${isFullscreen ? 'top-14 h-auto' : 'h-[320px]'} ${s.bg} border-t ${s.border} flex flex-col z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all duration-300`}>
      {/* Master Header */}
      <div className={`flex items-center justify-between px-6 py-2 ${s.header} border-b ${s.border}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <TerminalIcon size={16} className={s.accent} />
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${s.accent}`}>EvoShell Master Control</span>
          </div>
          
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-md border border-slate-800">
            {Object.keys(terminalSessions).map((session) => (
              <button
                key={session}
                onClick={() => setActiveTerminalSession(session)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                  activeTerminalSession === session 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {session}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-slate-800">
            <button onClick={() => setTerminalTheme('sovereign')} className={`w-3 h-3 rounded-full bg-indigo-500 ${terminalTheme === 'sovereign' ? 'ring-2 ring-white' : 'opacity-40'}`} />
            <button onClick={() => setTerminalTheme('matrix')} className={`w-3 h-3 rounded-full bg-emerald-500 ${terminalTheme === 'matrix' ? 'ring-2 ring-white' : 'opacity-40'}`} />
            <button onClick={() => setTerminalTheme('classic')} className={`w-3 h-3 rounded-full bg-slate-500 ${terminalTheme === 'classic' ? 'ring-2 ring-white' : 'opacity-40'}`} />
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-2" />

          <button onClick={copyToClipboard} title="Copy Output" className="text-slate-500 hover:text-indigo-400 transition-colors">
            <Copy size={14} />
          </button>
          <button onClick={downloadLogs} title="Download Logs" className="text-slate-500 hover:text-indigo-400 transition-colors">
            <Download size={14} />
          </button>
          <button onClick={() => clearTerminal(activeTerminalSession)} title="Clear Session" className="text-slate-500 hover:text-rose-400 transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} title="Fullscreen" className="text-slate-500 hover:text-white transition-colors">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={() => setTerminalOpen(false)} title="Minimize" className="text-slate-500 hover:text-white transition-colors">
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-8 px-6 py-1 bg-black/20 text-[8px] font-black uppercase tracking-[0.2em] border-b border-slate-900">
        <span className="flex items-center gap-2 text-slate-500"><Activity size={10} className="text-indigo-500" /> Latency: 12ms</span>
        <span className="flex items-center gap-2 text-slate-500"><Shield size={10} className="text-emerald-500" /> Bonding: {bondedNodes.length > 0 ? `${bondedNodes.length} Nodes` : 'Standalone'}</span>
        <span className="flex items-center gap-2 text-slate-500"><Zap size={10} className="text-amber-500" /> Power: Optimal</span>
        <span className="flex items-center gap-2 text-slate-500"><Layers size={10} className="text-indigo-400" /> Session: {activeTerminalSession.toUpperCase()}</span>
      </div>

      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-auto p-6 font-mono text-[11px] space-y-1.5 selection:bg-indigo-500/40 ${s.logBg} scrollbar-hide`}
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-4 leading-relaxed animate-in fade-in slide-in-from-left-1 duration-200">
            <span className="text-slate-700 shrink-0 select-none text-[9px] mt-0.5">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
            <span className={`break-all whitespace-pre-wrap flex-1 ${
              log.type === 'command' ? 'text-white font-bold' :
              log.type === 'error' ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]' :
              log.type === 'success' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]' :
              log.type === 'system' ? 'text-indigo-400 font-black' : 
              s.text
            }`}>
              {log.content}
            </span>
          </div>
        ))}
        {executing && (
          <div className="flex gap-4 animate-pulse">
            <span className="text-slate-700 text-[9px] mt-0.5">[......]</span>
            <span className="text-indigo-400 italic">Processing high-density directive...</span>
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <form 
        onSubmit={handleRunCommand}
        className={`px-6 py-4 ${s.header} border-t ${s.border} flex items-center gap-4 group focus-within:bg-indigo-500/5 transition-colors`}
      >
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-emerald-500 font-black text-xs">PS</span>
          <span className="text-slate-600 font-bold">C:\PH\Evo\Studio</span>
          <span className="text-indigo-500 font-black tracking-tighter">❯❯❯</span>
        </div>
        <input 
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={executing}
          placeholder="Awaiting master command..."
          className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[12px] placeholder:text-slate-700"
          autoFocus
        />
        {command.trim() && (
          <button type="submit" className="text-indigo-400 hover:text-white hover:scale-110 transition-all">
            <Play size={16} fill="currentColor" />
          </button>
        )}
        <div className="flex items-center gap-3 ml-4 opacity-30 group-focus-within:opacity-100 transition-opacity">
          <History size={14} className="text-slate-500" />
          <Settings size={14} className="text-slate-500" />
        </div>
      </form>
    </div>
  );
}
