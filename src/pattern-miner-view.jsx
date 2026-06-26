/**
 * PromptHouse Evo Studio — Pattern Miner Full View
 * Owner: Signal Foxhound | Truth State: built
 */
import React, { useState, useEffect, useCallback } from 'react';
import { addProofReceipt } from './prompt-base.js';
import { minePatterns, getAllPatterns, generateRecipeFromPattern } from './worktwin-vault.js';
import { Search, Activity, Wand2, Database, AlertCircle, Clock, Zap, Network } from 'lucide-react';

export function PatternMinerView() {
  const [patterns, setPatterns] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState([]);

  const log = useCallback((msg, type = 'info') => {
    setLogs(l => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...l.slice(0, 20)]);
  }, []);

  const refresh = useCallback(() => {
    setPatterns(getAllPatterns());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const scan = useCallback(async () => {
    setScanning(true);
    log('📡 Starting pattern scan of WorkTwin signals...', 'info');

    try {
      const found = minePatterns({ minFrequency: 1 });
      setPatterns(found);
      log(`✅ Scan complete: ${found.length} pattern(s) detected.`, found.length > 0 ? 'success' : 'info');
      addProofReceipt('pattern_miner', 'scan', 'verified', { count: found.length });
    } catch (e) {
      log(`❌ Scan failed: ${e.message}`, 'error');
    }
    
    setScanning(false);
  }, [log]);

  const createRecipe = useCallback((pattern) => {
    try {
      const recipe = generateRecipeFromPattern(pattern);
      log(`🪄 Generated recipe: ${recipe.name}`, 'success');
      refresh();
    } catch (e) {
      log(`❌ Failed to generate recipe: ${e.message}`, 'error');
    }
  }, [log, refresh]);

  return (
    <div className="flex flex-col gap-6 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-500 tracking-tighter mb-1 flex items-center gap-2">
            <Network size={28} className="text-cyan-400" /> Pattern Miner
          </div>
          <div className="text-xs font-bold text-cyan-500/50 uppercase tracking-widest">
            Analyze WorkTwin signals to find repeatable workflows
          </div>
        </div>
        <button 
          className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-black uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 whitespace-nowrap"
          onClick={scan} 
          disabled={scanning}
        >
          {scanning ? <><Activity size={18} className="animate-spin" /> Scanning Vault...</> : <><Search size={18} /> Deep Scan</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        
        {/* Left Column - Patterns */}
        <div className="flex flex-col gap-6">
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden h-full">
            <div className="bg-white/5 border-b border-white/5 p-5 flex items-center justify-between">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Database size={14} className="text-cyan-500" /> Detected Patterns
              </div>
              <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-cyan-500/30">
                {patterns.length} FOUND
              </div>
            </div>
            
            <div className="p-6">
              {patterns.length === 0 ? (
                <div className="bg-black/50 border border-dashed border-white/10 p-12 rounded-3xl text-center flex flex-col items-center gap-4 text-slate-400 h-[300px] justify-center">
                  <Network size={48} className="opacity-50 text-cyan-500" />
                  <div>
                    <div className="text-lg font-bold text-slate-300">No patterns detected</div>
                    <div className="text-sm opacity-60">Capture more signals in the WorkTwin Vault and run a scan.</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {patterns.map(p => (
                    <div key={p.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest font-black shadow-lg shadow-indigo-500/10">
                          {p.patternType}
                        </span>
                        <span className="text-[10px] font-black text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md">
                          <Zap size={10} /> Frequency: {p.count}x
                        </span>
                      </div>
                      
                      <div className="mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Examples / Signatures:
                      </div>
                      
                      <div className="bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-xs text-slate-300 mb-5 relative z-10 overflow-hidden text-ellipsis whitespace-nowrap">
                        "{p.example || p.signature || ''}"
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> Last seen: {p.lastSeenAt || '—'}
                        </span>
                        <button 
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                          onClick={() => createRecipe(p)}
                        >
                          <Wand2 size={12} /> Gen Recipe
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Logs & Info */}
        <div className="flex flex-col gap-6">
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="bg-white/5 border-b border-white/5 p-5">
              <div className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-orange-500" /> Miner Telemetry
              </div>
            </div>
            <div className="p-5 flex flex-col gap-2 max-h-[350px] overflow-y-auto custom-scrollbar font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-8">Awaiting signal analysis...</div>
              ) : logs.map((l, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="text-slate-600 shrink-0">[{l.ts}]</span>
                  <span className={`break-words ${
                    l.type === 'success' ? 'text-green-400 font-bold' : 
                    l.type === 'error' ? 'text-red-400 font-bold' : 
                    'text-slate-300'
                  }`}>
                    {l.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-extreme rounded-3xl border-neon-glow shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <AlertCircle size={48} className="text-cyan-500" />
            </div>
            <div className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle size={14} /> About Pattern Miner
            </div>
            <p className="text-xs text-slate-300 leading-relaxed relative z-10 font-bold">
              The Miner scans your private signal history to identify repeating tasks and redundant workflows. 
              Higher frequency patterns are prioritized for tool autogeneration, allowing you to turn tedious processes into 1-click recipes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
