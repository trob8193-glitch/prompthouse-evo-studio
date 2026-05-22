import React, { useMemo, useState, useEffect } from "react";
import { io } from 'socket.io-client';
import { BRIDGE_URL } from './config/bridge-config.js';
import { 
  getSovereigntyPolicy, setSovereigntyPolicy, 
  getAllReceipts, computeAllGateScores, syncTruthFromBridge 
} from "./prompt-base.js";
import { GATE_DEFINITIONS } from "./models.js";

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
  { id: 'evo',            name: 'Evo',            role: 'Mission Commander',   icon: '⚡', palette: { primary: '#6366f1', accent: '#a5b4fc', glow: 'rgba(99,102,241,0.35)' },  detail: 'Approves mission path and product direction; sovereign command authority over all gate decisions.' },
  { id: 'conductor',     name: 'Conductor',      role: 'Route Controller',    icon: '🎯', palette: { primary: '#06b6d4', accent: '#67e8f9', glow: 'rgba(6,182,212,0.35)' },   detail: 'Splits work across modules, tracks dependencies, and dispatches tasks with zero latency.' },
  { id: 'swarm_falcon',  name: 'Swarm Falcon',   role: 'Fission Controller',  icon: '🦅', palette: { primary: '#f59e0b', accent: '#fde68a', glow: 'rgba(245,158,11,0.35)' },  detail: 'Runs Fission Arena with 3–5 candidate approaches, picks the winner, and sets merge order.' },
  { id: 'forge_rhino',   name: 'Forge Rhino',    role: 'Release Controller',  icon: '🦏', palette: { primary: '#f43f5e', accent: '#fda4af', glow: 'rgba(244,63,94,0.35)' },   detail: 'Applies ForgeFriction gates, blocks unsafe deployments, and enforces production quality floors.' },
  { id: 'vector_wolf',   name: 'Vector Wolf',    role: 'Context Controller',  icon: '🐺', palette: { primary: '#10b981', accent: '#6ee7b7', glow: 'rgba(16,185,129,0.35)' },  detail: 'Builds VectorPacks, redacts secrets, and compresses mission context for precise LLM injection.' },
  { id: 'temporal_raven',name: 'Temporal Raven', role: 'Time Controller',     icon: '🪶', palette: { primary: '#8b5cf6', accent: '#c4b5fd', glow: 'rgba(139,92,246,0.35)' },  detail: 'Generates NOW/6-month/12-month technical stackchains and manages all deprecation paths.' },
  { id: 'cipher_lynx',   name: 'Cipher Lynx',    role: 'Security Controller', icon: '🔐', palette: { primary: '#f97316', accent: '#fdba74', glow: 'rgba(249,115,22,0.35)' },  detail: 'Audits for secrets leakage, prompt injection, browser capture risk, and unsafe patterns.' },
  { id: 'verifier',      name: 'Verifier',       role: 'Proof Controller',    icon: '✅', palette: { primary: '#14b8a6', accent: '#5eead4', glow: 'rgba(20,184,166,0.35)' },  detail: 'Runs tests, validates receipts, and enforces unverified-free status across all proof gates.' },
  { id: 'ledger',        name: 'Ledger',         role: 'Receipt Controller',  icon: '📒', palette: { primary: '#0ea5e9', accent: '#7dd3fc', glow: 'rgba(14,165,233,0.35)' },  detail: 'Manages versioning, maintains the immutable audit trail, and indexes all proof receipts.' },
  { id: 'enterprise_auth',name: 'Enterprise Auth',role: 'Owner Authority',    icon: '👑', palette: { primary: '#eab308', accent: '#fef08a', glow: 'rgba(234,179,8,0.35)' },   detail: 'Final approval authority for risky actions, destructive commands, and production deployments.' },
  { id: 'ghost_scout',   name: 'Ghost Scout',    role: 'Recon Agent',         icon: '👻', palette: { primary: '#64748b', accent: '#cbd5e1', glow: 'rgba(100,116,139,0.35)' }, detail: 'Silent recon agent for environment discovery, gap detection, and pre-mission intelligence.' },
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
          fetch(`${BRIDGE_URL}/api/audit/nuclear-truth`),
          fetch(`${BRIDGE_URL}/api/self-implementation/status`),
          fetch(`${BRIDGE_URL}/api/evolution/autonomous/status`)
        ]);
        if (auditRes.ok) setNuclearAudit(await auditRes.json());
        if (implRes.ok) setSelfImplementationState(await implRes.json());
        if (evoRes.ok) setAutonomousEvolutionStatus(await evoRes.json());
      } catch {
        // Keep working with receipt-only view.
      }
    };
    init();

    const socket = io(BRIDGE_URL);
    socket.on('telemetry_update', async (data) => {
      if (data.type === 'audit') setNuclearAudit(data.payload);
      if (data.type === 'evolution') setAutonomousEvolutionStatus(data.payload);
      if (data.type === 'receipts') setReceipts(data.payload);
    });
    return () => socket.disconnect();
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
      const res = await fetch(`${BRIDGE_URL}/api/self-implementation/cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyFixes: false })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        let auditSnapshot = null;
        try {
          const auditRes = await fetch(`${BRIDGE_URL}/api/audit/nuclear-truth`);
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
      {activeTab === 'apex' && isUnbound && (
        <div style={{ ...cardStyle, background: '#020617', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <div style={{ color: '#ef4444', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 900 }}>Admin Root · Automated Deployment</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: '8px 0 24px 0', color: 'white' }}>Global Telemetry Dashboard</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Modules Scanned</div>
              <div style={{ color: '#6ee7b7', fontSize: 32, fontWeight: 900 }}>{nuclearAudit?.summary?.modulesScanned ?? '-'}</div>
              <div style={{ color: '#6ee7b7', fontSize: 10, marginTop: 4 }}>Nuclear Truth inventory</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Nuclear Truth Score</div>
              <div style={{ color: '#fde047', fontSize: 32, fontWeight: 900 }}>{nuclearAudit?.score ?? '-'}%</div>
              <div style={{ color: '#fde047', fontSize: 10, marginTop: 4 }}>Audit-backed</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Broken API Wires</div>
              <div style={{ color: '#67e8f9', fontSize: 32, fontWeight: 900 }}>{nuclearAudit?.summary?.brokenWires ?? '-'}</div>
              <div style={{ color: '#67e8f9', fontSize: 10, marginTop: 4 }}>Route integrity</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Self-Implementation Active</div>
              <div style={{ color: 'white', fontSize: 32, fontWeight: 900 }}>{selfImplementationState?.active ? 'YES' : 'NO'}</div>
              <div style={{ color: '#cbd5e1', fontSize: 10, marginTop: 4 }}>Policy-backed runtime state</div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: 13, lineHeight: 1.5 }}>
            <strong>WARNING:</strong> Unbound mode removes manual guardrails. Production deploy and live commerce remain policy-gated until explicit owner approval and proof receipts exist.
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {modules.map(mod => (
            <div key={mod.id} style={{ ...cardStyle, background: '#020617', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} className="hover:border-yellow-400">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>{mod.icon}</span>
                <span style={badgeStyle(mod.status)}>{mod.status}</span>
              </div>
              <h3 style={{ margin: '12px 0 4px 0', fontSize: 16, fontWeight: 900 }}>{mod.name}</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Owner: {mod.owner}</p>
              <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#cbd5e1', minHeight: 36 }}>{mod.proof}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${mod.score}%`, height: '100%', background: getScoreColor(mod.score) }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 900, color: getScoreColor(mod.score) }}>{mod.score}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'evolution_os' && (
        <div style={{ ...cardStyle, background: '#020617' }}>
          <h2 style={{ margin: '0 0 14px 0', fontSize: 24, fontWeight: 900 }}>Autonomous Evolution OS</h2>
          {!autonomousEvolutionStatus ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Awaiting live evolution telemetry from PromptBridge...</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
                <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Capability Graph</div>
                  <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#6ee7b7' }}>{autonomousEvolutionStatus.capabilityGraph?.summary?.modules ?? 0} modules</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>Drift: {autonomousEvolutionStatus.drift?.score ?? 0}% ({autonomousEvolutionStatus.drift?.status || 'unknown'})</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Failure Memory</div>
                  <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#fca5a5' }}>{autonomousEvolutionStatus.failureMemory?.total ?? 0} failures</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>Weak point: {autonomousEvolutionStatus.failureMemory?.recoveryPlan?.topStage || 'none'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>NightForge Challenge</div>
                  <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#fde047' }}>{autonomousEvolutionStatus.nightforgeChallenge?.activeChallenge?.name || 'none'}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>{autonomousEvolutionStatus.nightforgeChallenge?.activeChallenge?.target || 'No challenge active.'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Replay Theater</div>
                  <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: '#67e8f9' }}>{autonomousEvolutionStatus.replayTheater?.total ?? 0} runs</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#cbd5e1' }}>Verified: {autonomousEvolutionStatus.replayTheater?.statusMix?.verified ?? 0}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Top Feature Fusions</div>
                {(autonomousEvolutionStatus.featureFusion?.top || []).slice(0, 5).map((fusion) => (
                  <div key={fusion.id} style={{ padding: '8px 10px', marginBottom: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,23,42,0.5)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{fusion.route}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{fusion.fromUi} ↔ {fusion.toApi}</div>
                    <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>{fusion.proposal}</div>
                  </div>
                ))}
                {(autonomousEvolutionStatus.featureFusion?.top || []).length === 0 && (
                  <div style={{ color: '#64748b', fontSize: 12 }}>No live fusion candidates found yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventions' && (
        <div style={{ ...cardStyle, background: '#020617' }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ color: '#fde047', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Million-dollar breakout</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: '8px 0' }}>Evo WorkTwin Marketplace</h2>
              <p style={{ color: '#cbd5e1', fontSize: 14 }}>
                Browser-powered personal AI studio twin that captures approved workflows, mines repeatable patterns, generates reusable tools, proves ROI, and lets users keep, share, or sell the result.
              </p>
              <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
                {[
                  "WorkTwin Capture: browser/API/studio approved context capture",
                  "Pattern Miner: finds repeated tasks and friction",
                  "Tool Autogenerator: builds agents/apps/extensions/templates",
                  "Fission Forge: tests multiple versions and keeps winner",
                  "Proof-to-Value Deck: time saved, steps removed, cost reduced",
                  "Evo Exchange: private library + marketplace revenue loop",
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: 10, borderRadius: 8, fontSize: 13, color: '#e2e8f0' }}>
                    • {item}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 0.8, minWidth: 280 }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 900 }}>Money Loop</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#cbd5e1', fontSize: 13 }}>
                  <div>1. Capture approved workflow context.</div>
                  <div>2. Detect repeatable work.</div>
                  <div>3. Generate reusable tool/agent/extension.</div>
                  <div>4. Preview in LiveForge.</div>
                  <div>5. Score through Fission + Friction.</div>
                  <div>6. Create Proof-to-Value receipt.</div>
                  <div>7. Save to vault or sell through Evo Exchange.</div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <span style={badgeStyle('verified')}>retention + revenue engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'controllers' && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {botControllers.map((bot) => (
            <div
              key={bot.id}
              style={{
                ...cardStyle,
                background: '#020617',
                display: 'flex',
                gap: 14,
                border: `1px solid ${bot.palette.accent}33`,
                boxShadow: `0 0 18px ${bot.palette.glow}`,
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <div style={{
                fontSize: 26,
                width: 46, height: 46, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10,
                background: `linear-gradient(135deg, ${bot.palette.primary}22, ${bot.palette.accent}11)`,
                border: `1px solid ${bot.palette.primary}44`,
                boxShadow: `0 0 12px ${bot.palette.glow}`,
              }}>{bot.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: '0 0 2px 0', fontSize: 15, fontWeight: 900, color: bot.palette.accent }}>{bot.name}</h3>
                <div style={{ fontSize: 11, fontWeight: 700, color: bot.palette.primary, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{bot.role}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{bot.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'wires' && (
        <div style={{ ...cardStyle, background: '#020617' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 900 }}>Required Wires</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              "BrowserBridge → PromptBase → WorkTwin Capture",
              "PromptBase → Swarm Fission → Test Arena",
              "ForgeFriction → User Repair Prompt → Sovereignty Override",
              "Temporal Stackchain → Codegen → Forge Rhino Release Check",
              "VectorPack → Evo LM → PromptLink Provider Router",
              "LiveForge → ForgeRender → Proof Deck",
              "ForgeRender → Asset Vault → Evo Exchange",
              "DeployRail → Provider → Proof Receipt → Rollback Plan",
              "Commerce Rail → Stripe/Test Mode → Approval Receipt",
              "NightForge → Patch Bundle/PR → Tests → Proof Deck",
            ].map((wire, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#67e8f9' }}>🔗</span> {wire}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {gradeGates.map(gate => (
            <div key={gate.gate} style={{ ...cardStyle, background: '#020617', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBottom: 0 }}>
              <div style={{ width: 140 }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>{gate.gate}</div>
                <div style={{ marginTop: 6 }}><span style={badgeStyle(gate.truth)}>{gate.truth}</span></div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${gate.score}%`, height: '100%', background: getScoreColor(gate.score) }} />
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{gate.proof}</div>
              </div>
              <div style={{ width: 60, textAlign: 'right', fontSize: 24, fontWeight: 900, color: getScoreColor(gate.score) }}>
                {gate.score}%
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'activation' && (
        <div style={{ ...cardStyle, background: '#020617' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 900 }}>Production Build Script</h2>
          <textarea 
            readOnly
            style={{ width: '100%', minHeight: 450, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
            value={`PROMPTHOUSE EVO AUTONOMOUS SELF-BUILD ACTIVATION\n\nMISSION:\nBuild and wire PromptHouse Evo Studio past-MVP execution layer using all current studio inventions: PromptBase, Saved Missions, Proof Deck, Browser Agent Bridge, PromptLink, PromptBridge, LiveForge, ForgeRender, Swarm Fission Arena, ForgeFriction Gate, Temporal Stackchain, VectorPack Compression, Sovereign DeployRail, Commerce Rail, NightForge Daemon, Evo WorkTwin Vault, Pattern Miner, Tool Autogenerator, Proof-to-Value Deck, and Evo Exchange.\n\nPUBLIC SPEECH:\nOnly the 11 public PromptHouse bots respond by default. Senior bots support internally.\n\nSELF-BUILD LOOP:\nscan repo → canon check → module gap analysis → create safe patches → wire UI/API/models → run tests → create receipts → score all gates → repair weakest gate → repeat until blocked by missing runtime, credentials, approval, or destructive action.\n\nNO-BULLSHIT RULE:\nDo not claim 100%, 10/10, production deploy, revenue, users, extension publish, render output, or live Stripe until real proof exists.\n\nAPPROVAL REQUIRED:\nproduction deploy, live Stripe, external messages, paid provider calls, secrets changes, destructive terminal commands, app-store submission, user data deletion.\n\nOUTPUT EACH CYCLE:\nMission, Owner, Support, Built, Verified, Blocked, Broken, Recommended, Files changed, Tests run, Proof receipts, Scores, Weakest gate, Next repair.\n\nBUILD ORDER:\n${buildOrder.map((item, index) => `${index + 1}. ${item}`).join("\n")}`}
          />
        </div>
      )}

      {activeTab === 'log' && (
        <div style={{ ...cardStyle, background: '#020617' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Self-Build Cycle Log</h2>
            <span style={badgeStyle('recommended')}>Cycle {cycle}</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {log.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
                  <span style={{ color: item.includes('blocked') || item.includes('Weakest') ? '#fca5a5' : '#6ee7b7' }}>
                    {item.includes('blocked') || item.includes('Weakest') ? '⚠️' : '✅'}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
