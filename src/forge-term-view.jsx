import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ForgeTermView() {
  const [history, setHistory] = useState(['Welcome to ForgeTerm Safe Mode.', 'All executions are statically classified before dispatch.']);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setHistory(h => [...h, `> ${input}`]);
    const cmd = input.toLowerCase();
    
    setTimeout(() => {
      if (cmd.includes('rm ') || cmd.includes('delete')) {
        setHistory(h => [...h, `[SECURITY_GATE] BANNED COMMAND: ${cmd}`]);
      } else if (cmd === 'clear') {
        setHistory([]);
      } else {
        setHistory(h => [...h, `[DRY_RUN] physical execution: ${cmd}`]);
      }
    }, 300);
    
    setInput('');
  };

  return (
    <div className="flex flex-col h-96 bg-[#0a0a0a] rounded-xl border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden font-mono text-sm relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
      
      <div className="px-4 py-2 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
        <span className="text-gray-400 font-bold">Terminal // Safe Mode Active</span>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-emerald-400">
        {history.map((line, i) => (
          <div key={i} className="mb-1">{line}</div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleCommand} className="border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.5)] p-2 flex items-center">
        <span className="text-emerald-500 mr-2">C:\EvoStudio\&gt;</span>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-200"
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
