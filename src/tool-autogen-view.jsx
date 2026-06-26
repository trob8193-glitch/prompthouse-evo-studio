/**
 * PromptHouse Evo Studio — Tool Autogenerator Full View
 * Owner: Compiler Bearcat | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { autoGenerateTool, getAllRecipes } from './tool-autogenerator.js';
import { addProofReceipt } from './prompt-base.js';
import { BRIDGE_URL } from './config/bridge-config.js';
import { Wrench, CheckCircle, AlertTriangle, Play, Package, Code, ShieldAlert, Cpu } from 'lucide-react';

const TOOL_TYPES = [
  { id: 'template', label: '📋 Prompt Template', desc: 'Reusable prompt template with variables', icon: <Code size={18} /> },
  { id: 'agent', label: '🤖 Custom Agent', desc: 'Multi-step autonomous agent recipe', icon: <Cpu size={18} /> },
  { id: 'promptlink_adapter', label: '🔗 PromptLink Adapter', desc: 'Provider routing adapter', icon: <Wrench size={18} /> },
  { id: 'extension', label: '🧩 Browser Extension', desc: 'Chrome/Edge extension scaffold', icon: <Package size={18} /> },
  { id: 'forgerail_rail', label: '🛤️ ForgeRail Rail', desc: 'ForgeRail pipeline rail config', icon: <Play size={18} /> },
  { id: 'app', label: '📱 App Scaffold', desc: 'React/Flutter app scaffold', icon: <Code size={18} /> },
];

async function callBridge(prompt) {
  try {
    const res = await fetch(`${BRIDGE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: prompt,
        agentId: 'tool-autogen'
      })
    });
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.response || 'Success';
  } catch (err) {
    return null;
  }
}

export function ToolAutogenView() {
  const [intent, setIntent] = useState('');
  const [selectedType, setSelectedType] = useState('template');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [bridgeLive, setBridgeLive] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  useEffect(() => {
    getAllRecipes().then(setRecipes);
    fetch(`${BRIDGE_URL}/status`, { signal: AbortSignal.timeout(2000) })
      .then(r => setBridgeLive(r.ok)).catch(() => setBridgeLive(false));
  }, []);

  const generate = useCallback(async () => {
    if (!intent.trim()) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await autoGenerateTool({
        intent,
        type: selectedType,
        sourceSignals: [],
        callBridge: bridgeLive ? callBridge : null,
      });
      setResult(res);
      const updated = await getAllRecipes();
      setRecipes(updated);
      addProofReceipt('tool_autogen', 'tool_autogen:generate', 'built', { type: selectedType, intent: intent.slice(0,80) });
    } catch (e) {
      setResult({ error: e.message });
    }
    setGenerating(false);
  }, [intent, selectedType, bridgeLive]);

  return (
    <div className="flex flex-col gap-6 animate-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-1 flex items-center gap-2">
            🪄 Tool Autogenerator
          </div>
          <div className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest">
            Generate custom tools, agents, adapters, and extensions from intent prompts.
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 border shadow-lg ${
          bridgeLive 
            ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]' 
            : 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(248,113,113,0.15)]'
        }`}>
          {bridgeLive ? <><CheckCircle size={14} /> AI Bridge Live</> : <><AlertTriangle size={14} /> Bridge Offline</>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all whitespace-nowrap text-xs uppercase tracking-widest ${
            activeTab === 'generate' 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
              : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('generate')}
        >
          <Wrench size={16} /> Generate Tool
        </button>
        <button 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all whitespace-nowrap text-xs uppercase tracking-widest ${
            activeTab === 'vault' 
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
              : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('vault')}
        >
          <Package size={16} /> Vault ({recipes.length})
        </button>
      </div>

      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Tool Type Picker */}
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14} className="text-cyan-500" /> Tool Type Class
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {TOOL_TYPES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setSelectedType(t.id)}
                  className={`text-left p-4 rounded-2xl transition-all border ${
                    selectedType === t.id 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                      : 'bg-black/40 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center gap-3 font-black text-sm mb-1 ${
                    selectedType === t.id ? 'text-cyan-400' : 'text-slate-300'
                  }`}>
                    {t.icon}
                    {t.label}
                  </div>
                  <div className={`text-[10px] uppercase tracking-widest font-bold ${
                    selectedType === t.id ? 'text-cyan-500/70' : 'text-slate-500'
                  }`}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generator */}
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Code size={14} className="text-indigo-500" /> Intent Description
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                  What should this tool do? (Be specific)
                </label>
                <textarea 
                  className="bg-black/50 border border-white/10 rounded-2xl p-5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors w-full min-h-[160px] custom-scrollbar resize-y font-mono"
                  placeholder="e.g. Create a PromptLink adapter that routes any Flutter code-generation request to a local Ollama model with fallback to GPT-4o-mini..."
                  value={intent} 
                  onChange={e => setIntent(e.target.value)} 
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3 text-orange-400">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="text-xs font-bold leading-relaxed">
                  All generated tools are marked <span className="text-white font-black">draft/template</span>. Owner approval required before publishing or deploying to production environments.
                </div>
              </div>

              <button 
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 w-full"
                onClick={generate} 
                disabled={generating || !intent.trim()}
              >
                {generating ? <><Play size={18} className="animate-pulse" /> Compiling Scaffold...</> : <><Wrench size={18} /> Generate {TOOL_TYPES.find(t => t.id === selectedType)?.label || 'Tool'}</>}
              </button>

              {result && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
                  {result.error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-xs font-bold flex items-center gap-3">
                      <AlertTriangle size={16} /> {result.error}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
                        <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <CheckCircle size={14} /> Recipe Created: {result.recipe?.name}
                        </div>
                        <div className="text-xs text-green-100/70 font-mono leading-relaxed bg-black/30 p-3 rounded-xl border border-green-500/20">
                          {result.recipe?.promptRecipe}
                        </div>
                      </div>
                      
                      {result.code && (
                        <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-5 overflow-hidden">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Generated Source Code</div>
                          <div className="text-xs text-indigo-300 font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                            {result.code}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                        <AlertTriangle size={12} /> Proof Required: {result.recipe?.proofRequired?.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vault' && (
        <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
          <div className="bg-white/5 border-b border-white/5 p-5">
            <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} className="text-purple-500" /> Tool Recipe Vault
            </div>
          </div>
          
          <div className="p-6">
            {recipes.length === 0 ? (
              <div className="bg-black/50 border border-dashed border-white/10 p-12 rounded-3xl text-center flex flex-col items-center gap-4 text-slate-400">
                <Package size={48} className="opacity-50 text-purple-500" />
                <div>
                  <div className="text-lg font-bold text-slate-300">Vault Empty</div>
                  <div className="text-sm opacity-60">Generate your first tool to populate the vault</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map(r => (
                  <div key={r.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="font-black text-sm text-purple-300 group-hover:text-purple-200 transition-colors">{r.name}</span>
                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[9px] uppercase tracking-widest font-bold text-slate-400">
                        {r.type}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-400 font-mono mb-6 line-clamp-3 relative z-10">
                      {r.promptRecipe}
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest relative z-10">
                      <span className="text-orange-400 flex items-center gap-1"><AlertTriangle size={10} /> {r.status}</span>
                      <span className="text-slate-600">{r.createdAt?.slice(0,10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
