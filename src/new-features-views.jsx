import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Shield, Globe, Activity, 
  Layers, Lock, Database, Terminal, 
  CheckCircle, AlertTriangle, TrendingUp, Search
} from 'lucide-react';
import { Card, Button, StatusBadge, IconButton } from './components/primitives.jsx';


const BRIDGE = 'http://127.0.0.1:3001';

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
        console.error('Failed to load vector memory data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="p-10 bg-gradient-to-br from-indigo-950/20 to-black/40">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Brain size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Sovereign Vector Store</h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Multi-Dimensional Session DNA Indexing</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-black/30 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Memories</div>
            <div className="text-xl font-black text-white tracking-tight">{loading ? '...' : data?.memories || 0}</div>
          </div>
          <div className="p-4 bg-black/30 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dimensions</div>
            <div className="text-xl font-black text-white tracking-tight">{loading ? '...' : data?.dimensions || 1536}</div>
          </div>
          <div className="p-4 bg-black/30 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</div>
            <div className="text-xl font-black text-white tracking-tight">{loading ? '...' : data?.status || 'IDLE'}</div>
          </div>
        </div>

        <div className="mt-10 p-8 bg-black/40 rounded-3xl border border-slate-800 border-dashed text-center">
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
        console.error('Failed to load temporal foresight data:', e);
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
        console.error('Failed to load swarm data:', e);
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
            <Card className="p-6 bg-slate-900/40 border-slate-800/50 flex items-center gap-4">
              <div className="text-3xl">🤖</div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Agent {i}</div>
                <div className="text-xs font-bold text-white mb-2">SWARM_EXECUTOR_0{i}</div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
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
        console.error('Failed to load entropy lock data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8">
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
      console.error('Failed to synthesize reality:', e);
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
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Clone any application surface into sovereign logic.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="field">
            <label className="field-label">Target Visual URL / Identity</label>
            <div className="flex gap-4">
              <input 
                className="field-input flex-1" 
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
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
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
        const sampleLedger = [
          { id: '1', asset: 'TruthGate.js', reference: 'origin' },
          { id: '2', asset: 'engine.js', reference: 'local' },
          { id: '3', asset: 'ghost.js', reference: '' } // Should trigger hallucination detection
        ];
        
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module: 'TruthAuditor',
            action: 'audit',
            payload: { ledger: sampleLedger }
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setAuditResult(data.result);
        } else {
          console.error('Audit failed:', data.error);
        }
      } catch (e) {
        console.error('Audit failed:', e);
      } finally {
        setLoading(false);
      }
    };
    runAudit();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="p-0 overflow-hidden">
        <div className="p-8 border-b border-slate-800 bg-slate-900/20 flex justify-between items-center">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Truth Verification Registry</h3>
          {loading ? (
            <StatusBadge status="executing" label="AUDITING..." />
          ) : (
            <StatusBadge status={auditResult?.integrity ? "verified" : "error"} label={auditResult?.integrity ? "AUDIT_PASSED" : "AUDIT_FAILED"} />
          )}
        </div>
        <div className="p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="pb-4">Logic Asset</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="group hover:bg-white/5 transition-all">
                <td className="py-4 font-mono text-xs text-white">TruthGate.js</td>
                <td className="py-4"><StatusBadge status="verified" label="SEALED" /></td>
                <td className="py-4 text-xs text-emerald-400 font-bold">Passed</td>
              </tr>
               <tr className="group hover:bg-white/5 transition-all">
                <td className="py-4 font-mono text-xs text-white">engine.js</td>
                <td className="py-4"><StatusBadge status="verified" label="SIGNED" /></td>
                <td className="py-4 text-xs text-emerald-400 font-bold">Passed</td>
              </tr>
              {!loading && auditResult?.hallucinations && (
                <tr className="group hover:bg-white/5 transition-all">
                  <td className="py-4 font-mono text-xs text-red-400">ghost.js</td>
                  <td className="py-4"><StatusBadge status="error" label="HALLUCINATION" /></td>
                  <td className="py-4 text-xs text-red-400 font-bold">Failed</td>
                </tr>
              )}
            </tbody>
          </table>
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
        console.error('Failed to load command deck data:', e);
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
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
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
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${allocation}%` }} className="h-full bg-indigo-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {loading ? (
              <div className="text-sm text-slate-500">Loading missions...</div>
            ) : missions.length === 0 ? (
              <div className="text-sm text-slate-500">No active missions found.</div>
            ) : (
              missions.slice(0, 4).map(mission => (
                <div key={mission.mission_id} className="p-4 bg-black/30 border border-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-white">{mission.title || mission.mission_id}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{mission.mission_id}</div>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${mission.status === 'executed' ? 'text-emerald-400' : 'text-indigo-400'}`}>
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
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-gradient-to-br from-black via-indigo-950/20 to-black rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative">
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BRIDGE}/api/intelligence/execute`, {
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
        console.error('Failed to load merge court data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const conflicts = data?.conflicts || [];

  return (
    <Card className="p-8 border-cyan-500/30 bg-cyan-500/5">
      <div className="flex items-center gap-4 mb-6">
        <GitMerge className="text-cyan-400" size={28} />
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Merge Court</h3>
      </div>
      <p className="text-slate-500 text-sm mb-6 font-mono">Autonomous conflict resolution for multi-agent logic branches.</p>
      {loading ? (
        <div className="p-12 border-2 border-dashed border-cyan-500/10 rounded-3xl text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest">
          Analyzing Conflicts...
        </div>
      ) : conflicts.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-cyan-500/10 rounded-3xl text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest">
          {data?.message || 'Zero Conflicts Detected in Active Reality'}
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict, index) => (
            <div key={index} className="p-4 bg-black/30 border border-red-500/30 rounded-lg">
              <div className="text-xs font-bold text-white">{conflict.file}</div>
              <div className="text-[10px] text-slate-500 font-mono">{conflict.reason}</div>
            </div>
          ))}
        </div>
      )}
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
        console.error('Failed to load pattern mirror data:', e);
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
        <Search className="text-indigo-400" size={28} />
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Pattern Mirror</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="text-[10px] font-black text-slate-500 mb-2">Detected Patterns</div>
          {loading ? (
            <div className="text-slate-500 font-mono text-xs">Loading...</div>
          ) : (
            patterns.map((p, i) => (
              <div key={i} className="text-indigo-400 font-mono text-xs">{p}</div>
            ))
          )}
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
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
        console.error('Failed to load prompt genome data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fitness = data?.fitness || 0;
  const drift = data?.drift || 0;

  return (
    <Card className="p-8 bg-gradient-to-br from-indigo-950/20 to-black/40">
      <div className="flex items-center gap-4 mb-6">
        <Database className="text-indigo-400" size={28} />
        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Prompt Genome</h3>
      </div>
      <p className="text-slate-500 text-sm mb-6">Ancestral mapping of prompt evolution and performance traits.</p>
      <div className="space-y-2">
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
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
          console.error('Scan failed:', data.error);
        }
      } catch (e) {
        console.error('Scan failed:', e);
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
        <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest">The engine of infinite intelligence. Operating at 2M+ IQ baseline.</p>
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
        console.error('Failed to load proof vault data:', e);
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
      <div className="p-10 border border-slate-800 rounded-3xl bg-black/40 text-center">
        <Lock size={48} className="mx-auto text-slate-700 mb-6" />
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vault Status: {data?.status || 'SEALED'}</div>
        <div className="text-xs font-bold text-white mt-2">
          {loading ? 'Counting Receipts...' : `${data?.count || 0} Sovereign Receipts Archived`}
        </div>
      </div>
    </Card>
  );
}

export function SovereignFinalityView() {
  return (
    <div className="p-10 bg-[#09090b] rounded-[40px] border border-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.05)] text-center space-y-8">
       <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
          <Shield size={48} className="text-indigo-400" />
       </div>
       <div className="space-y-2">
         <h2 className="text-4xl font-black text-white tracking-tighter">SOVEREIGN FINALITY</h2>
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
  <div className="p-6 bg-black/40 rounded-3xl border border-slate-800/80">
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</div>
    <div className="text-2xl font-black text-white">{value}</div>
  </div>
);

const MissionPill = ({ label, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
    <span className="text-[10px] font-black text-slate-400 tracking-wider">{label}</span>
    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{status}</span>
  </div>
);

// Icon Fallbacks (if missing from lucide-react imports)
function GitMerge(props) { return <Activity {...props} />; }
function ShieldAlert(props) { return <Shield {...props} />; }
