import React, { useMemo, useState, useEffect } from "react";
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

  const cardStyle = { background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginBottom: 12 };
  const badgeStyle = (status) => {
    const tone = getTone(status);
    return { background: tone.bg, color: tone.text, border: `1px solid ${tone.border}`, padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' };
  };

  const tabs = [
    { id: 'modules', label: 'Modules' },
    { id: 'evolution_os', label: 'Evolution OS' },
    { id: 'inventions', label: 'Breakout Invention' },
    { id: 'controllers', label: 'Controllers' },
    { id: 'wires', label: 'Wires' },
    { id: 'grades', label: '100% Gates' },
    { id: 'activation', label: 'Activation' },
    { id: 'log', label: 'Cycle Log' }
  ];

  if (isUnbound) {
    tabs.unshift({ id: 'apex', label: 'Admin Root (Global Infrastructure)' });
  }

  return (
    <div style={{ padding: 20, fontFamily: "'Inter', sans-serif", color: '#e0e0ff', minHeight: '100%', background: '#060812' }}>
      
      {/* Header Card */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #0f172a, #312e81, #000000)', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ color: '#fde047', fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 900 }}>
              PromptHouse Evo Studio · Autonomous Self-Build
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: '12px 0', lineHeight: 1.1 }}>
              Max Execution Command Center
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.5, maxWidth: 600 }}>
              All-in-one control deck for self-build, self-upgrade, self-evolution, bots-as-controllers, WorkTwin Marketplace, Fission, Friction, Temporal Stackchain, VectorPack, DeployRail, Commerce Rail, NightForge, LiveForge, ForgeRender, PromptBase, Proof Deck, Browser Bridge, and API wiring.
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {truthStates.map((state) => <span key={state} style={badgeStyle(state)}>{state}</span>)}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', padding: 16, borderRadius: 10, minWidth: 250 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: '#cbd5e1', fontSize: 13 }}>Current Real Score</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: getScoreColor(average) }}>{average}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${average}%`, height: '100%', background: getScoreColor(average) }} />
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
              Design score is high. Runtime 100% is blocked until installed into the real repo, connected to backend/providers, tested, and proven with receipts.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <select 
                value={mode} 
                onChange={e => setMode(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 10px', borderRadius: 6, fontSize: 12, flex: 1 }}
              >
                <option value="past-mvp">Past-MVP</option>
                <option value="beta">Beta Ready</option>
                <option value="enterprise">Enterprise Proof</option>
              </select>
              <button 
                onClick={runCycle}
                style={{ background: '#facc15', color: 'black', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}
              >
                🔄 Self-Build
              </button>
            </div>
            
            <button
              onClick={toggleUnbound}
              style={{ 
                marginTop: 10, width: '100%', background: isUnbound ? '#ef4444' : 'rgba(255,255,255,0.05)', 
                color: 'white', border: isUnbound ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.1)', 
                padding: '8px', borderRadius: 6, fontSize: 12, fontWeight: 900, cursor: 'pointer',
                boxShadow: isUnbound ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none'
              }}
            >
              {isUnbound ? '⚠️ UNBOUND DEPLOYMENT MODE' : 'Enable Automated Deployment'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap', background: '#0f172a', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)}
            style={{ 
              background: activeTab === t.id ? '#1e293b' : 'transparent', 
              color: activeTab === t.id ? 'white' : '#94a3b8', 
              border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
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
  );
}
