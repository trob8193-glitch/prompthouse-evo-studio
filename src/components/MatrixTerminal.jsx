import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Play, Square, Loader2 } from 'lucide-react';
import { useSovereignStore } from '../store.js';

export function MatrixTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState(['[SYSTEM] Matrix Terminal Initialized.', '[SYSTEM] Awaiting execution commands...']);
  const [command, setCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  
  const endRef = useRef(null);
  const bridgeUrl = useSovereignStore(s => s.apiConfig.bridgeUrl);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isOpen]);

  const runCommand = async (e) => {
    e.preventDefault();
    if (!command.trim() || executing) return;
    
    setLogs(prev => [...prev, `> ${command}`]);
    setExecuting(true);
    setCommand('');

    try {
      const res = await fetch(`${bridgeUrl}/api/terminal/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.stdout) setLogs(prev => [...prev, ...data.stdout.split('\n')]);
        if (data.stderr) setLogs(prev => [...prev, `[STDERR] ${data.stderr}`]);
      } else {
        setLogs(prev => [...prev, `[ERROR] ${data.error}`]);
      }
    } catch (err) {
      setLogs(prev => [...prev, `[CRITICAL FAULT] ${err.message}`]);
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
          background: '#0f172a', borderTop: '1px solid #1e293b',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8,
          cursor: 'pointer', color: '#94a3b8', fontSize: 12, fontWeight: 600,
          zIndex: 50,
        }}>
        <Terminal size={14} color="#22c55e" />
        <span>Open Matrix Terminal</span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 250,
      background: '#020617', borderTop: '1px solid #22c55e55',
      display: 'flex', flexDirection: 'column',
      zIndex: 50, fontFamily: 'monospace',
    }}>
      <div style={{
        padding: '8px 16px', background: '#0f172a', borderBottom: '1px solid #1e293b',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontSize: 12, fontWeight: 700 }}>
          <Terminal size={14} /> MATRIX SANDBOX EXECUTION
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: 16, color: '#22c55e', fontSize: 13,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {logs.map((log, i) => (
          <div key={i} style={{ opacity: log.startsWith('>') ? 0.7 : 1 }}>{log}</div>
        ))}
        {executing && <div style={{ color: '#eab308' }}>Executing... <Loader2 size={12} className="animate-spin inline" /></div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={runCommand} style={{
        display: 'flex', borderTop: '1px solid #1e293b', background: '#0f172a',
      }}>
        <div style={{ padding: '10px 16px', color: '#22c55e', fontWeight: 'bold' }}>$</div>
        <input 
          value={command} onChange={e => setCommand(e.target.value)}
          placeholder="npm run dev..."
          disabled={executing}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontFamily: 'monospace', fontSize: 13,
          }} 
        />
      </form>
    </div>
  );
}
