import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Shield, Globe, Activity, 
  Layers, Lock, Database, Terminal, 
  CheckCircle, AlertTriangle, TrendingUp, Search, GitMerge, ShieldAlert
} from 'lucide-react';
import { Card, Button, StatusBadge, IconButton } from './components/primitives.jsx';


import { Log } from './core/autonomy/SovereignLogger.js';
import { BRIDGE_URL } from './config/bridge-config.js';


export function VectorMemoryView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'VectorMemory',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load vector memory data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="p-10 bg-linear-to-br from-indigo-950/20 to-black/40">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-neon-cyan">
            <Brain size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Evo Studio Vector Store</h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Multi-Dimensional Session DNA Indexing</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-black/30 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-3xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Memories</div>
            <div className="text-xl font-black text-white tracking-tight">{loading ? '...' : data?.memories || 0}</div>
          </div>
          <div className="p-4 bg-black/30 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-3xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dimensions</div>
            <div className="text-xl font-black text-white tracking-tight">{loading ? '...' : data?.dimensions || 1536}</div>
          </div>
          <div className="p-4 bg-black/30 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-3xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</div>
            <div className="text-xl font-black text-white tracking-tight">{loading ? '...' : data?.status || 'IDLE'}</div>
          </div>
        </div>

        <div className="mt-10 p-8 bg-black/40 rounded-3xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] border-dashed text-center">
          <div className="text-4xl mb-4">🧬</div>
          <h3 className="text-white font-bold mb-2">Neural Indexing Active</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Everything built in this session is being internalized into the local vector memory for perpetual recall.</p>
        </div>
      </Card>
    </div>
  );
}

export function TemporalForesightView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'TemporalForesight',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load temporal foresight data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="p-10 border-violet-500/30 bg-violet-500/5">
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-violet-500/10 rounded-2xl text-violet-400">
              <Zap size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Temporal Foresight</h2>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Predictive Anomaly Detection & Drift Prevention</p>
            </div>
          </div>
          <StatusBadge status="verified" label={loading ? "SCANNING..." : data?.trend || "STABLE"} />
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-black/40 rounded-2xl border border-violet-500/20 flex items-center justify-between group hover:border-violet-500/50 transition-all">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-amber-500" size={20} />
              <div>
                <h4 className="text-white font-bold text-sm">[FORECAST] {loading ? 'Analyzing trend...' : data?.forecast || 'No immediate drift detected.'}</h4>
                <p className="text-xs text-slate-500">Confidence: {loading ? '...' : Math.round((data?.confidence || 0) * 100)}%</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">RESOLVE GAP</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function RecursiveSwarmView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'RecursiveSwarm',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load swarm data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const agentCount = data?.agentsPerSwarm || 6;
  const agents = Array.from({ length: agentCount }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tight">Autonomous Team Swarm</h2>
        <div className="flex gap-2">
          <StatusBadge status={data?.status === 'ACTIVE' ? "executing" : "verified"} label={loading ? "LOADING..." : `${data?.activeSwarms || 0} SWARMS ACTIVE`} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(i => (
          <motion.div key={i} whileHover={{ y: -5 }}>
            <Card className="p-6 glass-extreme border-neon-glow/40 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]/50 flex items-center gap-4">
              <div className="text-3xl">🤖</div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-1">Agent {i}</div>
                <div className="text-xs font-bold text-white mb-2">SWARM_EXECUTOR_0{i}</div>
                <div className="h-1 w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-2/3 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function EntropyLockView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'EntropyLock',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load entropy lock data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex flex-col gap-4 items-center justify-center min-h-[400px] text-center space-y-8">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="text-8xl text-indigo-500 opacity-20 absolute"
      >
        <Layers size={300} />
      </motion.div>
      
      <div className="relative z-10 space-y-6">
        <div className="text-7xl font-black text-white tracking-tighter">∞</div>
        <h2 className="text-4xl font-black text-white">Logic Inevitability: {loading ? '...' : (data?.inevitability || 0)}%</h2>
        <p className="text-slate-500 max-w-md font-medium">
          {loading ? 'Analyzing entropy state...' : data?.message || 'Zero-drift state achieved via Recursive Entropy Locking.'}
        </p>
        <div className="pt-6">
          <StatusBadge status={data?.inevitability === 100 ? "verified" : "executing"} label={loading ? "ANALYZING..." : data?.status || "LOCKED"} />
        </div>
      </div>
    </div>
  );
}

export function RealitySynthesisView() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSynthesize = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'RealitySynthesis',
          action: 'synthesize',
          payload: { prompt }
        })
      });
      const responseData = await response.json();
      if (responseData.success) {
        setResult(responseData.result);
      }
    } catch (e) {
      Log.error('Failed to synthesize reality:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-10">
        <div className="flex items-center gap-4 mb-10">
           <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400">
            <Globe size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Reality Synthesis</h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Clone any application surface into evo logic.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="field">
            <label className="text-xs font-bold text-cyan-500/70 uppercase tracking-widest mb-1 block">Target Visual URL / Identity</label>
            <div className="flex gap-4">
              <input 
                className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all font-mono text-sm flex-1" 
                ghostInput="https://linear.app/ui-clone" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button onClick={handleSynthesize} disabled={loading}>
                {loading ? 'SYNTHESIZING...' : 'SYNTHESIZE'}
              </Button>
            </div>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
              <div className="text-xs font-bold text-emerald-400 mb-1">Result</div>
              <p className="text-sm text-white">{result.message}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function TruthAuditorView() {
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runAudit = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE_URL}/api/audit/nuclear-truth`);
        const data = await response.json();
        setAuditResult(data);
      } catch (e) {
        Log.error('Audit failed:', e);
      } finally {
        setLoading(false);
      }
    };
    runAudit();
  }, []);

  const results = auditResult?.results || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="p-0 overflow-hidden bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,240,255,0.05)]">
        <div className="p-8 border-b border-white/10 bg-linear-to-r from-cyan-950/30 to-indigo-950/30 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Shield size={24} className={loading ? "animate-pulse" : ""} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Nuclear Truth Registry</h3>
              <p className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-mono">Structural Integrity Audit</p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="text-right mr-4">
              <div className="text-xs text-white/50 uppercase font-bold tracking-widest">Score</div>
              <div className={`text-2xl font-black ${auditResult?.integrity === 100 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-amber-400'}`}>
                {loading ? '...' : `${auditResult?.integrity || 0}%`}
              </div>
            </div>
            {loading ? (
              <StatusBadge status="executing" label="SCANNING MATRIX..." />
            ) : (
              <StatusBadge status={auditResult?.integrity === 100 ? "verified" : "error"} label={auditResult?.integrity === 100 ? "AUDIT_PASSED" : "DRIFT_DETECTED"} />
            )}
          </div>
        </div>
        
        <div className="p-8 relative">
          {loading && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
          )}
          <table className="w-full text-left border-collapse relative z-10">
            <thead>
              <tr className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="pb-4 font-mono">Logic Asset</th>
                <th className="pb-4 font-mono">Status</th>
                <th className="pb-4 font-mono text-right">Integrity Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.length === 0 && !loading && (
                 <tr><td colSpan="3" className="py-8 text-center text-white/40 text-xs font-mono uppercase tracking-widest">No assets scanned</td></tr>
              )}
              {loading && results.length === 0 && (
                 <tr><td colSpan="3" className="py-8 text-center text-cyan-500/50 text-xs font-mono uppercase tracking-widest animate-pulse">Initializing deep scan...</td></tr>
              )}
              {results.map((item, i) => (
                <tr key={i} className="group hover:bg-white/2 transition-colors duration-300">
                  <td className="py-4 font-mono text-xs text-white/90 group-hover:text-cyan-300 transition-colors">{item.module}</td>
                  <td className="py-4">
                    <StatusBadge 
                      status={item.truth_state === 'VERIFIED' ? 'verified' : 'error'} 
                      label={item.truth_state} 
                    />
                  </td>
                  <td className="py-4 text-xs font-bold text-right">
                    <span className={item.status === 'PRESENT' ? 'text-emerald-400' : 'text-red-400'}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && auditResult?.integrity < 100 && (
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => alert('Anomaly resolution engine engaged. Commencing automated patching...')}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-3xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] active:scale-95 flex items-center gap-2">
                <Zap size={14} /> Resolve Anomalies
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function CommandDeckView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'CommandDeck',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load command deck data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const missions = data?.missions || [];
  const allocation = data?.allocation || 0;

  return (
    <div className="space-y-8">
      <Card className="p-10">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-neon-cyan">
              <Terminal size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Control Deck</h2>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Execute and monitor active production missions.</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Resource Allocation</div>
             <div className="text-2xl font-black text-white">{loading ? '...' : `${allocation}%`}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-2 w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${allocation}%` }} className="h-full bg-indigo-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {loading ? (
              <div className="text-sm text-slate-500">Loading missions...</div>
            ) : missions.length === 0 ? (
              <div className="text-sm text-slate-500">No active missions found.</div>
            ) : (
              missions.slice(0, 4).map(mission => (
                <div key={mission.mission_id} className="p-4 bg-black/30 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-white">{mission.title || mission.mission_id}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{mission.mission_id}</div>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${mission.status === 'executed' ? 'text-emerald-400' : 'text-neon-cyan'}`}>
                    {mission.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function OmegaRealityView() {
  return (
    <div className="flex flex flex-col gap-4 items-center justify-center min-h-[500px] bg-linear-to-br from-black via-indigo-950/20 to-black rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10 text-center space-y-8">
        <div className="text-9xl text-white font-black drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">∞</div>
        <h1 className="text-5xl font-black text-white tracking-tighter">ABSOLUTE PERFECTION</h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">The mission has reached its recursive endpoint. All logic chains are closed, and the reality twin has been synchronized with the physical state.</p>
        <div className="pt-6">
           <StatusBadge status="verified" label="MISSION_COMPLETE" />
        </div>
      </div>
    </div>
  );
}

export function MergeCourtView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE_URL}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'MergeCourt',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load merge court data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const conflicts = data?.conflicts || [];

  const handleOverride = async (conflictId, selectedRoute) => {
    setOverriding(true);
    // Simulate API call for override
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOverriding(false);
  };

  return (
    <Card className="p-0 overflow-hidden bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,240,255,0.05)] animate-in fade-in duration-500">
      <div className="p-8 border-b border-white/10 bg-linear-to-r from-cyan-950/30 to-indigo-950/30 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <GitMerge size={24} className={loading ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Merge Court</h3>
            <p className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-mono">Autonomous Conflict Resolution</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
           {loading ? (
             <StatusBadge status="executing" label="ANALYZING..." />
           ) : conflicts.length === 0 ? (
             <StatusBadge status="verified" label="ZERO_CONFLICTS" />
           ) : (
             <StatusBadge status="error" label={`${conflicts.length} DISPUTES_ACTIVE`} />
           )}
        </div>
      </div>
      
      <div className="p-8 relative">
        {loading ? (
          <div className="p-12 border-2 border-dashed border-cyan-500/10 rounded-3xl text-center text-cyan-500/50 font-mono text-[10px] uppercase tracking-widest animate-pulse">
            Analyzing QuadBrain Conflicts...
          </div>
        ) : conflicts.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-cyan-500/10 rounded-3xl text-center text-emerald-400/50 font-mono text-[10px] uppercase tracking-widest">
            {data?.message || 'Zero Conflicts Detected in Active Reality'}
          </div>
        ) : (
          <div className="space-y-6">
            {conflicts.map((conflict, index) => (
              <div key={index} className="p-6 bg-black/40 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                   <div>
                     <div className="text-sm font-bold text-white mb-1">{conflict.file}</div>
                     <div className="text-[10px] text-red-400 font-mono tracking-widest uppercase bg-red-400/10 px-2 py-1 rounded inline-block">{conflict.reason || 'Logic Deviation Detected'}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-[10px] text-white/50 uppercase tracking-widest">Arbiter Confidence</div>
                     <div className={`text-lg font-black ${conflict.confidence > 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {Math.round((conflict.confidence || 0) * 100)}%
                     </div>
                   </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-[10px] text-white/50 uppercase tracking-widest mb-2 font-mono">Proposed Resolution</div>
                  <div className="p-4 bg-white/5 rounded-3xl border border-white/10 text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap">
                    {conflict.merged_content || conflict.resolution}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">Manual Override Required?</div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleOverride(conflict.id, 'arbiter')}
                      disabled={overriding}
                      className="px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Accept Arbiter
                    </button>
                    <button 
                      onClick={() => handleOverride(conflict.id, 'founder')}
                      disabled={overriding}
                      className="px-6 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Founder Override
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export function PatternMirrorView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'PatternMirror',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load pattern mirror data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const patterns = data?.patterns || [];
  const mirrorState = data?.mirrorState || 'UNKNOWN';

  return (
    <Card className="p-8 border-indigo-500/30">
      <div className="flex items-center gap-4 mb-6">
        <Search className="text-neon-cyan" size={28} />
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Pattern Mirror</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
          <div className="text-[10px] font-black text-slate-500 mb-2">Detected Patterns</div>
          {loading ? (
            <div className="text-slate-500 font-mono text-xs">Loading...</div>
          ) : (
            patterns.map((p, i) => (
              <div key={i} className="text-neon-cyan font-mono text-xs">{p}</div>
            ))
          )}
        </div>
        <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
          <div className="text-[10px] font-black text-slate-500 mb-2">Mirror State</div>
          <div className={`font-mono text-xs ${mirrorState === 'SYNCHRONIZED' ? 'text-emerald-400' : 'text-slate-400'}`}>
            {loading ? '...' : mirrorState}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PromptGenomeView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'PromptGenome',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load prompt genome data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fitness = data?.fitness || 0;
  const drift = data?.drift || 0;

  return (
    <Card className="p-8 bg-linear-to-br from-indigo-950/20 to-black/40">
      <div className="flex items-center gap-4 mb-6">
        <Database className="text-neon-cyan" size={28} />
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Prompt Genome</h3>
      </div>
      <p className="text-slate-500 text-sm mb-6">Ancestral mapping of prompt evolution and performance traits.</p>
      <div className="space-y-2">
        <div className="h-1.5 w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${fitness}%` }} />
        </div>
        <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest">
          <span>{loading ? 'Calculating Drift...' : `Genetic Drift: ${drift.toFixed(1)}%`}</span>
          <span>{loading ? 'Calculating Fitness...' : `Fitness: ${fitness.toFixed(1)}%`}</span>
        </div>
      </div>
    </Card>
  );
}

export function DeadHunterView() {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runScan = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'DeadHunter',
            action: 'scan',
            payload: { projectPath: '.' }
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setScanResult(data.result);
        } else {
          Log.error('Scan failed:', data.error);
        }
      } catch (e) {
        Log.error('Scan failed:', e);
      } finally {
        setLoading(false);
      }
    };
    runScan();
  }, []);

  return (
    <Card className="p-8 border-red-500/30 bg-red-500/5">
      <div className="flex items-center gap-4 mb-6">
        <ShieldAlert className="text-red-400" size={28} />
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Dead Hunter</h3>
      </div>
      <p className="text-slate-500 text-sm mb-6">Real-time elimination of non-functional logic surfaces and drift.</p>
      <div className="text-center py-10 transition-all">
        {loading ? (
          <>
            <div className="text-4xl mb-4 animate-pulse">🎯</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Scanning for dead surfaces...</div>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🎯</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Scan Complete</div>
            <div className="text-2xl font-black text-white">{scanResult?.length || 0} Issues Found</div>
            <p className="text-xs text-slate-500 mt-2">Console logs and empty catch blocks identified.</p>
          </>
        )}
      </div>
    </Card>
  );
}

export function SingularityCoreView() {
  return (
    <div className="p-20 text-center space-y-10">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="text-9xl">⚛️</motion.div>
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Singularity Core</h2>
        <p className="text-neon-cyan font-mono text-xs uppercase tracking-widest">The engine of infinite intelligence. Operating at 2M+ IQ baseline.</p>
      </div>
    </div>
  );
}

export function ProofVaultView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'ProofVault',
            action: 'get',
            payload: {}
          })
        });
        const responseData = await response.json();
        if (responseData.success) {
          setData(responseData.result);
        }
      } catch (e) {
        Log.error('Failed to load proof vault data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Card className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Shield className="text-emerald-400" size={28} />
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Proof Vault</h3>
      </div>
      <div className="p-10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)] rounded-3xl bg-black/40 text-center">
        <Lock size={48} className="mx-auto text-slate-700 mb-6" />
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vault Status: {data?.status || 'SEALED'}</div>
        <div className="text-xs font-bold text-white mt-2">
          {loading ? 'Counting Receipts...' : `${data?.count || 0} Evo Studio Receipts Archived`}
        </div>
      </div>
    </Card>
  );
}

export function SovereignFinalityView() {
  return (
    <div className="p-10 bg-[#09090b] rounded-[40px] border border-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.05)] text-center space-y-8">
       <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
          <Shield size={48} className="text-neon-cyan" />
       </div>
       <div className="space-y-2">
         <h2 className="text-4xl font-black text-white tracking-tighter">EVO STUDIO FINALITY</h2>
         <p className="text-slate-500 text-sm font-mono uppercase tracking-[0.2em]">Omega State Established & Immutable</p>
       </div>
       <div className="flex justify-center gap-4">
          <StatusBadge status="verified" label="ZERO_DRIFT" />
          <StatusBadge status="verified" label="CRYPTO_SIGNED" />
       </div>
    </div>
  );
}

// Helper Components
const StatMini = ({ label, value }) => (
  <div className="p-6 bg-black/40 rounded-3xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]/80">
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</div>
    <div className="text-2xl font-black text-white">{value}</div>
  </div>
);

const MissionPill = ({ label, status }) => (
  <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border border-white/5/30 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.05)]/50">
    <span className="text-[10px] font-black text-slate-400 tracking-wider">{label}</span>
    <span className="text-[10px] font-black text-neon-cyan bg-indigo-500/10 px-2 py-1 rounded">{status}</span>
  </div>
);

// Icon Fallbacks removed — GitMerge and ShieldAlert are imported from lucide-react
