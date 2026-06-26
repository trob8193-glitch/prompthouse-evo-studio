/**
 * PromptHouse Evo Studio — WorkTwin Vault Full View
 * Owner: Evo | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { BRIDGE_URL } from './config/bridge-config.js';
import { getAllSignals, saveSignal, getAllRecipes, captureWorkflowSignal, getAllPatterns, minePatterns, saveRecipe } from './worktwin-vault.js';
import { addProofReceipt } from './prompt-base.js';
import { DownloadCloud, Sparkles, RefreshCw, Layers, Zap, Activity } from 'lucide-react';

const SIGNAL_TYPES = ['repeat_prompt','repeat_error','repeat_doc','repeat_workflow'];
const CONSENT_SCOPES = ['private','team','marketplace_candidate'];

export function WorkTwinVaultView() {
  const [signals, setSignals] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [activeTab, setActiveTab] = useState('capture');
  const [captureForm, setCaptureForm] = useState({ source: 'studio', patternType: 'repeat_prompt', context: '', consentScope: 'private' });
  const [logs, setLogs] = useState([]);
  const [isMining, setIsMining] = useState(false);

  const log = useCallback((msg, type = 'info') => setLogs(l => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0,29)]), []);

  const refresh = useCallback(() => {
    setSignals(getAllSignals());
    setRecipes(getAllRecipes());
    setPatterns(getAllPatterns());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const capture = useCallback(() => {
    if (!captureForm.context.trim()) { log('⚠️ Context required before capture.', 'warn'); return; }
    const sig = captureWorkflowSignal(captureForm);
    log(`✅ Signal captured: ${sig.id} (${sig.patternType})`, 'success');
    addProofReceipt('worktwin', 'worktwin_capture', 'built', { signalId: sig.id });
    refresh();
    setCaptureForm(f => ({ ...f, context: '' }));
  }, [captureForm, log, refresh]);

  const mine = useCallback(() => {
    const found = minePatterns({ minFrequency: 1 });
    log(`📡 Pattern Miner: ${found.length} pattern(s) detected.`, found.length ? 'success' : 'info');
    refresh();
  }, [log, refresh]);

  const genRecipe = useCallback(async (pattern) => {
    log(`🪄 Initiating AI Recipe Generation for pattern: ${pattern.patternType}...`, 'info');
    setIsMining(true);
    
    try {
      const res = await fetch(`${BRIDGE_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `WORKTWIN RECIPE GENERATION:\nPattern Type: ${pattern.patternType}\nContext: ${pattern.example}\nGenerate a highly reusable, generic prompt recipe or automation script based on this pattern.`,
          agentId: 'worktwin-miner'
        })
      });
      
      if (!res.ok) throw new Error('Agent generation failed on bridge.');
      const data = await res.json();
      
      const newRecipe = {
        id: `recipe_${Date.now()}`,
        name: `Automated ${pattern.patternType} Recipe`,
        type: pattern.patternType,
        status: 'Generated',
        promptRecipe: data.response || 'Failed to synthesize recipe from context.',
        proofRequired: ['human-in-the-loop validation'],
        generatedCode: null
      };
      
      saveRecipe(newRecipe);
      log(`🪄 Recipe successfully generated and stored.`, 'success');
      refresh();
    } catch (e) {
      log(`⚠️ Recipe generation failed: ${e.message}`, 'warn');
    } finally {
      setIsMining(false);
    }
  }, [log, refresh]);

  const TABS = [
    { id: 'capture', label: '📥 Capture Signal', icon: DownloadCloud },
    { id: 'signals', label: `📡 Signals (${signals.length})`, icon: Activity },
    { id: 'patterns', label: `🔍 Patterns (${patterns.length})`, icon: Layers },
    { id: 'recipes', label: `🪄 Recipes (${recipes.length})`, icon: Sparkles },
    { id: 'logs', label: '📋 Logs', icon: Zap },
  ];

  const statusColors = { private: 'text-cyan-400 bg-cyan-400/10', team: 'text-yellow-400 bg-yellow-400/10', marketplace_candidate: 'text-green-400 bg-green-400/10' };

  return (
    <div className="flex flex-col gap-6 animate-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-1 flex items-center gap-2">
            🤖 WorkTwin Vault
          </div>
          <div className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest">
            Browser capture → Pattern → Recipe → Tool. All private. All consented.
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            className="glass-extreme shadow-[0_0_15px_rgba(217,70,239,0.1)] text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-2xl px-6 py-2.5 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 active:scale-95" 
            onClick={mine}
          >
            <Activity size={14} /> Run Pattern Miner
          </button>
          <button 
            className="glass-extreme text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-2xl px-6 py-2.5 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 active:scale-95" 
            onClick={refresh}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4 overflow-x-auto custom-scrollbar">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button 
              key={t.id} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${
                activeTab === t.id 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/5'
              }`}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'capture' && (
          <div className="glass-extreme rounded-3xl border-neon-glow p-8 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col gap-6 max-w-4xl">
            <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter">
              📥 Capture Workflow Signal
            </div>
            
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-xs text-orange-400 flex items-center gap-3">
              <span className="text-xl">⚠️</span> 
              <div>
                <strong className="block mb-1">Consent Required.</strong>
                Only capture context you explicitly choose to save. No silent telemetry. Secrets are auto-redacted.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest">Source</label>
                <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 appearance-none" value={captureForm.source} onChange={e => setCaptureForm(f => ({ ...f, source: e.target.value }))}>
                  {['studio','browser','api','extension'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest">Pattern Type</label>
                <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 appearance-none" value={captureForm.patternType} onChange={e => setCaptureForm(f => ({ ...f, patternType: e.target.value }))}>
                  {SIGNAL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest">Consent Scope</label>
              <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 appearance-none" value={captureForm.consentScope} onChange={e => setCaptureForm(f => ({ ...f, consentScope: e.target.value }))}>
                {CONSENT_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest">Context (will be auto-redacted for secrets)</label>
              <textarea 
                className="bg-black/50 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors w-full h-32 custom-scrollbar resize-none font-mono" 
                placeholder="Paste the workflow, prompt, or pattern you want to capture..." 
                value={captureForm.context} 
                onChange={e => setCaptureForm(f => ({ ...f, context: e.target.value }))} 
              />
            </div>

            <button 
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95" 
              onClick={capture}
            >
              <DownloadCloud size={18} /> Capture Signal with Consent
            </button>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="glass-extreme rounded-3xl border-neon-glow p-8 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-6">📡 Workflow Signals</div>
            <div className="flex flex-col gap-3">
              {signals.length === 0 ? (
                <div className="bg-black/50 border border-dashed border-white/10 p-12 rounded-3xl text-center flex flex-col items-center gap-4 text-slate-400">
                  <Activity size={48} className="opacity-50" />
                  <div>
                    <div className="text-lg font-bold text-slate-300">No signals yet</div>
                    <div className="text-sm opacity-60">Use Capture tab or the browser extension (Ctrl+Shift+P)</div>
                  </div>
                </div>
              ) : signals.map(s => (
                <div key={s.id} className="bg-slate-900/50 border border-white/5 border-l-2 border-l-cyan-500 rounded-xl p-4 hover:bg-slate-900 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-cyan-400">{s.patternType}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${statusColors[s.consentScope] || 'text-white bg-white/10'}`}>{s.consentScope}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono mb-3 bg-black/30 p-3 rounded-lg break-words">{s.redactedContext?.slice(0, 150) || '(empty)'}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{s.source} · {s.capturedAt?.slice(0,19)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="glass-extreme rounded-3xl border-neon-glow p-8 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter">🔍 Detected Patterns</div>
              <button className="glass-extreme text-cyan-100 border-white/10 hover:border-white/30 transition-all rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 active:scale-95" onClick={mine}>Run Miner</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {patterns.length === 0 ? (
                <div className="bg-black/50 border border-dashed border-white/10 p-12 rounded-3xl text-center flex flex-col items-center gap-4 text-slate-400">
                  <Layers size={48} className="opacity-50" />
                  <div>
                    <div className="text-lg font-bold text-slate-300">No patterns yet</div>
                    <div className="text-sm opacity-60">Capture 2+ signals of the same type, then run Pattern Miner</div>
                  </div>
                </div>
              ) : patterns.map(p => (
                <div key={p.id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-200 text-lg">{p.patternType}</span>
                    <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">×{p.frequency || p.count} detected</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Example Context:</div>
                    {p.examples ? p.examples.map((ex, i) => <div key={i} className="text-xs text-slate-400 font-mono bg-black/30 p-2 rounded-lg truncate">• {ex}</div>) : <div className="text-xs text-slate-400 font-mono bg-black/30 p-2 rounded-lg truncate">{p.example}</div>}
                  </div>
                  <button 
                    className="self-start glass-extreme bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 disabled:opacity-50" 
                    onClick={() => genRecipe(p)}
                    disabled={isMining}
                  >
                    <Sparkles size={14} className={isMining ? 'animate-spin' : ''} /> Generate AGI Recipe
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="glass-extreme rounded-3xl border-neon-glow p-8 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl">
            <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-6">🪄 Tool Recipes</div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {recipes.length === 0 ? (
                <div className="xl:col-span-2 bg-black/50 border border-dashed border-white/10 p-12 rounded-3xl text-center flex flex-col items-center gap-4 text-slate-400">
                  <Sparkles size={48} className="opacity-50" />
                  <div>
                    <div className="text-lg font-bold text-slate-300">No recipes yet</div>
                    <div className="text-sm opacity-60">Detect a pattern and generate an AGI recipe from it</div>
                  </div>
                </div>
              ) : recipes.map(r => (
                <div key={r.id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Sparkles size={64} />
                  </div>
                  <div>
                    <div className="font-black text-lg text-slate-200 mb-1">{r.name}</div>
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Type: {r.type} · Status: {r.status}</div>
                  </div>
                  <div className="text-xs text-slate-300 font-mono bg-black/50 border border-white/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                    {r.promptRecipe}
                  </div>
                  {r.generatedCode && (
                    <div className="text-xs text-green-400 font-mono bg-black/50 border border-green-500/20 p-4 rounded-xl leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                      {r.generatedCode?.slice(0,300)}...
                    </div>
                  )}
                  {r.proofRequired && (
                    <div className="text-[10px] text-red-400 uppercase tracking-widest font-bold bg-red-500/10 border border-red-500/20 p-2 rounded-lg inline-block self-start mt-2">
                      ⚠️ Requires owner approval: {r.proofRequired?.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="glass-extreme rounded-3xl border-neon-glow p-8 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-slate-950 backdrop-blur-xl min-h-[400px] flex flex-col">
            <div className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-6 flex items-center gap-2">
              <Zap size={18} /> Activity Log
            </div>
            <div className="flex-1 font-mono text-xs flex flex-col gap-2 bg-black/30 rounded-2xl p-4 overflow-y-auto custom-scrollbar border border-white/5">
              {logs.length === 0 && <span className="text-slate-600 italic">// Awaiting actions...</span>}
              {logs.map((l, i) => (
                <div key={i} className={`flex gap-3 leading-relaxed ${l.type === 'success' ? 'text-green-400' : l.type === 'warn' ? 'text-orange-400' : 'text-slate-300'}`}>
                  <span className="text-slate-600 shrink-0">[{l.ts}]</span> 
                  <span className="break-words">{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
