import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Shield, Globe, Activity, 
  Layers, Lock, Database, Terminal, 
  CheckCircle, AlertTriangle, TrendingUp, Search
} from 'lucide-react';
import { Card, Button, StatusBadge, IconButton } from './components/primitives.jsx';

const BRIDGE = 'http://localhost:3001';

export function VectorMemoryView() {
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
          <StatMini label="Dimensions" value="1,536" />
          <StatMini label="Stabilized" value="100%" />
          <StatMini label="Latency" value="0.2ms" />
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
          <StatusBadge status="verified" label="SCANNING_TIMELINE" />
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-black/40 rounded-2xl border border-violet-500/20 flex items-center justify-between group hover:border-violet-500/50 transition-all">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-amber-500" size={20} />
              <div>
                <h4 className="text-white font-bold text-sm">[FORECAST] Dependency Drift Detected</h4>
                <p className="text-xs text-slate-500">Flutter 4.x transition may break current Navigator logic.</p>
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
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tight">Autonomous Team Swarm</h2>
        <div className="flex gap-2">
          <StatusBadge status="executing" label="6 AGENTS ACTIVE" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
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
        <h2 className="text-4xl font-black text-white">Logic Inevitability: 100%</h2>
        <p className="text-slate-500 max-w-md font-medium">Zero-drift state achieved via Recursive Entropy Locking. All hallucinations have been purged from the active context.</p>
        <div className="pt-6">
          <StatusBadge status="verified" label="ENTROPY_LOCKED" />
        </div>
      </div>
    </div>
  );
}

export function RealitySynthesisView() {
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
              <input className="field-input flex-1" placeholder="https://linear.app/ui-clone" />
              <Button>SYNTHESIZE</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TruthAuditorView() {
  return (
    <div className="space-y-8">
      <Card className="p-0 overflow-hidden">
        <div className="p-8 border-b border-slate-800 bg-slate-900/20 flex justify-between items-center">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Truth Verification Registry</h3>
          <StatusBadge status="verified" label="AUDIT_PASSED" />
        </div>
        <div className="p-8">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="pb-4">Logic Asset</th>
                <th className="pb-4">Source Origin</th>
                <th className="pb-4">Truth Density</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="group hover:bg-white/5 transition-all">
                <td className="py-4 font-mono text-xs text-white">TruthGate.js</td>
                <td className="py-4 text-xs text-slate-500">Sovereign Core</td>
                <td className="py-4 text-xs text-indigo-400 font-bold">100.0%</td>
                <td className="py-4"><StatusBadge status="verified" label="SEALED" /></td>
              </tr>
               <tr className="group hover:bg-white/5 transition-all">
                <td className="py-4 font-mono text-xs text-white">engine.js</td>
                <td className="py-4 text-xs text-slate-500">Local FS</td>
                <td className="py-4 text-xs text-indigo-400 font-bold">98.4%</td>
                <td className="py-4"><StatusBadge status="verified" label="SIGNED" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function CommandDeckView() {
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
             <div className="text-2xl font-black text-white">42%</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} className="h-full bg-indigo-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <MissionPill label="MISSION_ALPHA" status="BUILDING_CORE" />
            <MissionPill label="MISSION_BETA" status="AUDITING_GENOME" />
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
