import React, { useState } from 'react';
import { BRIDGE_URL } from './config/bridge-config.js';
import { Hammer, Code2, Play, Terminal, Box, Sparkles } from 'lucide-react';

export function SelfBuildForgeView() {
  const [mission, setMission] = useState('');
  const [platform, setPlatform] = useState('react-node');
  const [status, setStatus] = useState('IDLE');
  const [logs, setLogs] = useState([]);

  const log = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const build = async () => {
    if (!mission.trim()) return;
    setStatus('BUILDING');
    setLogs([]);
    log('Initializing Autonomous Forge Sequence...');
    log(`Platform target: ${platform}`);
    log('Synthesizing initial prompt payload...');
    
    try {
      // Connect to the bridge server
      log('Transmitting to Agent Bridge...');
      const res = await fetch(`${BRIDGE_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `AUTONOMOUS FORGE MISSION: ${mission}\nPLATFORM: ${platform}\nExecute scaffolding and primary logic implementation.`,
          agentId: 'forge-master'
        })
      });
      
      if (!res.ok) throw new Error('Agent execution failed on bridge server.');
      const data = await res.json();
      log('Agent response received.');
      log(`Outcome: ${data.response || 'Success'}`);
      setStatus('SUCCESS');
    } catch (e) {
      log(`CRITICAL ERROR: ${e.message}`);
      setStatus('FAILED');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="glass-extreme rounded-2xl border-l-4 border-l-cyan-500 bg-cyan-950/20 p-4">
        <div className="text-cyan-100 font-bold mb-1 flex items-center gap-2">
          <Hammer size={18} /> Autonomous App Forge
        </div>
        <p className="text-cyan-500/70 text-sm">Describe a full-stack application mission. The local Evo agent swarm will orchestrate, scaffold, and generate the application autonomously.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* Input Panel */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col gap-6">
          <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter">Forge Config</div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-500" />
              App Mission Definition
            </label>
            <textarea 
              className="bg-black/50 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors w-full h-40 custom-scrollbar resize-none font-mono"
              placeholder="E.g., Build a local task management dashboard with a React frontend and Node.js SQLite backend..."
              value={mission}
              onChange={e => setMission(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Box size={14} className="text-indigo-400" />
              Target Architecture
            </label>
            <select 
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors w-full appearance-none"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
            >
              <option value="react-node">React / Node.js (Web)</option>
              <option value="flutter-dart">Flutter / Dart (Mobile)</option>
              <option value="vanilla-html">Vanilla HTML/JS (Static)</option>
              <option value="python-fastapi">Python FastAPI (Backend Only)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-white/10 mt-2">
            <button 
              onClick={build}
              disabled={status === 'BUILDING'}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] uppercase tracking-widest text-sm"
            >
              {status === 'BUILDING' ? (
                <>
                  <Code2 size={18} className="animate-bounce" />
                  Evolving Architecture...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Initiate Forge Sequence
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telemetry / Log Panel */}
        <div className="glass-extreme rounded-3xl border-neon-glow p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col gap-4 min-h-[400px]">
          <div className="flex justify-between items-center">
            <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter">Build Telemetry</div>
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
              status === 'IDLE' ? 'bg-slate-500/20 text-slate-400' :
              status === 'BUILDING' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' :
              status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {status}
            </span>
          </div>

          <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex flex-col flex-1 h-full">
            <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} /> Agent Console
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-1.5">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-xs font-mono italic">Awaiting mission parameters...</div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className="text-[11px] font-mono text-cyan-400/80 leading-relaxed break-words">
                    {l}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
