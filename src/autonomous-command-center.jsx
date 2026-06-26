import React, { useMemo, useState, useEffect } from "react";
import { ShieldAlert, Server, Activity, Terminal, Eye, Dna, Settings, Cpu, Grid, Hexagon, Zap, Link as LinkIcon, Database } from "lucide-react";

import { 
  getSovereigntyPolicy, setSovereigntyPolicy, 
  getAllReceipts, computeAllGateScores, syncTruthFromBridge 
} from "./prompt-base.js";
import { GATE_DEFINITIONS } from "./models.js";
import { BRIDGE_URL } from './config/bridge-config.js';

import { ModulesTab } from './features/command-center/ModulesTab.jsx';
import { EvolutionOSTab } from './features/command-center/EvolutionOSTab.jsx';
import { InventionsTab } from './features/command-center/InventionsTab.jsx';
import { ControllersTab } from './features/command-center/ControllersTab.jsx';
import { WiresTab } from './features/command-center/WiresTab.jsx';
import { GradesTab } from './features/command-center/GradesTab.jsx';
import { ActivationTab } from './features/command-center/ActivationTab.jsx';
import { LogTab } from './features/command-center/LogTab.jsx';
import { ApexAdminTab } from './features/command-center/ApexAdminTab.jsx';

const truthStates = ["known", "inferred", "blocked", "broken", "built", "verified", "recommended"];

const buildOrder = [
  "Repo scan + canon check",
  "Data models + schemas",
  "PromptBase + Saved Missions",
  "Proof Deck",
  "Browser Bridge API",
  "Swarm Fission Arena",
  "ForgeFriction Gate",
  "Temporal Stackchain",
  "VectorPack Compression",
  "LiveForge + ForgeRender",
  "Evo WorkTwin Vault",
  "Pattern Miner",
  "Tool Autogenerator",
  "Proof-to-Value Deck",
  "Evo Exchange private marketplace",
  "DeployRail live-run",
  "Commerce Rail local test",
  "NightForge scheduled patch proposal",
  "Acceptance tests",
  "Runtime proof receipts",
];

const botControllers = [
  ["Evo", "Mission commander", "approves mission path and product direction"],
  ["Conductor", "Route controller", "splits work across modules and tracks dependencies"],
  ["Swarm Falcon", "Fission controller", "creates candidate lanes and merge order"],
  ["Forge Rhino", "Release controller", "DeployRail, Commerce Rail, production gates"],
  ["Vector Wolf", "Context controller", "VectorPack compression and retrieval boundaries"],
  ["Temporal Raven", "Time controller", "Temporal Stackchain and deprecation paths"],
  ["Cipher Lynx", "Security controller", "secrets, prompt injection, browser capture risk"],
  ["Verifier", "Proof controller", "tests, validation, receipts, unverified-free status"],
  ["Ledger", "Receipt controller", "versioning, audit trail, proof indexing"],
  ["Enterprise Auth", "Owner authority", "final approval for risky actions"],
];

function getTone(status) {
  if (status === "verified") return { bg: "rgba(16, 185, 129, 0.2)", text: "#6ee7b7", border: "rgba(52, 211, 153, 0.3)" };
  if (status === "built") return { bg: "rgba(6, 182, 212, 0.2)", text: "#67e8f9", border: "rgba(34, 211, 238, 0.3)" };
  if (status === "recommended") return { bg: "rgba(234, 179, 8, 0.2)", text: "#fde047", border: "rgba(250, 204, 21, 0.3)" };
  if (status === "blocked" || status === "broken") return { bg: "rgba(239, 68, 68, 0.2)", text: "#fca5a5", border: "rgba(248, 113, 113, 0.3)" };
  return { bg: "rgba(100, 116, 139, 0.2)", text: "#cbd5e1", border: "rgba(148, 163, 184, 0.3)" };
}

function getScoreColor(score) {
  if (score >= 90) return "#6ee7b7";
  if (score >= 75) return "#fde047";
  return "#fca5a5";
}

export function AutonomousSelfBuildCommandCenter() {
  const [cycle, setCycle] = useState(1);
  const [mode, setMode] = useState("past-mvp");
  const [isUnbound, setIsUnbound] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");
  const [receipts, setReceipts] = useState([]);
  const [nuclearAudit, setNuclearAudit] = useState(null);
  const [selfImplementationState, setSelfImplementationState] = useState(null);
  const [autonomousEvolutionStatus, setAutonomousEvolutionStatus] = useState(null);

  const gateScores = useMemo(() => computeAllGateScores(GATE_DEFINITIONS), [receipts]);

  const modules = useMemo(() => {
    return GATE_DEFINITIONS.map(gate => {
      const scoreData = gateScores.find(g => g.id === gate.id) || { score: 0, status: 'blocked' };
      const icons = {
        fission_arena: '⚡', forge_friction: '🧱', temporal_stack: '⏳', vector_pack: '📦',
        deploy_rail: '🚀', commerce_rail: '💳', nightforge: '🌙', proof_deck: '🛡️',
        browser_bridge: '🌐', prompt_base: '🗄️', live_forge: '👁️', forge_render: '✨',
        self_build: '🔄'
      };
      return {
        id: gate.id,
        name: gate.label,
        owner: gate.owner,
        icon: icons[gate.id] || '⚙️',
        status: scoreData.status,
        score: scoreData.score,
        proof: gate.id === 'self_build' ? 'All gates verified' : `Verified ${gate.label} logic`
      };
    });
  }, [gateScores]);

  const gradeGates = useMemo(() => {
    return modules.map(m => ({
      gate: m.name,
      score: m.score,
      truth: m.status,
      proof: m.proof
    }));
  }, [modules]);

  useEffect(() => {
    setIsUnbound(getSovereigntyPolicy() === 'unbound');
    
    const init = async () => {
      await syncTruthFromBridge();
      setReceipts(getAllReceipts());
      try {
        const [auditRes, implRes, evoRes] = await Promise.all([
          fetch(BRIDGE_URL + '/api/audit/nuclear-truth'),
          fetch(BRIDGE_URL + '/api/self-implementation/status'),
          fetch(BRIDGE_URL + '/api/evolution/autonomous/status')
        ]);
        if (auditRes.ok) setNuclearAudit(await auditRes.json());
        if (implRes.ok) setSelfImplementationState(await implRes.json());
        if (evoRes.ok) setAutonomousEvolutionStatus(await evoRes.json());
      } catch {
        // Keep working with receipt-only view.
      }
    };
    init();

    const interval = setInterval(() => {
      syncTruthFromBridge().then(async () => {
        setReceipts(getAllReceipts());
        try {
          const [auditRes, evoRes] = await Promise.all([
            fetch(BRIDGE_URL + '/api/audit/nuclear-truth'),
            fetch(BRIDGE_URL + '/api/evolution/autonomous/status')
          ]);
          if (auditRes.ok) setNuclearAudit(await auditRes.json());
          if (evoRes.ok) setAutonomousEvolutionStatus(await evoRes.json());
        } catch {
          // Keep rendering previous report.
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function toggleUnbound() {
    const next = !isUnbound;
    setIsUnbound(next);
    setSovereigntyPolicy(next ? 'unbound' : 'manual');
  }
  
  const [log, setLog] = useState([
    "Cycle 1: Max Lock activated.",
    "Cycle 1: Docx mechanics loaded into build map.",
    "Cycle 1: Added Evo WorkTwin Marketplace breakout inventions.",
    "Cycle 1: Runtime 100% blocked until repo, tests, credentials, and proof receipts exist.",
  ]);
  
  const average = useMemo(() => gradeGates.length ? Math.round(gradeGates.reduce((sum, item) => sum + item.score, 0) / gradeGates.length) : 0, [gradeGates]);
  const weakest = useMemo(() => gradeGates.length ? [...gradeGates].sort((a, b) => a.score - b.score)[0] : { gate: 'None', score: 100 }, [gradeGates]);

  async function runCycle() {
    setCycle((value) => value + 1);
    setLog((items) => [
      `Cycle ${cycle + 1}: Self-build audit triggered via PromptBridge...`,
      ...items,
    ]);

    try {
      const res = await fetch(BRIDGE_URL + '/api/self-implementation/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyFixes: false })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        let auditSnapshot = null;
        try {
          const auditRes = await fetch(BRIDGE_URL + '/api/audit/nuclear-truth');
          if (auditRes.ok) {
            auditSnapshot = await auditRes.json();
            setNuclearAudit(auditSnapshot);
          }
        } catch {
          // Keep cycle usable even when audit endpoint is unavailable.
        }

        setLog((items) => [
          `Cycle ${cycle + 1}: Self-implementation cycle completed in ${data.status}.`,
          auditSnapshot ? `Cycle ${cycle + 1}: Nuclear Truth score ${auditSnapshot.score}% (${String(auditSnapshot.truthState).toUpperCase()}).` : `Cycle ${cycle + 1}: Nuclear Truth snapshot unavailable.`,
          `Cycle ${cycle + 1}: Weakest gate: ${weakest.gate} (${weakest.score}%).`,
          ...items,
        ]);
        setReceipts(getAllReceipts());
      } else {
        setLog((items) => [`Cycle ${cycle + 1}: Cycle failed. Error: ${data.error || 'Unknown failure'}`, ...items]);
      }
    } catch (e) {
      setLog((items) => [`Cycle ${cycle + 1}: Bridge offline. No new proof receipts.`, ...items]);
    }
  }

  const cardStyle = { background: 'transparent' };
  const badgeStyle = (status) => {
    const tone = getTone(status);
    return { background: tone.bg, color: tone.text, border: `1px solid ${tone.border}`, padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' };
  };

  const tabs = [
    { id: 'modules', label: 'Modules', icon: Grid },
    { id: 'evolution_os', label: 'Evolution OS', icon: Dna },
    { id: 'inventions', label: 'Invention', icon: Zap },
    { id: 'controllers', label: 'Controllers', icon: Cpu },
    { id: 'wires', label: 'Wires', icon: LinkIcon },
    { id: 'grades', label: '100% Gates', icon: ShieldAlert },
    { id: 'activation', label: 'Activation', icon: Activity },
    { id: 'log', label: 'Log', icon: Terminal }
  ];

  if (isUnbound) {
    tabs.unshift({ id: 'apex', label: 'Apex Admin', icon: Server });
  }

  return (
    <div className="flex flex-col gap-6 animate-in pb-12">
      {/* Header Card */}
      <div className={`glass-extreme rounded-3xl border-neon-glow shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden backdrop-blur-xl ${isUnbound ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-yellow-500/30'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/90 to-black/80"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                  <Hexagon className="text-yellow-400" size={20} />
                </div>
                <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.25em]">
                  PromptHouse Evo Studio · Autonomous Self-Build
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.1] mb-4">
                Max Execution Command Center
              </h1>
              
              <p className="text-slate-400 text-sm md:text-base max-w-3xl leading-relaxed mb-6 font-medium">
                All-in-one control deck for self-build, self-upgrade, self-evolution, bots-as-controllers, WorkTwin Marketplace, Fission, Friction, Temporal Stackchain, VectorPack, DeployRail, Commerce Rail, NightForge, LiveForge, ForgeRender, PromptBase, Proof Deck, Browser Bridge, and API wiring.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {truthStates.map((state) => <span key={state} style={badgeStyle(state)}>{state}</span>)}
              </div>
            </div>

            <div className="w-full xl:w-[350px] shrink-0 glass-panel bg-black/60 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-end justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Current Real Score</span>
                <span className="text-4xl font-black tracking-tighter" style={{ color: getScoreColor(average) }}>{average}%</span>
              </div>
              
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${average}%`, backgroundColor: getScoreColor(average), boxShadow: `0 0 10px ${getScoreColor(average)}` }} 
                />
              </div>
              
              <p className="text-[11px] text-slate-400 mb-6 font-medium leading-relaxed">
                Design score is high. Runtime 100% is blocked until installed into the real repo, connected to backend/providers, tested, and proven with receipts.
              </p>
              
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <select 
                    value={mode} 
                    onChange={e => setMode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-slate-200 text-xs font-bold rounded-xl py-2.5 pl-9 pr-3 appearance-none focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-colors cursor-pointer"
                  >
                    <option value="past-mvp">Past-MVP</option>
                    <option value="beta">Beta Ready</option>
                    <option value="enterprise">Enterprise Proof</option>
                  </select>
                </div>
                
                <button 
                  onClick={runCycle}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all active:scale-95 whitespace-nowrap"
                >
                  <Activity size={14} /> Self-Build
                </button>
              </div>
              
              <button
                onClick={toggleUnbound}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isUnbound 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' 
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {isUnbound ? (
                  <><ShieldAlert size={14} /> UNBOUND DEPLOYMENT MODE</>
                ) : (
                  <><Settings size={14} /> Enable Automated Deployment</>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-xl overflow-x-auto custom-scrollbar">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-indigo-400' : 'opacity-50'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      <div className="glass-extreme rounded-3xl border-neon-glow shadow-2xl bg-[#030408]/80 backdrop-blur-2xl p-6 border border-white/5 min-h-[500px]">
        {activeTab === 'apex' && isUnbound && <ApexAdminTab nuclearAudit={nuclearAudit} selfImplementationState={selfImplementationState} cardStyle={cardStyle} />}
        {activeTab === 'modules' && <ModulesTab modules={modules} cardStyle={cardStyle} badgeStyle={badgeStyle} getScoreColor={getScoreColor} />}
        {activeTab === 'evolution_os' && <EvolutionOSTab autonomousEvolutionStatus={autonomousEvolutionStatus} cardStyle={cardStyle} />}
        {activeTab === 'inventions' && <InventionsTab cardStyle={cardStyle} badgeStyle={badgeStyle} />}
        {activeTab === 'controllers' && <ControllersTab botControllers={botControllers} cardStyle={cardStyle} />}
        {activeTab === 'wires' && <WiresTab cardStyle={cardStyle} />}
        {activeTab === 'grades' && <GradesTab gradeGates={gradeGates} cardStyle={cardStyle} badgeStyle={badgeStyle} getScoreColor={getScoreColor} />}
        {activeTab === 'activation' && <ActivationTab buildOrder={buildOrder} cardStyle={cardStyle} />}
        {activeTab === 'log' && <LogTab cycle={cycle} log={log} cardStyle={cardStyle} badgeStyle={badgeStyle} />}
      </div>
    </div>
  );
}
