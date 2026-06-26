import React, { useState } from 'react';
import { DOMAIN_PACKS, STRICTNESS_MODES, scorePrompt, getGrade, getBarColor, buildPromptStack } from './engine.js';
import { Dna, Activity, Copy, CheckCircle2, ChevronRight, Send, Layers, Settings2, Target, Briefcase, Box, MessageSquare } from 'lucide-react';


import { universalSend } from './lib/universal-transport.js';
import { BRIDGE_URL } from './config/bridge-config.js';

async function callBridge(messages, systemPrompt = '') {
  try {
    const res = await universalSend(messages, systemPrompt);
    return res.message;
  } catch (err) {
    return `[TRANSPORT OFFLINE] ${err.message}`;
  }
}

// ── Prompt Score Ring ──
function ScoreRing({ score }) {
  const grade = getGrade(score);
  const color = score >= 90 ? '#f5c842' : score >= 80 ? '#8b5cf6' : score >= 70 ? '#22d3ee' : '#404060';
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 150) * circumference;
  
  return (
    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full blur-xl opacity-20 transition-all duration-700" style={{ backgroundColor: color }}></div>
      <svg width="96" height="96" viewBox="0 0 96 96" className="relative z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="48" cy="48" r="36" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-2xl font-black tracking-tighter" style={{ color }}>{score}</span>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 -mt-1">{grade.label.split(' ')[0]}</span>
      </div>
    </div>
  );
}

// ── Single output card ──
function OutputCard({ label, content, color = '#818cf8', icon: Icon = MessageSquare }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  return (
    <div className="glass-extreme rounded-2xl border-neon-glow shadow-[0_0_20px_rgba(0,0,0,0.3)] bg-[#030408] border-2 border-white/5 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}></div>
        <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2 relative z-10" style={{ color }}>
          <Icon size={14} /> {label}
        </div>
        <button 
          onClick={copy} 
          className="relative z-10 text-[10px] font-black uppercase tracking-widest bg-black/40 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
          style={{ color: copied ? '#4ade80' : 'var(--text-muted)' }}
        >
          {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-5 overflow-x-auto relative">
        <pre className="m-0 text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-slate-300 max-h-[400px] overflow-y-auto custom-scrollbar">
          {content || <span className="text-slate-600 italic">— Awaiting generation —</span>}
        </pre>
      </div>
    </div>
  );
}

export function AIPromptGeneratorView() {
  const [task, setTask] = useState('');
  const [stack, setStack] = useState('React, Node.js, OpenAI');
  const [context, setContext] = useState('');
  const [domain, setDomain] = useState('development');
  const [strictness, setStrictness] = useState('autonomous');
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState(null);
  const [liveResponse, setLiveResponse] = useState('');
  const [score, setScore] = useState(0);
  const [activeOutput, setActiveOutput] = useState('system');

  const generate = async () => {
    if (!task.trim()) return;
    setLoading(true);
    setLiveResponse('');
    const built = buildPromptStack({ task, stack, domain, strictness, context });
    setPrompts(built);
    const s = scorePrompt(task, stack, context, domain, strictness);
    setScore(s);

    const response = await callBridge(
      [{ role: 'user', content: built.executionPrompt }],
      built.systemPrompt
    );
    setLiveResponse(response);
    setLoading(false);
  };

  const domains = Object.values(DOMAIN_PACKS);
  const modes = Object.values(STRICTNESS_MODES);

  const TABS = [
    { id: 'system', label: 'System', color: '#22d3ee' },
    { id: 'execution', label: 'Execution', color: '#4ade80' },
    { id: 'repair', label: 'Repair', color: '#f87171' },
    { id: 'qa', label: 'QA Gate', color: '#f5c842' },
    { id: 'release', label: 'Release', color: '#8b5cf6' },
    { id: 'live', label: 'Live Output', color: '#ec4899', icon: Activity }
  ];

  return (
    <div className="flex flex-col gap-6 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4 shrink-0">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-indigo-500 tracking-tighter mb-1 flex items-center gap-2">
            <Dna size={28} className="text-fuchsia-400" /> AI Prompt Generator
          </div>
          <div className="text-xs font-bold text-fuchsia-500/50 uppercase tracking-widest">
            6-layer prompt stack builder · Live AI generation · Scoring & grading
          </div>
        </div>
        {score > 0 && (
          <div className="bg-black/40 border border-white/5 rounded-2xl p-2 pr-6 flex items-center gap-4 shadow-lg backdrop-blur-md">
            <ScoreRing score={score} />
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stack Score</div>
              <div className="text-sm font-black text-white">{getGrade(score).label}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* Left Column: Configuration */}
        <div className="flex flex-col gap-6">
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(217,70,239,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={14} className="text-fuchsia-400" /> Stack Configuration
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {/* Domain & Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-fuchsia-500 uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={12}/> Domain</label>
                  <div className="flex flex-col gap-2">
                    {domains.map(d => (
                      <button 
                        key={d.id} 
                        onClick={() => setDomain(d.id)} 
                        className={`text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 border ${
                          domain === d.id 
                            ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_10px_rgba(217,70,239,0.15)]' 
                            : 'bg-black/50 text-slate-400 border-white/5 hover:bg-white/5 hover:border-white/10 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-base">{d.icon}</span> {d.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1.5"><Target size={12}/> Mode</label>
                  <div className="flex flex-col gap-2">
                    {modes.map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => setStrictness(m.id)} 
                        className={`text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 border ${
                          strictness === m.id 
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.15)]' 
                            : 'bg-black/50 text-slate-400 border-white/5 hover:bg-white/5 hover:border-white/10 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-base">{m.icon}</span> {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="h-px bg-white/5 w-full"></div>

              {/* Inputs */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Task Definition</label>
                  <input 
                    value={task} 
                    onChange={e => setTask(e.target.value)}
                    placeholder="What do you want to build or solve? (e.g. Build a login screen with JWT auth)"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600 font-medium" 
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Layers size={12}/> Tech Stack</label>
                  <input 
                    value={stack} 
                    onChange={e => setStack(e.target.value)}
                    placeholder="Stack / Tools (e.g. React, Node.js, Supabase, Flutter)"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-100 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600 font-medium font-mono text-xs" 
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Box size={12}/> Context Pack</label>
                  <textarea 
                    value={context} 
                    onChange={e => setContext(e.target.value)}
                    placeholder="Context pack — user type, constraints, existing code, prior decisions... (supports {{variables}})"
                    className="w-full min-h-[100px] bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-white/30 transition-colors placeholder:text-slate-600 font-medium resize-y custom-scrollbar" 
                  />
                </div>
              </div>

              <button 
                onClick={generate} 
                disabled={loading || !task.trim()} 
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                  loading || !task.trim()
                    ? 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                }`}
              >
                {loading ? <Activity size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? 'Generating Stack...' : 'Generate & Run Live'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4 min-h-0">
          {!prompts && !loading ? (
            <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(217,70,239,0.05)] bg-black/40 backdrop-blur-xl h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-white/10">
                <Dna size={48} className="text-slate-400/50" />
              </div>
              <h3 className="text-xl font-black text-slate-200 mb-2">Awaiting Generation</h3>
              <p className="text-sm text-slate-500 max-w-sm">Configure your stack parameters on the left and click Generate to build the 6-layer prompt stack.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 h-full flex-1 min-h-0">
              {/* Tab selector */}
              <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl overflow-x-auto custom-scrollbar shrink-0 backdrop-blur-xl">
                {TABS.map(t => {
                  const Icon = t.icon || ChevronRight;
                  return (
                    <button 
                      key={t.id} 
                      onClick={() => setActiveOutput(t.id)} 
                      className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center ${
                        activeOutput === t.id 
                          ? 'shadow-[0_0_15px_rgba(0,0,0,0.5)]' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                      }`}
                      style={{
                        backgroundColor: activeOutput === t.id ? `${t.color}20` : 'transparent',
                        borderColor: activeOutput === t.id ? `${t.color}50` : 'transparent',
                        color: activeOutput === t.id ? t.color : undefined,
                        borderWidth: 1,
                        borderStyle: 'solid'
                      }}
                    >
                      <Icon size={14} className={activeOutput === t.id ? '' : 'opacity-50'} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Output Content */}
              <div className="flex-1 min-h-0 relative">
                {activeOutput === 'system' && <OutputCard label="System Prompt" content={prompts?.systemPrompt} color="#22d3ee" />}
                {activeOutput === 'execution' && <OutputCard label="Execution Prompt" content={prompts?.executionPrompt} color="#4ade80" />}
                {activeOutput === 'repair' && <OutputCard label="Repair Prompt" content={prompts?.repairPrompt} color="#f87171" />}
                {activeOutput === 'qa' && <OutputCard label="QA Gate Prompt" content={prompts?.qaPrompt} color="#f5c842" />}
                {activeOutput === 'release' && <OutputCard label="Release Gate" content={prompts?.releaseGatePrompt} color="#8b5cf6" />}
                {activeOutput === 'live' && (
                  <OutputCard 
                    label="Live AI Response (PromptBridge)" 
                    content={loading ? '' : liveResponse} 
                    color="#ec4899" 
                    icon={Activity}
                  />
                )}
                
                {loading && activeOutput === 'live' && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10">
                    <Activity size={32} className="text-pink-500 animate-spin mb-4" />
                    <div className="text-sm font-bold text-pink-400 animate-pulse uppercase tracking-widest">Bridging to Sovereign AI...</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
