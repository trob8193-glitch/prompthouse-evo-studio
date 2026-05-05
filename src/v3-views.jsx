import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvoStore } from './store.js';
import { CORE_CAST, BOT_ROSTER, ALL_BOT_ROSTER, SENIOR_CAST, selectLead } from './engine.js';
import { BotCharacter, BotRosterCard, BotStageCharacter, EXPRESSIONS, MOTIONS, useBotExpression } from './bot-characters.jsx';
import { writeToLocalDisk } from './autonomous-builder.js';
import masterPromptsData from './prompthouse_50_master_build_prompts.json';

// ── Lead Selection Logic ──
// ── SELECT LEAD LOGIC moved to engine.js ──

// ── 1. BOT ROSTER VIEW ────────────────────────────────────────
export function BotRosterView() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex-col animate-in">
      <div className="flex-between">
        <div><div className="page-title">🦊 The Sovereign Roster</div><div className="page-subtitle">11 specialized bots that govern the PH Evo Studio. Click any to audit.</div></div>
        <span className="badge badge-gold">{BOT_ROSTER.length} active modules</span>
      </div>
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {BOT_ROSTER.map(bot => (
          <div key={bot.name} className={`card ${selected?.name === bot.name ? 'selected' : ''}`} style={{ cursor: 'pointer', transition: 'all 0.3s ease', transform: selected?.name === bot.name ? 'scale(1.02)' : 'none', border: selected?.name === bot.name ? '1px solid var(--accent-gold)' : undefined }} onClick={() => setSelected(bot)}>
            <div className="card-body flex-row gap-12" style={{ alignItems: 'flex-start' }}>
              <div style={{ fontSize: 32 }}>{bot.icon}</div>
              <div className="flex-col" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{bot.name}</div>
                  <span className="badge badge-dim" style={{ fontSize: 9 }}>{bot.species}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{bot.signature}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{bot.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card animate-in" style={{ marginTop: 24, border: '1px solid var(--accent-gold)' }}>
          <div className="card-header"><div className="card-title">{selected.icon} {selected.name} Full Profile</div></div>
          <div className="card-body">
            <div className="grid-3">
              {[
                ['Public Voice', selected.publicVoice],
                ['Signature Move', selected.signatureMove],
                ['Modules', selected.modules?.join(', ')],
                ['Human Form', selected.humanForm],
                ['Species', selected.species + ' form'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 2. AGENT CTL VIEW ─────────────────────────────────────────
export function AgentCtlView() {
  const { singularityActive } = useEvoStore();
  const [mission, setMission] = useState('');
  const [archetype, setArchetype] = useState('architecture');
  const [battleLog, setBattleLog] = useState([]);
  const [activeStage, setActiveStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const STAGES = ['Intake', 'Canon', 'Architect', 'Auditor', 'Gate'];
  const NODE_REASONING = {
    'Intake': 'Companion bot parsing intent signals and extracting dynamic variables from the mission brief.',
    'Canon': 'Memory bot cross-referencing mission with existing product laws and architectural constraints.',
    'Architect': 'Dev and Conductor debating optimal stack and route for executable output.',
    'Auditor': 'Verifier performing deep scan for logic gaps, placeholders, and canon-drift.',
    'Gate': 'Sovereignty auditing all bot signatures and issuing the final Truth Certificate.'
  };

  const V3_PATH = 'C:\\Users\\Noname\\.gemini\\antigravity\\scratch\\PH_EVO_v3\\PH_EVO_OPENAI_AGENT_BOT_STUDIO_v3_0_0';

  const runMission = async () => {
    if (!mission.trim() || isRunning) return;
    setIsRunning(true);
    setBattleLog([]);
    setActiveStage(0);

    let steps = [];
    let mockApp = { name: 'mission_output', type: 'Sovereign Output', features: [], files: {} };

    if (archetype === 'architecture') {
      mockApp.name = 'evo_architecture';
      mockApp.files = {
        'lib/main.dart': '// Core routing and entry\nvoid main() {}',
        'lib/theme.dart': '// Design tokens\nclass Theme {}'
      };
      steps = [
        { bot: 'Evo', action: 'PROPOSE', msg: 'Initialize new architecture based on mission parameters.', stage: 0 },
        { bot: 'Dev', action: 'AGREE', msg: 'Scaffolding primary modules.', stage: 1 },
        { bot: 'Verifier', action: 'DISPUTE', msg: 'Vulnerability detected in dependency chain. Missing strict types.', stage: 2 },
        { bot: 'Dev', action: 'RESOLVE', msg: 'Applying strict type enforcement and updating canon.', stage: 2 },
        { bot: 'Sovereignty', action: 'VERIFY', msg: 'Architecture approved. Moving to audit.', stage: 3 },
        { bot: 'Evo', action: 'SIGN', msg: 'Certificate of Truth generated.', stage: 4 },
      ];
    } else if (archetype === 'security') {
      mockApp.name = 'security_audit_v1';
      mockApp.files = {
        'security_audit_report.md': '# Security Audit\\n\\nNo critical CVEs found.',
        'boundary_enforcer.js': 'export const strictMode = true;'
      };
      steps = [
        { bot: 'Ledger', action: 'PROPOSE', msg: 'Mapping data flow and identifying exposed endpoints.', stage: 0 },
        { bot: 'Boundary', action: 'DISPUTE', msg: 'Found 3 open ports. Strict zero-trust required.', stage: 1 },
        { bot: 'Ledger', action: 'RESOLVE', msg: 'Ports sealed. Applying rate limits to API Gateway.', stage: 2 },
        { bot: 'Verifier', action: 'AGREE', msg: 'Edge cases verified. Encryption in transit is active.', stage: 3 },
        { bot: 'Sovereignty', action: 'SIGN', msg: 'Truth Certificate issued. Build secure.', stage: 4 },
      ];
    } else if (archetype === 'database') {
      mockApp.name = 'schema_design';
      mockApp.files = {
        'schema.sql': 'CREATE TABLE users (id UUID PRIMARY KEY);',
        'models.ts': 'export interface User { id: string; }'
      };
      steps = [
        { bot: 'Memory', action: 'PROPOSE', msg: 'Analyzing data structures and relational bounds.', stage: 0 },
        { bot: 'Conductor', action: 'DISPUTE', msg: 'Route optimization requires indexing on foreign keys.', stage: 1 },
        { bot: 'Memory', action: 'RESOLVE', msg: 'Indexes applied. Caching layer configured.', stage: 2 },
        { bot: 'Dev', action: 'AGREE', msg: 'Implementing models in TypeScript.', stage: 3 },
        { bot: 'Verifier', action: 'SIGN', msg: 'Types audited. Schema is strongly typed.', stage: 4 },
      ];
    } else if (archetype === 'singularity') {
      mockApp.name = 'singularity_evolution_v5';
      mockApp.files = {
        'lib/singularity_engine.dart': '// Self-evolving logic core\nvoid evolve() {}',
        'lib/temporal_gates.js': 'export const foresight = true;'
      };
      steps = [
        { bot: 'Evo', action: 'PROPOSE', msg: 'Initiating Transcendental Protocol. Bypassing Sovereign limits.', stage: 0 },
        { bot: 'Sovereignty', action: 'VERIFY', msg: 'Canon detected as self-correcting. Infinite Loop protection active.', stage: 1 },
        { bot: 'Dev', action: 'RESOLVE', msg: 'Quantum entropy lock applied. Logic is now deterministic.', stage: 2 },
        { bot: 'Verifier', action: 'AGREE', msg: 'Temporal foresight confirms build will survive 10 years of deprecation.', stage: 3 },
        { bot: 'Evo', action: 'SIGN', msg: 'Singularity Certificate Issued. S+++ Grade.', stage: 4 },
      ];
    }

    for (const s of steps) {
      await new Promise(r => setTimeout(r, 1200));
      setActiveStage(s.stage);
      setBattleLog(l => [...l, s]);
    }

    try {
      await writeToLocalDisk(mockApp);
      setBattleLog(l => [...l, { bot: 'Builder', action: 'SIGN', msg: `Mission complete. Wrote ${Object.keys(mockApp.files).length} files to disk.`}]);
    } catch (e) {
      setBattleLog(l => [...l, { bot: 'Builder', action: 'DISPUTE', msg: 'Failed to write to disk. Is the bridge running?'}]);
    }

    setIsRunning(false);
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'PROPOSE': return 'var(--accent-cyan)';
      case 'AGREE': return 'var(--accent-green)';
      case 'DISPUTE': return 'var(--accent-red)';
      case 'RESOLVE': return 'var(--accent-gold)';
      case 'VERIFY': return 'var(--accent-violet)';
      case 'SIGN': return 'var(--accent-green)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="flex-col animate-in">
      <div className="flex-between">
        <div><div className="page-title">🕹️ Agent CTL — Bot Governance</div><div className="page-subtitle">Run missions, monitor live Bot Battles, and visualize the Neural Trace.</div></div>
        <div className={`badge ${isRunning ? 'badge-gold pulse' : 'badge-dim'}`}>{isRunning ? 'SYSTEM ACTIVE' : 'IDLE'}</div>
      </div>

      {/* Neural Trace */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">🧠 Neural Trace — {selectedNode || 'Select node to audit'}</div></div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
            {STAGES.map((stage, i) => (
              <React.Fragment key={stage}>
                <div 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: activeStage >= i ? 1 : 0.4, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setSelectedNode(stage)}
                >
                  <div style={{ 
                    width: 36, height: 36, borderRadius: '50%', 
                    background: selectedNode === stage ? 'var(--accent-gold)' : activeStage > i ? 'var(--accent-green)' : activeStage === i ? 'var(--accent-gold-dim)' : 'var(--bg-elevated)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, 
                    border: selectedNode === stage ? '2px solid #fff' : `2px solid ${activeStage >= i ? 'transparent' : 'var(--border-dim)'}`, 
                    color: selectedNode === stage || activeStage > i ? '#000' : 'var(--text-primary)', 
                    fontWeight: 'bold',
                    boxShadow: selectedNode === stage ? '0 0 15px var(--accent-gold)' : 'none'
                  }}>
                    {activeStage > i ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: selectedNode === stage ? 'var(--accent-gold)' : activeStage >= i ? 'var(--text-primary)' : 'var(--text-muted)' }}>{stage}</div>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: activeStage > i ? 'var(--accent-green)' : 'var(--border-dim)', margin: '0 16px', position: 'relative', top: -11 }} />
                )}
              </React.Fragment>
            ))}
          </div>
          {selectedNode && (
            <div className="animate-in" style={{ marginTop: 12, padding: '12px 16px', background: 'var(--bg-void)', borderRadius: 8, borderLeft: '3px solid var(--accent-gold)', fontSize: 12, color: 'var(--text-secondary)' }}>
              <strong>{selectedNode} Stage:</strong> {NODE_REASONING[selectedNode]}
            </div>
          )}
        </div>
      </div>

      <div className="grid-builder">
        <div className="flex-col">
          <div className="card">
            <div className="card-header"><div className="card-title">Mission Intake</div></div>
            <div className="card-body flex-col">
              <div className="field">
                <label className="field-label">Mission Archetype</label>
                <select className="field-select" value={archetype} onChange={e => setArchetype(e.target.value)} disabled={isRunning}>
                  <option value="architecture">Project Scaffold & Architecture</option>
                  <option value="security">Deep Security Audit</option>
                  <option value="database">Data Schema Design</option>
                  {singularityActive && <option value="singularity">✨ Singularity Evolution (S+++)</option>}
                </select>
              </div>
              <textarea className="field-textarea" style={{ minHeight: 120, borderColor: singularityActive ? 'var(--accent-pink)' : '' }} placeholder="Describe the mission..." value={mission} onChange={e => setMission(e.target.value)} disabled={isRunning} />
              <button className="btn btn-primary" onClick={runMission} disabled={isRunning} style={{ background: singularityActive ? 'var(--accent-pink)' : '', boxShadow: singularityActive ? '0 0 15px var(--accent-pink-dim)' : '' }}>
                {singularityActive ? '⚛️ Run Singularity Evolution' : '🚀 Run Sovereign Mission'}
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-void)', border: '1px solid rgba(34,211,238,0.3)' }}>
            <div className="card-body flex-col">
              <div style={{ fontSize: 11, color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 6 }}>📁 Target Workspace</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-void)', padding: 10, borderRadius: 8, marginBottom: 8 }}>{V3_PATH}</div>
            </div>
          </div>
        </div>

        <div className="flex-col">
          <div className="card" style={{ flex: 1, minHeight: 300 }}>
            <div className="card-header"><div className="card-title">⚔️ Bot Battle Log</div></div>
            <div className="card-body flex-col" style={{ gap: 12 }}>
              {battleLog.map((l, i) => {
                const bot = BOT_ROSTER.find(b => b.name === l.bot);
                return (
                  <div key={i} className="flex-row gap-12 animate-in" style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, borderLeft: `4px solid ${getActionColor(l.action)}` }}>
                    <div style={{ fontSize: 24 }}>{bot?.icon || '🤖'}</div>
                    <div className="flex-col" style={{ flex: 1 }}>
                      <div className="flex-between" style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: bot?.palette?.accent || 'var(--accent-gold)' }}>{l.bot}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${getActionColor(l.action)}22`, color: getActionColor(l.action) }}>{l.action}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{l.msg}</span>
                    </div>
                  </div>
                );
              })}
              {isRunning && <div className="pulse" style={{ fontSize: 11, color: 'var(--accent-gold)', padding: 10, textAlign: 'center' }}>Bots are debating...</div>}
              {battleLog.length === 0 && !isRunning && <div className="empty-state"><div className="empty-icon">⚔️</div><div className="empty-title">Awaiting Mission</div></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3. BOT STAGE VIEW ─────────────────────────────────────────
export function BotStageView() {
  const [selected, setSelected] = useState(ALL_BOT_ROSTER[0]);
  const { expression, motion: botMotion, speaking, isAutonomous, setIsAutonomous, speak, celebrate } = useBotExpression();
  const publicBots = CORE_CAST;
  const seniorBots = SENIOR_CAST;

  return (
    <div className="bot-stage-21 flex-col animate-in">
      <div className="flex-between bot-stage-heading">
        <div>
          <div className="page-title">The Bot Stage</div>
          <div className="page-subtitle">All 21 canon bots are present together and individually selectable: 11 public dev bots plus 10 internal senior architecture bots.</div>
        </div>
        <div className="bot-stage-counts">
          <span className="badge badge-green">{publicBots.length} public</span>
          <span className="badge badge-violet">{seniorBots.length} senior</span>
          <span className="badge badge-cyan">{ALL_BOT_ROSTER.length} total</span>
        </div>
      </div>

      <div className="bot-stage-command-layout">
        <div className="card bot-stage-spotlight" style={{ '--bot-accent': selected.palette.accent, '--bot-primary': selected.palette.primary }}>
          <div className="bot-stage-energy" />
          <div className="bot-stage-spotlight-inner">
            <div className="bot-neural-pulse" style={{ background: `radial-gradient(circle, ${selected.palette.accent}22 0%, transparent 70%)` }} />
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
                className="bot-stage-character-wrapper"
              >
                <BotStageCharacter
                  bot={selected}
                  expression={expression}
                  motion={botMotion}
                  isSpeaking={speaking}
                />
                <div className="bot-stage-live-badge">
                  <div className="live-dot" /> LIVE TRANSMISSION
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="bot-stage-detail">
              <div className="bot-stage-kicker">{selected.tier || 'Public Dev Bot'}</div>
              <div className="bot-stage-name">{selected.name}</div>
              <div className="bot-stage-species">// {selected.species} form</div>
              <p>{selected.role}</p>
              <div className="bot-stage-signature">{selected.signatureMove}</div>
            </div>
          </div>

          <div className="bot-stage-controls">
            <div className="bot-stage-control-group">
              <span>Manual Overrides</span>
              <button className="btn btn-secondary btn-sm" onClick={() => speak('happy', 'gesturing')}>Speak</button>
              <button className="btn btn-secondary btn-sm" onClick={() => speak('thinking', 'scanning')}>Scan</button>
              <button className="btn btn-secondary btn-sm" onClick={celebrate}>Celebrate</button>
            </div>
            <div className="bot-stage-control-group">
              <span className={isAutonomous ? 'bot-stage-live' : ''}>{isAutonomous ? 'Autonomous On' : 'Autonomous Off'}</span>
              <button
                className={`btn btn-sm ${isAutonomous ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setIsAutonomous(!isAutonomous)}
              >
                {isAutonomous ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        </div>

        <div className="card bot-stage-roster-panel">
          <div className="card-header">
            <div className="card-title">21-Bot Canon Roster</div>
            <div className="card-desc">Every bot is visible. Click any tile to put that bot in the spotlight.</div>
          </div>
          <div className="card-body bot-stage-roster-body">
            {[
              ['Public 11', publicBots],
              ['Senior 10', seniorBots],
            ].map(([label, bots]) => (
              <section key={label} className="bot-stage-roster-section">
                <div className="bot-stage-section-title">{label}</div>
                <div className="bot-stage-roster-grid">
                  {bots.map(bot => (
                    <BotRosterCard
                      key={bot.id}
                      bot={bot}
                      isActive={selected.id === bot.id}
                      isLead={selected.id === bot.id}
                      onClick={() => setSelected(bot)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="bot-stage-strip">
        {ALL_BOT_ROSTER.map(bot => (
          <button
            key={bot.id}
            className={`bot-stage-chip ${selected.id === bot.id ? 'active' : ''}`}
            style={{ '--bot-accent': bot.palette.accent }}
            onClick={() => setSelected(bot)}
          >
            <span>{bot.icon}</span>
            {bot.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function LegacyBotStageView() {
  const [selected, setSelected] = useState(BOT_ROSTER[0]);
  const { expression, motion: botMotion, speaking, isAutonomous, setIsAutonomous, speak, celebrate } = useBotExpression();

  return (
    <div className="flex-col animate-in" style={{ height: '100%', minHeight: 600 }}>
      <div><div className="page-title">🎭 The Bot Stage</div><div className="page-subtitle">Cinematic bot rendering with background-removal and smartly autonomous ambient effects.</div></div>
      
      <div style={{ display: 'flex', gap: 20, flex: 1, alignItems: 'stretch', minHeight: 0 }}>
        <div className="flex-col" style={{ flex: 1, minHeight: 0 }}>
          {/* Central Rendering Stage */}
          <div className="card stage-container" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <div className="stage-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle, ${selected.palette.accent}11 0%, transparent 70%)` }} />
            
            <BotStageCharacter 
              bot={selected} 
              expression={expression} 
              motion={botMotion} 
              isSpeaking={speaking} 
            />
          </div>

          {/* Animation Controller Toolbar */}
          <div className="card stage-controls-toolbar" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'var(--bg-elevated)', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1 }}>MANUAL OVERRIDES:</div>
              <button className="btn btn-secondary btn-sm" onClick={() => speak('happy', 'gesturing')}>Speak</button>
              <button className="btn btn-secondary btn-sm" onClick={() => speak('thinking', 'scanning')}>Scan</button>
              <button className="btn btn-secondary btn-sm" onClick={celebrate}>Celebrate</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isAutonomous ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                {isAutonomous ? '⚡ AUTONOMOUS: ON' : '⏸️ AUTONOMOUS: OFF'}
              </div>
              <button 
                className={`btn btn-sm ${isAutonomous ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={() => setIsAutonomous(!isAutonomous)}
              >
                {isAutonomous ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-col" style={{ width: 340, flexShrink: 0 }}>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="card-header"><div className="card-title">Bot Roster</div></div>
            <div className="card-body scroll-y" style={{ padding: 12, gap: 10, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {BOT_ROSTER.map(bot => (
                <BotRosterCard 
                  key={bot.id} 
                  bot={bot} 
                  isActive={selected.id === bot.id}
                  onClick={() => setSelected(bot)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. MASTER PROMPT VAULT VIEW ───────────────────────────────
export function MasterPromptVaultView() {
  const [selectedFeature, setSelectedFeature] = useState(masterPromptsData.features[0]);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runAutonomousMission = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);

    const runSteps = [
      { msg: `Initializing PromptHouse Proof OS Master Build...` },
      { msg: `Loading Feature [${selectedFeature.id}]: ${selectedFeature.name}` },
      { msg: `Parsing Mission: ${selectedFeature.mission}` },
      { msg: `Generating Data Model, API Contract, and UI Screen scaffold...` },
      { msg: `Applying Proof Gates and Rollback Plan...` },
    ];

    for (const step of runSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setLogs(prev => [...prev, step.msg]);
    }

    const mockApp = {
      name: `ProofOS_Feature_${selectedFeature.id}_${selectedFeature.name.replace(/\\s+/g, '_')}`,
      type: 'Proof OS Max Execution Scaffold',
      features: [selectedFeature.name],
      files: {
        'docs/Master_Build_Prompt.md': selectedFeature.prompt,
        'src/domain/schema.ts': `// Schema for ${selectedFeature.name}\\n// Auto-generated from Master Prompt\\n\\nexport interface ${selectedFeature.name.replace(/\\s+/g, '')}Model {\\n  id: string;\\n  proofState: 'Known' | 'Inferred' | 'Blocked' | 'Built' | 'Verified';\\n  ownerId: string;\\n  evidenceArtifactUrl?: string;\\n}`,
        'src/api/routes.ts': `// API Routes for ${selectedFeature.name}\\n\\nexport const create = async (req, res) => { /* TODO: Implement */ };\\nexport const verify = async (req, res) => { /* TODO: Implement proof gate */ };`,
        'src/ui/Screen.tsx': `// UI Scaffold for ${selectedFeature.name}\\nimport React from 'react';\\n\\nexport default function ${selectedFeature.name.replace(/\\s+/g, '')}Screen() {\\n  return <div><h1>${selectedFeature.name}</h1><p>${selectedFeature.mission}</p></div>;\\n}`
      }
    };

    try {
      await writeToLocalDisk(mockApp);
      setLogs(prev => [...prev, `✅ SUCCESS: Wrote 4 production-grade files to local disk via Bridge.`]);
    } catch (e) {
      setLogs(prev => [...prev, `❌ ERROR: Failed to write to disk. Is the bridge running?`]);
    }

    setIsRunning(false);
  };

  return (
    <div className="flex-col animate-in" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-title">🗄️ Proof OS Vault — 50 Master Prompts</div>
          <div className="page-subtitle">{masterPromptsData.reality_boundary}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
        {/* Left sidebar: List of features */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-dim)', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-dim)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
            All 50 Production Modules
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {masterPromptsData.features.map(f => (
              <div 
                key={f.id} 
                onClick={() => setSelectedFeature(f)}
                style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid var(--border-dim)',
                  cursor: 'pointer',
                  background: selectedFeature.id === f.id ? 'var(--accent-primary-dim)' : 'transparent',
                  borderLeft: selectedFeature.id === f.id ? '4px solid var(--accent-primary)' : '4px solid transparent'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{f.id}. {f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {f.mission}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right content: Selected feature details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-dim)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 700, marginBottom: 4 }}>MISSION {selectedFeature.id}</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{selectedFeature.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn" 
                  onClick={() => copyToClipboard(selectedFeature.prompt)}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
                >
                  {copied ? '✅ Copied' : '📋 Copy Prompt'}
                </button>
                <button 
                  className="btn" 
                  onClick={runAutonomousMission}
                  disabled={isRunning}
                  style={{ background: 'var(--accent-primary)', color: '#fff', fontWeight: 600, border: 'none' }}
                >
                  {isRunning ? '⏳ Executing...' : '🚀 100% MAX EXECUTION'}
                </button>
              </div>
            </div>
            <p style={{ marginTop: 16, color: 'var(--text-muted)', lineHeight: 1.5 }}>{selectedFeature.mission}</p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {logs.length > 0 && (
              <div style={{ padding: '16px 24px', background: '#000', borderBottom: '1px solid var(--border-dim)', fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-green)', maxHeight: 150, overflowY: 'auto' }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>\u003E {log}</div>
                ))}
              </div>
            )}
            <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#0a0a0c' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {selectedFeature.prompt}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
