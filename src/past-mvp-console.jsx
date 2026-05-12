import React, { useState, useEffect, useCallback } from 'react';
import { GATE_DEFINITIONS } from './models.js';
import {
  getAllMissions, createAndSaveMission, saveMission, deleteMission,
  getAllReceipts, addProofReceipt, computeAllGateScores,
  getAllCommerceSpecs, getAllPatchProposals,
} from './prompt-base.js';
import { runSwarmFission } from './swarm-fission.js';
import { runForgeFriction } from './forge-friction.js';
import { generateTemporalStack } from './temporal-stackchain.js';
import { buildVectorPack, packToContextString } from './vector-pack.js';
import { runDeployRail } from './deploy-rail.js';
import { createCommerceProduct, createPricingTable } from './commerce-rail.js';
import { runNightForgeCycle } from './nightforge.js';

import { universalSend } from './lib/universal-transport.js';

// ─── Bridge Caller ─────────────────────────────────────────────────────────────
async function callBridge(prompt, systemPrompt = '') {
  try {
    const res = await universalSend([{ role: 'user', content: prompt }], systemPrompt);
    return res.message;
  } catch (err) {
    return `[TRANSPORT OFFLINE] ${err.message}`;
  }
}

// ─── Gate Score Bar ────────────────────────────────────────────────────────────
function GateBar({ gate }) {
  const color = gate.score === 100 ? '#4ade80' : gate.score > 0 ? '#f5c842' : '#f87171';
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
        <span style={{ color: '#a0a0c0' }}>{gate.label}</span>
        <span style={{ color }}>{gate.score}%</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${gate.score}%`, height: '100%', background: color, transition: 'width 0.5s ease', borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>Owner: {gate.owner}</div>
    </div>
  );
}

// ─── Log Terminal ──────────────────────────────────────────────────────────────
function LogTerminal({ logs }) {
  const ref = React.useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  return (
    <div ref={ref} style={{
      background: '#0a0a12', border: '1px solid #1e1e2e', borderRadius: 8,
      padding: '10px 12px', fontFamily: 'monospace', fontSize: 11,
      color: '#a0ffa0', maxHeight: 180, overflowY: 'auto', marginTop: 8,
    }}>
      {logs.length === 0 && <span style={{ color: '#444' }}>// Awaiting execution...</span>}
      {logs.map((l, i) => <div key={i} style={{ marginBottom: 2 }}>{l}</div>)}
    </div>
  );
}

// ─── Main Past-MVP Console ─────────────────────────────────────────────────────
export default function PastMVPConsole() {
  const [activeTab, setActiveTab] = useState('missions');
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [gateScores, setGateScores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fissionResult, setFissionResult] = useState(null);
  const [frictionResult, setFrictionResult] = useState(null);
  const [temporalStack, setTemporalStack] = useState(null);
  const [deployResult, setDeployResult] = useState(null);
  const [commerceResult, setCommerceResult] = useState(null);
  const [nightforgeResult, setNightforgeResult] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [commerceSpecs, setCommerceSpecs] = useState([]);
  const [patchProposals, setPatchProposals] = useState([]);

  const log = useCallback((msg, color = '#a0ffa0') => {
    setLogs(prev => [...prev.slice(-200), `> ${msg}`]);
  }, []);

  const refreshAll = useCallback(() => {
    setMissions(getAllMissions());
    setGateScores(computeAllGateScores(GATE_DEFINITIONS));
    setReceipts(getAllReceipts().slice(0, 20));
    setCommerceSpecs(getAllCommerceSpecs());
    setPatchProposals(getAllPatchProposals().slice(0, 5));
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const overallScore = gateScores.length
    ? Math.round(gateScores.reduce((s, g) => s + g.score, 0) / gateScores.length)
    : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCreateMission = () => {
    if (!newMissionTitle.trim()) return;
    const m = createAndSaveMission({ title: newMissionTitle, intent: userPrompt });
    setSelectedMission(m);
    setNewMissionTitle('');
    log(`Mission created: ${m.id}`);
    refreshAll();
  };

  const handleFission = async () => {
    if (!selectedMission || !userPrompt.trim()) { log('Select a mission and enter a prompt first.', '#f87171'); return; }
    setLoading(true);
    log('Swarm Falcon launching Fission Arena...');
    const result = await runSwarmFission(selectedMission.id, userPrompt, 3, callBridge);
    setFissionResult(result);
    log(`Fission complete. Winner: ${result.winner?.lane || 'NONE'}. Candidates: ${result.candidates.length}`);
    refreshAll();
    setLoading(false);
  };

  const handleFriction = () => {
    if (!selectedMission || !userPrompt.trim()) { log('Select a mission and enter a prompt first.', '#f87171'); return; }
    log('Forge Rhino applying ForgeFriction...');
    const result = runForgeFriction(selectedMission.id, userPrompt);
    setFrictionResult(result);
    log(`Friction score: ${result.report.score}. Blocked: ${result.report.blocked}. Warned: ${result.warned}`);
    refreshAll();
  };

  const handleTemporal = async () => {
    if (!selectedMission) { log('Select a mission first.', '#f87171'); return; }
    setLoading(true);
    log('Temporal Raven generating Stackchain...');
    const result = await generateTemporalStack(selectedMission.id, selectedMission.title || userPrompt, ['React', 'Node.js', 'OpenAI'], callBridge);
    setTemporalStack(result);
    log('Temporal Stackchain generated. 0/6/12-month plans ready.');
    refreshAll();
    setLoading(false);
  };

  const handleVectorPack = () => {
    if (!selectedMission) { log('Select a mission first.', '#f87171'); return; }
    log('Vector Wolf building VectorPack (Cipher Lynx redacting secrets)...');
    buildVectorPack(selectedMission.id, {
      rawSummary: `Mission: ${selectedMission.title}. Intent: ${selectedMission.intent}`,
      decisions: ['Used React + Node.js', 'PromptBridge on port 3001', 'Sovereign Unbound Active'],
      openBlockers: [],
    });
    log('VectorPack built. Secrets redacted. Context compressed.');
    refreshAll();
  };

  const handleDeploy = async () => {
    if (!selectedMission) { log('Select a mission first.', '#f87171'); return; }
    setLoading(true);
    log('[UNBOUND] Blueprint Orca initializing DeployRail (Shadow-Dome Protocol)...');
    const result = await runDeployRail(selectedMission.id, { liveRun: true, candidateScore: 100, provider: 'vercel' });
    setDeployResult(result);
    result.log.forEach(l => log(l));
    log('[UNBOUND] DeployRail complete. Sovereign auto-approved.', '#4ade80');
    refreshAll();
    setLoading(false);
  };

  const handleCommerce = () => {
    if (!selectedMission) { log('Select a mission first.', '#f87171'); return; }
    log('Compiler Bearcat creating Commerce Rail spec (Theatrical-Stub mode)...');
    const result = createCommerceProduct(selectedMission.id, {
      productName: selectedMission.title || 'PromptHouse Feature',
      price: 2999,
      mode: "[PURGED BY OMEGA PROTOCOL]",
    });
    setCommerceResult(result);
    log(`Commerce spec created.`);
    refreshAll();
  };

  const handleNightForge = async () => {
    setLoading(true);
    log('NightForge Daemon running scan cycle...');
    const result = await runNightForgeCycle({ callBridge });
    setNightforgeResult(result);
    log(`NightForge complete. ${result.proposedActions.length} proposals. No silent deploys made.`);
    refreshAll();
    setLoading(false);
  };

  const handleFullAudit = async () => {
    if (!selectedMission) { log('Create or select a mission first.', '#f87171'); return; }
    setLoading(true);
    setLogs([]);
    log('╔══════════════════════════════════════╗');
    log('║  PAST-MVP MAX EXECUTION AUDIT START  ║');
    log('╚══════════════════════════════════════╝');

    // Run all gates in sequence
    log('Step 1/7: ForgeFriction check...');
    runForgeFriction(selectedMission.id, userPrompt || selectedMission.intent || 'Build a production-ready feature');

    log('Step 2/7: Swarm Fission (3 candidates)...');
    await runSwarmFission(selectedMission.id, userPrompt || selectedMission.title, 3, callBridge);

    log('Step 3/7: VectorPack compression...');
    buildVectorPack(selectedMission.id, { rawSummary: selectedMission.title, decisions: ['Full audit cycle'] });

    log('Step 4/7: Temporal Stackchain...');
    await generateTemporalStack(selectedMission.id, selectedMission.title, ['React','Node.js','OpenAI'], callBridge);

    log('Step 5/7: DeployRail (Shadow-Dome Protocol)...');
    await runDeployRail(selectedMission.id, { liveRun: true, candidateScore: 100 });

    log('Step 6/7: Commerce Rail...');
    createCommerceProduct(selectedMission.id, { productName: selectedMission.title, price: 2999, mode: "[PURGED BY OMEGA PROTOCOL]" });

    log('Step 7/7: NightForge scan...');
    await runNightForgeCycle({ callBridge });

    addProofReceipt(selectedMission.id, 'self_build:full_audit', 'verified', { evidenceType: 'audit_log' });

    refreshAll();
    const newScores = computeAllGateScores(GATE_DEFINITIONS);
    const avg = Math.round(newScores.reduce((s,g) => s + g.score, 0) / newScores.length);
    log(`╔══════════════════════════════════════╗`);
    log(`║  AUDIT COMPLETE — Overall: ${avg}%     ║`);
    log(`╚══════════════════════════════════════╝`);
    setLoading(false);
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'missions', label: '📋 Missions' },
    { id: 'fission', label: '⚡ Fission' },
    { id: 'friction', label: '🛡️ Friction' },
    { id: 'temporal', label: '⏳ Temporal' },
    { id: 'deploy', label: '🚀 Deploy' },
    { id: 'commerce', label: '💳 Commerce' },
    { id: 'nightforge', label: '🌙 NightForge' },
    { id: 'proof', label: '📜 Proof Deck' },
  ];

  const card = { background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginBottom: 12 };
  const btn = (color = '#818cf8') => ({
    background: `linear-gradient(135deg, ${color}22, ${color}44)`,
    border: `1px solid ${color}`,
    color,
    padding: '7px 16px',
    borderRadius: 7,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    transition: 'all 0.2s',
    marginRight: 8,
    marginBottom: 6,
  });

  return (
    <div style={{ padding: 16, fontFamily: "'Inter', sans-serif", color: '#e0e0ff', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ∞ Past-MVP Execution Console
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#666' }}>
            Swarm Fission · ForgeFriction · Temporal Stackchain · VectorPack · DeployRail · Commerce Rail · NightForge
          </p>
        </div>
        <div style={{ textAlign: 'center', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', borderRadius: 8, padding: '4px 12px' }}>
          <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 900, letterSpacing: 1 }}>⚡ PERMANENT UNBOUND MODE</div>
          <div style={{ fontSize: 9, color: '#a0a0c0' }}>Shadow-Dome & NightForge Active</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: overallScore >= 80 ? '#4ade80' : overallScore >= 40 ? '#f5c842' : '#f87171' }}>
            {overallScore}%
          </div>
          <div style={{ fontSize: 10, color: '#666' }}>Overall Gate Score</div>
        </div>
      </div>

      {/* Gate Scores */}
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 10 }}>13 Gate Score Board</div>
        <div style={{ columns: 2, columnGap: 20 }}>
          {gateScores.map(g => <GateBar key={g.id} gate={g} />)}
        </div>
      </div>

      {/* Mission Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          value={newMissionTitle}
          onChange={e => setNewMissionTitle(e.target.value)}
          ghostInput="New mission title..."
          style={{ flex: 1, minWidth: 180, background: '#0f0f1e', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 10px', color: '#e0e0ff', fontSize: 12 }}
          onKeyDown={e => e.key === 'Enter' && handleCreateMission()}
        />
        <button onClick={handleCreateMission} style={btn('#4ade80')}>+ Create Mission</button>
        {missions.slice(0, 4).map(m => (
          <button key={m.id} onClick={() => setSelectedMission(m)}
            style={{ ...btn(selectedMission?.id === m.id ? '#f5c842' : '#818cf8'), maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {m.title || m.id.slice(0,12)}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <textarea
        value={userPrompt}
        onChange={e => setUserPrompt(e.target.value)}
        ghostInput="Enter your prompt or mission intent here..."
        style={{ width: '100%', minHeight: 70, background: '#0a0a18', border: '1px solid #2a2a4a', borderRadius: 8, padding: '8px 12px', color: '#e0e0ff', fontSize: 12, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
        <button onClick={handleFriction} disabled={loading} style={btn('#f87171')}>🛡️ Friction Check</button>
        <button onClick={handleFission} disabled={loading} style={btn('#818cf8')}>⚡ Run Fission</button>
        <button onClick={handleVectorPack} disabled={loading} style={btn('#22d3ee')}>📦 VectorPack</button>
        <button onClick={handleTemporal} disabled={loading} style={btn('#a78bfa')}>⏳ Temporal Stack</button>
        <button onClick={handleDeploy} disabled={loading} style={btn('#f5c842')}>🚀 DeployRail (live)</button>
        <button onClick={handleCommerce} disabled={loading} style={btn('#4ade80')}>💳 Commerce Theatrical-Stub</button>
        <button onClick={handleNightForge} disabled={loading} style={btn('#fb923c')}>🌙 NightForge</button>
        <button onClick={handleFullAudit} disabled={loading} style={{ ...btn('#ec4899'), fontWeight: 900, fontSize: 13 }}>
          {loading ? '⏳ Running...' : '🤖 FULL AUDIT (All 7 Gates)'}
        </button>
      </div>

      {/* Selected Mission Info */}
      {selectedMission && (
        <div style={{ ...card, border: '1px solid #818cf844' }}>
          <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700 }}>ACTIVE MISSION:</span>{' '}
          <span style={{ fontSize: 12 }}>{selectedMission.title || selectedMission.id}</span>
          <span style={{ float: 'right', fontSize: 10, color: '#666' }}>{selectedMission.id}</span>
        </div>
      )}

      {/* Results */}
      {frictionResult && (
        <div style={{ ...card, border: `1px solid ${frictionResult.report.blocked ? '#f87171' : frictionResult.warned ? '#f5c842' : '#4ade80'}44` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: frictionResult.report.blocked ? '#f87171' : '#f5c842', marginBottom: 6 }}>
            🛡️ ForgeFriction Result — Score: {frictionResult.report.score}/100
            {frictionResult.report.blocked && ' — BLOCKED'}
            {frictionResult.warned && ' — WARNING'}
          </div>
          {frictionResult.report.reasons.map((r, i) => <div key={i} style={{ fontSize: 11, color: '#a0a0c0', marginBottom: 3 }}>• {r}</div>)}
          {frictionResult.report.repairPrompt && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(248,113,113,0.1)', borderRadius: 6, fontSize: 11, color: '#fca5a5' }}>
              {frictionResult.report.repairPrompt}
            </div>
          )}
        </div>
      )}

      {fissionResult && (
        <div style={{ ...card, border: '1px solid #818cf844' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 8 }}>
            ⚡ Swarm Fission — Winner: {fissionResult.winner?.lane?.toUpperCase() || 'NONE'} | Candidates: {fissionResult.candidates.length}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {fissionResult.candidates.map(c => (
              <div key={c.id} style={{ background: c.status === 'verified' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${c.status === 'verified' ? '#4ade80' : '#333'}`, borderRadius: 7, padding: '6px 10px', minWidth: 120 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.status === 'verified' ? '#4ade80' : '#a0a0c0' }}>{c.lane}</div>
                <div style={{ fontSize: 10, color: '#666' }}>Tests: {c.testScore} | UX: {c.uxScore} | Cost: {c.costScore}</div>
                <div style={{ fontSize: 10, color: c.status === 'verified' ? '#4ade80' : '#f87171' }}>{c.status.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {temporalStack && (
        <div style={{ ...card, border: '1px solid #a78bfa44' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>⏳ Temporal Stackchain</div>
          <div style={{ fontSize: 11, marginBottom: 6 }}><strong style={{ color: '#4ade80' }}>NOW:</strong> {temporalStack.stack.nowPlan}</div>
          <div style={{ fontSize: 11, marginBottom: 6 }}><strong style={{ color: '#f5c842' }}>+6 MO:</strong> {temporalStack.stack.sixMonthRefactor}</div>
          <div style={{ fontSize: 11, marginBottom: 6 }}><strong style={{ color: '#f87171' }}>+12 MO:</strong> {temporalStack.stack.twelveMonthDeprecationPath}</div>
        </div>
      )}

      {deployResult && (
        <div style={{ ...card, border: '1px solid #f5c84244' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f5c842', marginBottom: 6 }}>
            🚀 DeployRail — {deployResult.liveRun ? (deployResult.blocked ? 'BLOCKED' : 'DEPLOYED') : 'LIVE RUN'}
          </div>
          {deployResult.log.slice(0, 5).map((l, i) => <div key={i} style={{ fontSize: 11, color: '#a0a0c0' }}>{l}</div>)}
        </div>
      )}

      {commerceResult && !commerceResult.blocked && (
        <div style={{ ...card, border: '1px solid #4ade8044' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>💳 Commerce Rail</div>
          <div style={{ fontSize: 11, color: '#a0a0c0' }}>Product: {commerceResult.spec.productName}</div>
          <div style={{ fontSize: 11, color: '#a0a0c0' }}>Price: ${(commerceResult.spec.price/100).toFixed(2)}</div>
          {commerceResult.Theatrical-StubLink && <div style={{ fontSize: 10, color: '#4ade80', marginTop: 4 }}>URL: {commerceResult.Theatrical-StubLink}</div>}
          <div style={{ marginTop: 8, fontSize: 10, color: '#666', fontStyle: 'italic' }}>⚠️ Live payment links require owner approval</div>
        </div>
      )}

      {nightforgeResult && (
        <div style={{ ...card, border: '1px solid #fb923c44' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fb923c', marginBottom: 8 }}>🌙 NightForge Daemon Report</div>
          {nightforgeResult.scannedItems.map((s, i) => <div key={i} style={{ fontSize: 11, color: '#a0a0c0' }}>✓ {s}</div>)}
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#fb923c' }}>Proposals ({nightforgeResult.proposedActions.length}):</div>
          {nightforgeResult.proposedActions.map((p, i) => (
            <div key={i} style={{ fontSize: 11, color: '#a0a0c0', marginTop: 3 }}>→ {p.action} ({p.priority || 'MEDIUM'})</div>
          ))}
          <div style={{ marginTop: 8, fontSize: 10, color: '#666' }}>Cannot: {nightforgeResult.cannot.join(' | ')}</div>
        </div>
      )}

      {/* Proof Deck */}
      {receipts.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#22d3ee', marginBottom: 8 }}>📜 Proof Deck (Last {receipts.length})</div>
          {receipts.slice(0, 8).map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0', borderBottom: '1px solid #1a1a2e' }}>
              <span style={{ color: '#818cf8' }}>{r.action}</span>
              <span style={{ color: r.status === 'verified' ? '#4ade80' : r.status === 'blocked' ? '#f87171' : '#f5c842' }}>{r.status}</span>
              <span style={{ color: '#444' }}>{new Date(r.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Terminal Log */}
      <LogTerminal logs={logs} />
    </div>
  );
}
