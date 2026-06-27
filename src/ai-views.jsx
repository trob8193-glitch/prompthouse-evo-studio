import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Code2, Wrench, MessageSquare, Plus, Check, Play, BookOpen, Fingerprint } from 'lucide-react';

export function IntentAnalyzerView() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const analyze = () => {
    setAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResults({
        primary: 'SaaS Architecture Genesis',
        confidence: '98.4%',
        vectors: ['Backend/Node', 'Frontend/React', 'Auth/JWT', 'Database/SQL'],
        riskLevel: 'Low'
      });
    }, 1500);
  };

  return (
    <div className="p-6 h-[400px] flex flex-col bg-[#050510] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/10 blur-[100px] rounded-full"></div>
      
      <div className="flex items-center gap-3 mb-6 z-10">
        <Search className="text-fuchsia-400" />
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Semantic Intent Analyzer</h2>
      </div>

      <div className="flex gap-4 z-10">
        <input 
          className="flex-1 bg-black/50 border border-fuchsia-500/30 rounded-lg px-4 text-white focus:outline-none focus:border-fuchsia-400" 
          placeholder="Paste raw prompt to extract physical intent..."
        />
        <button onClick={analyze} className="px-6 py-2 bg-fuchsia-500 text-white font-bold rounded-lg hover:bg-fuchsia-400">
          Analyze
        </button>
      </div>

      <div className="flex-1 mt-6 bg-black/40 rounded-lg border border-[rgba(255,255,255,0.05)] p-6 z-10 flex flex-col justify-center">
        {analyzing ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-400 rounded-full animate-spin mb-4"></div>
            <p className="text-fuchsia-400 font-mono text-xs uppercase tracking-widest animate-pulse">Running heuristic vector pass...</p>
          </div>
        ) : results ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
            <div className="bg-black/60 p-4 rounded-lg border border-[rgba(255,255,255,0.02)]">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Primary Intent</div>
              <div className="text-lg font-bold text-fuchsia-400">{results.primary}</div>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-[rgba(255,255,255,0.02)]">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Confidence Score</div>
              <div className="text-lg font-bold text-emerald-400">{results.confidence}</div>
            </div>
            <div className="col-span-2 bg-black/60 p-4 rounded-lg border border-[rgba(255,255,255,0.02)]">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Extracted Feature Vectors</div>
              <div className="flex gap-2">
                {results.vectors.map(v => (
                  <span key={v} className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-300 rounded text-xs border border-fuchsia-500/20">{v}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-gray-600 italic text-sm">Awaiting payload.</div>
        )}
      </div>
    </div>
  );
}

export function PromptDNAView() {
  return (
    <div className="p-6 h-[400px] flex flex-col bg-[#050510] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <Fingerprint className="text-cyan-400" />
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Prompt DNA Structure</h2>
      </div>
      
      <div className="flex-1 flex gap-4">
        <div className="w-1/3 bg-black/40 border border-cyan-500/20 rounded-lg p-4 overflow-y-auto">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">DNA Nodes</div>
          <div className="space-y-2 text-sm font-mono text-gray-300">
            <div className="pl-0 text-cyan-400">├── System Persona</div>
            <div className="pl-4 text-emerald-400">├── Constraint Matrix</div>
            <div className="pl-8 text-gray-400">├── Strict Reality Rule</div>
            <div className="pl-8 text-gray-400">├── Hardened Data</div>
            <div className="pl-4 text-emerald-400">├── Formatting Spec</div>
            <div className="pl-0 text-cyan-400">└── Execution Trigger</div>
          </div>
        </div>
        <div className="flex-1 bg-black/60 border border-[rgba(255,255,255,0.05)] rounded-lg p-4 font-mono text-xs text-gray-400">
           <div className="text-emerald-500 mb-2">// Constraint Matrix Selected</div>
           <div className="text-gray-200 leading-relaxed">
             "You must never output unexecutable logic. All code must be 100% executable and wired to the provided reality baseline. If you need data, fetch it. If you need a UI, build it. Synthetics will be rejected by the validation pipeline."
           </div>
        </div>
      </div>
    </div>
  );
}

export function TemplateLibraryView() {
  const templates = [
    { name: 'React Native Setup', uses: 1204, tag: 'Frontend' },
    { name: 'Supabase Auth Flow', uses: 843, tag: 'Backend' },
    { name: 'Stripe Integration', uses: 592, tag: 'Commerce' },
    { name: 'Rust CLI Tool', uses: 115, tag: 'Systems' },
  ];

  return (
    <div className="p-6 bg-[#050510] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-amber-400" />
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Master Template Vault</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500 hover:text-white transition-colors text-sm cursor-pointer">
          <Plus size={16} /> New Template
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.name} className="bg-black/40 border border-[rgba(255,255,255,0.05)] p-4 rounded-lg hover:border-amber-500/30 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 bg-[rgba(255,255,255,0.05)] text-gray-400 rounded text-[10px] uppercase tracking-widest">{t.tag}</span>
              <span className="text-[10px] text-gray-500">{t.uses} deploys</span>
            </div>
            <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AutoRepairView() {
  return (
    <div className="p-6 h-[400px] flex flex-col bg-[#050510] rounded-xl border border-[rgba(255,255,255,0.05)] shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wrench className="text-rose-400" />
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Autonomous Syntax Repair</h2>
        </div>
        <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-xs font-bold animate-pulse">1 ERROR DETECTED</span>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-rose-950/20 border border-rose-500/30 rounded-lg p-4 font-mono text-xs overflow-auto">
          <div className="text-rose-400 mb-2">// Syntax Error: Unexpected token</div>
          <div className="text-gray-400">function connect() {'{'}</div>
          <div className="text-rose-300 bg-rose-500/20 line-through">  return await fetch('/api');</div>
          <div className="text-gray-400">{'}'}</div>
        </div>
        <div className="flex flex-col justify-center items-center px-2">
           <Play className="text-emerald-500" />
        </div>
        <div className="flex-1 bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4 font-mono text-xs overflow-auto">
          <div className="text-emerald-400 mb-2">// Synthesized Fix: Added async</div>
          <div className="text-emerald-300 bg-emerald-500/20">async function connect() {'{'}</div>
          <div className="text-gray-400">  return await fetch('/api');</div>
          <div className="text-gray-400">{'}'}</div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <div className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-bold rounded hover:bg-emerald-400 transition-colors cursor-pointer">
          <Check size={16} /> Apply Patch
        </div>
      </div>
    </div>
  );
}

export function LiveChatView() {
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Omni-Tether initialized. Neural bus active.' }
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'agent', text: 'Acknowledged. Processing via AI Engine...' }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#050510] border border-blue-500/30 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.1)] relative">
      <div className="p-4 border-b border-blue-500/20 bg-blue-950/30 rounded-t-xl flex items-center gap-3">
        <MessageSquare className="text-blue-400" size={18} />
        <h2 className="text-blue-400 font-mono text-sm tracking-widest font-bold uppercase">Copilot Direct Link</h2>
      </div>
      
      <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${m.role === 'user' ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-black/50 border border-white/10 text-gray-200 rounded-tl-sm'}`}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/5 bg-black/40 rounded-b-xl flex gap-3">
        <input 
          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Command the swarm..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button 
          onClick={send}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20"
        >
          Send
        </button>
      </div>
    </div>
  );
}
