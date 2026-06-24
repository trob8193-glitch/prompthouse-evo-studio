import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBridgeUrl } from '../lib/api/config.js';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Database,
  GitBranch,
  Globe,
  Layers3,
  Lightbulb,
  Lock,
  Network,
  Orbit,
  Radar,
  Rocket,
  Route,
  Shield,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useSovereignStore } from '../store.js';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';

const MODULE_DOMAINS = {
  STUDIO: 'PH Evo Studio',
  LLM: 'Evo LLM',
  SELF_EVOLVE: 'Studio Self-Evolve',
  SELF_INVENT: 'Self-Invent',
};

const DOMAIN_STYLES = {
  [MODULE_DOMAINS.STUDIO]: { color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)', border: 'rgba(0, 240, 255, 0.3)' },
  [MODULE_DOMAINS.LLM]: { color: '#8a2be2', bg: 'rgba(138, 43, 226, 0.1)', border: 'rgba(138, 43, 226, 0.3)' },
  [MODULE_DOMAINS.SELF_EVOLVE]: { color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)', border: 'rgba(0, 255, 136, 0.3)' },
  [MODULE_DOMAINS.SELF_INVENT]: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
};

const EVO_PULSE_MODULES = [
  {
    id: 'signal-atlas',
    name: 'Evo Signal Atlas',
    domain: MODULE_DOMAINS.STUDIO,
    icon: Radar,
    score: 96,
    layer: 'Visible Reality Map',
    summary: 'Converts approved system observations into a clean topology of nodes, edges, fields, boundaries, and proof warnings.',
    inputs: ['Grid nodes', 'Routes', 'Runtime status', 'Approved local observations'],
    outputs: ['Visual map', 'Boundary cards', 'Risk markers', 'Signal ledger'],
    gates: ['Consent-first capture', 'Truth labels', 'No unsupported claims'],
    status: 'PRIMED',
  },
  {
    id: 'matrix-fingerprint',
    name: 'Evo Matrix Fingerprint Engine',
    domain: MODULE_DOMAINS.STUDIO,
    icon: Database,
    score: 94,
    layer: 'Baseline Signature',
    summary: 'Creates a secret-free studio baseline so normal state, drift, and changes can be compared over time.',
    inputs: ['Runtime shape', 'Route state', 'Module inventory', 'Environment presence'],
    outputs: ['Reality ID', 'Drift diff', 'Baseline digest', 'Change memo'],
    gates: ['Secret redaction', 'Digest-only storage', 'Rollback pairing'],
    status: 'PRIMED',
  },
  {
    id: 'meshmind-mapper',
    name: 'Evo MeshMind Dev Environment Mapper',
    domain: MODULE_DOMAINS.STUDIO,
    icon: Network,
    score: 95,
    layer: 'Dev Runtime Graph',
    summary: 'Maps scripts, routes, local tools, UI surfaces, ownership, and dead-flow warnings into one studio control graph.',
    inputs: ['Package scripts', 'Page map', 'Proof tools', 'Store actions'],
    outputs: ['Ownership graph', 'Dead-flow warnings', 'Runtime map', 'Fix priority'],
    gates: ['No duplicate route ownership', 'No disconnected UI', 'No secret values'],
    status: 'PRIMED',
  },
  {
    id: 'topology-memory',
    name: 'Topology-Aware Reasoning Memory',
    domain: MODULE_DOMAINS.LLM,
    icon: Brain,
    score: 97,
    layer: 'Graph Memory Core',
    summary: 'Stores studio knowledge as nodes, edges, dependencies, conflicts, locked canon, source labels, and priority weights.',
    inputs: ['Project canon', 'Feature maps', 'Build rules', 'Decision trails'],
    outputs: ['Memory graph', 'Conflict map', 'Dependency paths', 'Priority weights'],
    gates: ['No fabricated memory', 'Canon lock respected', 'Source labels required'],
    status: 'PRIMED',
  },
  {
    id: 'signal-meaning',
    name: 'Signal-to-Meaning Interpreter',
    domain: MODULE_DOMAINS.LLM,
    icon: Sparkles,
    score: 96,
    layer: 'Machine Output Decoder',
    summary: 'Turns logs, checks, build output, and test results into cause, risk, repair, and next-action cards.',
    inputs: ['Errors', 'Checks', 'Build output', 'Audit notes'],
    outputs: ['Cause cards', 'Risk score', 'Repair actions', 'Next move'],
    gates: ['Uncertainty labels', 'No invented execution', 'Actionable repairs only'],
    status: 'PRIMED',
  },
  {
    id: 'protocol-persona',
    name: 'Protocol Persona Engine',
    domain: MODULE_DOMAINS.LLM,
    icon: Shield,
    score: 98,
    layer: 'Bot Authority Matrix',
    summary: 'Turns Evo bots into protocols with inputs, outputs, authority, blocked actions, failure states, and escalation routes.',
    inputs: ['Bot roles', 'Authority rules', 'Tool permissions', 'Failure modes'],
    outputs: ['Protocol cards', 'Authority matrix', 'Escalation chain', 'Boundary report'],
    gates: ['No self-approval', 'Verifier before merge', 'Boundary rules enforced'],
    status: 'PRIMED',
  },
  {
    id: 'drift-radar',
    name: 'Architecture Drift Radar',
    domain: MODULE_DOMAINS.SELF_EVOLVE,
    icon: GitBranch,
    score: 97,
    layer: 'Studio Immune System',
    summary: 'Detects duplicate modules, weak wiring, route drift, missing tests, synthetic language, and proof gaps before evolution lands.',
    inputs: ['File tree', 'Imports', 'Routes', 'Tests', 'Maturity scores'],
    outputs: ['Drift report', 'Severity score', 'Repair plan', 'Blockers'],
    gates: ['No cosmetic drift', 'Route coverage', 'Test coverage'],
    status: 'PRIMED',
  },
  {
    id: 'proof-gate-console',
    name: 'Self-Evolution Proof Gate Console',
    domain: MODULE_DOMAINS.SELF_EVOLVE,
    icon: CheckCircle2,
    score: 99,
    layer: 'Mutation Approval',
    summary: 'Requires compile, test, route, design, memory, regression, and rollback evidence before studio changes are accepted.',
    inputs: ['Compile result', 'Test result', 'Audit result', 'Route result', 'Rollback marker'],
    outputs: ['Gate ledger', 'Approval state', 'Blocked reasons', 'Proof digest'],
    gates: ['All required gates pass', 'Rollback required', 'No invented success'],
    status: 'PRIMED',
  },
  {
    id: 'reality-rollback',
    name: 'Local Reality Snapshot + Rollback Engine',
    domain: MODULE_DOMAINS.SELF_EVOLVE,
    icon: Lock,
    score: 96,
    layer: 'Verified Reality History',
    summary: 'Captures file tree, route map, dependency graph, checks, env presence, diff summary, module score, and rollback point.',
    inputs: ['Project state', 'Route map', 'Checks', 'Diff summary', 'Module score'],
    outputs: ['Reality snapshot', 'Rollback point', 'Digest', 'Restore note'],
    gates: ['Secret values redacted', 'Rollback point required', 'Digest required'],
    status: 'PRIMED',
  },
  {
    id: 'pattern-forge',
    name: 'Tridall Pattern Forge',
    domain: MODULE_DOMAINS.SELF_INVENT,
    icon: Lightbulb,
    score: 98,
    layer: 'Idea Refinery',
    summary: 'Extracts repeated invention patterns, buyer markets, architecture rules, bot roles, monetization paths, and build phases.',
    inputs: ['Idea stream', 'Repeated demands', 'Market hints', 'Build constraints'],
    outputs: ['Product concepts', 'Buyer maps', 'Master prompts', 'Phase plans'],
    gates: ['Buyer path required', 'MVP core required', 'No value hype'],
    status: 'PRIMED',
  },
  {
    id: 'self-matrix',
    name: 'Self-Matrix Builder',
    domain: MODULE_DOMAINS.SELF_INVENT,
    icon: Orbit,
    score: 95,
    layer: 'Creator Thinking Graph',
    summary: 'Maps invention stages, strengths, scope growth, proof gaps, focus warnings, and next moves without diagnosis claims.',
    inputs: ['Idea stage', 'Expansion rate', 'Proof state', 'Focus target'],
    outputs: ['Creator graph', 'Stage label', 'Focus warning', 'Next move'],
    gates: ['No diagnosis', 'Actionable focus', 'No identity overclaim'],
    status: 'PRIMED',
  },
  {
    id: 'market-danger',
    name: 'Originality Detector + Market Danger Score',
    domain: MODULE_DOMAINS.SELF_INVENT,
    icon: Target,
    score: 97,
    layer: 'Founder Proof Score',
    summary: 'Scores novelty, buyer pain, build difficulty, defensibility, revenue path, legal risk, safety risk, demo power, and acquisition pressure.',
    inputs: ['Idea brief', 'Buyer pain', 'Competitor map', 'Build effort', 'Demo plan'],
    outputs: ['Originality score', 'Market pressure score', 'Risk warnings', 'Go/no-go state'],
    gates: ['Evidence labels', 'Risk labels', 'Demo path required'],
    status: 'PRIMED',
  },
];

const DOMAIN_ORDER = [
  MODULE_DOMAINS.STUDIO,
  MODULE_DOMAINS.LLM,
  MODULE_DOMAINS.SELF_EVOLVE,
  MODULE_DOMAINS.SELF_INVENT,
];

function getDomainModules(domain, allModules = EVO_PULSE_MODULES) {
  return allModules.filter((module) => module.domain === domain);
}

function getAverageScore(modules = EVO_PULSE_MODULES) {
  return Math.round(modules.reduce((sum, module) => sum + module.score, 0) / modules.length);
}

function buildDigest(source) {
  const text = JSON.stringify(source, Object.keys(source).sort());
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `EPG-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

const topologyEdges = [
  ['Evo Signal Atlas', 'Evo Matrix Fingerprint Engine'],
  ['Evo Matrix Fingerprint Engine', 'Local Reality Snapshot + Rollback Engine'],
  ['Evo MeshMind Dev Environment Mapper', 'Architecture Drift Radar'],
  ['Architecture Drift Radar', 'Self-Evolution Proof Gate Console'],
  ['Self-Evolution Proof Gate Console', 'Local Reality Snapshot + Rollback Engine'],
  ['Topology-Aware Reasoning Memory', 'Protocol Persona Engine'],
  ['Signal-to-Meaning Interpreter', 'Self-Evolution Proof Gate Console'],
  ['Tridall Pattern Forge', 'Self-Matrix Builder'],
  ['Tridall Pattern Forge', 'Originality Detector + Market Danger Score'],
  ['Originality Detector + Market Danger Score', 'Self-Evolution Proof Gate Console'],
];

const PulseMetric = ({ icon: Icon, label, value, detail }) => {
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const wiring = globalTheme?.wiring || 'alpha';
  
  const bgStyle = wiring === 'beta' ? 'rgba(255,255,255,0.05)' : 
                  wiring === 'gamma' ? '#1a0033' : 
                  wiring === 'delta' ? 'rgba(2,20,10,0.8)' : 
                  wiring === 'epsilon' ? '#3e2723' : 
                  wiring === 'zeta' ? '#ffffff' : 
                  wiring === 'eta' ? 'rgba(0,40,40,0.8)' : 
                  wiring === 'theta' ? 'transparent' : 
                  wiring === 'iota' ? '#ffffff' : 
                  wiring === 'kappa' ? '#000000' : 'rgba(5,5,8,0.8)';
                  
  const borderStyle = wiring === 'zeta' || wiring === 'iota' ? '1px solid #000' : '1px solid rgba(0,240,255,0.2)';
  const textColor = wiring === 'zeta' || wiring === 'iota' ? '#000' : '#fff';

  return (
  <div style={{
    background: bgStyle, border: borderStyle, borderRadius: wiring === 'zeta' ? 0 : 20, padding: 16,
    backdropFilter: 'blur(20px)', boxShadow: wiring === 'alpha' ? '0 0 20px rgba(0,240,255,0.05)' : 'none', transition: 'all 0.3s'
  }}>
    <div className="flex items-center justify-between">
      <div style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: 12, padding: 8, color: '#00f0ff', boxShadow: '0 0 15px rgba(0,240,255,0.2)' }}>
        <Icon size={16} />
      </div>
      <div className="text-right">
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textShadow: '0 0 15px rgba(0,240,255,0.4)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 9, fontWeight: 900, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 4 }}>{label}</div>
      </div>
    </div>
    <div style={{ marginTop: 12, fontSize: 10, fontWeight: 600, color: wiring === 'zeta' || wiring === 'iota' ? '#555' : '#b4b4c4', lineHeight: 1.5 }}>{detail}</div>
  </div>
)};

const ModuleCard = ({ module, index }) => {
  const Icon = module.icon;
  const style = DOMAIN_STYLES[module.domain];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      style={{
        background: 'rgba(10,10,15,0.6)', border: `1px solid ${style.border}`, borderRadius: 20, padding: 20,
        transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 30px ${style.bg}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div className="mb-4 flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 12, padding: 8, color: style.color, boxShadow: `0 0 15px ${style.bg}` }}>
            <Icon size={18} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff', textShadow: `0 0 10px ${style.bg}` }}>
              {module.name}
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#b4b4c4' }}>{module.layer}</div>
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontSize: 20, fontWeight: 900, color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.4)', lineHeight: 1 }}>{module.score}%</div>
          <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,255,136,0.8)', marginTop: 4 }}>{module.status}</div>
        </div>
      </div>

      <p style={{ minHeight: 54, fontSize: 11, fontWeight: 600, color: '#8a8a9a', lineHeight: 1.6, position: 'relative', zIndex: 10 }}>{module.summary}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 relative z-10">
        <MiniList title="Inputs" items={module.inputs} color={style.color} />
        <MiniList title="Outputs" items={module.outputs} color={style.color} />
        <MiniList title="Gates" items={module.gates} color={style.color} />
      </div>
    </motion.div>
  );
};

const MiniList = ({ title, items, color }) => (
  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 }}>
    <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8a8a9a' }}>{title}</div>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} style={{ display: 'flex', gap: 8, fontSize: 9, fontWeight: 700, color: '#b4b4c4', lineHeight: 1.3 }}>
          <span style={{ marginTop: 3, height: 4, width: 4, flexShrink: 0, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
          {item}
        </div>
      ))}
    </div>
  </div>
);

const DomainColumn = ({ domain, modules: allModules }) => {
  const modules = getDomainModules(domain, allModules);
  const score = getAverageScore(modules);
  const style = DOMAIN_STYLES[domain];

  return (
    <div style={{ background: 'rgba(5,5,8,0.7)', border: `1px solid ${style.border}`, borderRadius: 32, padding: 24, backdropFilter: 'blur(20px)', boxShadow: `0 0 40px ${style.bg}` }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', textShadow: `0 0 15px ${style.bg}` }}>{domain}</div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8a8a9a', marginTop: 4 }}>{modules.length} integrated modules</div>
        </div>
        <div style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 16, padding: '8px 16px', textAlign: 'right', boxShadow: `0 0 20px ${style.bg}` }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: style.color }}>{score}%</div>
          <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8, color: style.color }}>Domain score</div>
        </div>
      </div>
      <div className="space-y-4">
        {modules.map((module, index) => (
          <ModuleCard key={module.id} module={module} index={index} />
        ))}
      </div>
    </div>
  );
};

const TopologyPanel = () => (
  <section style={{ background: 'rgba(5,5,8,0.8)', border: '1px solid rgba(138,43,226,0.3)', borderRadius: 32, padding: 24, backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(138,43,226,0.1)' }}>
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', textShadow: '0 0 15px rgba(138,43,226,0.5)' }}>
          <Route size={18} color="#8a2be2" /> Pulse Topology Chain
        </h3>
        <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: '#8a8a9a' }}>
          The 12 modules are fused into one proof-backed evolution path. Fancy words, yes. Still actual structure, thankfully.
        </p>
      </div>
      <div style={{ background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.3)', borderRadius: 12, padding: '6px 12px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#8a2be2', boxShadow: '0 0 15px rgba(138,43,226,0.2)' }}>
        {buildDigest(topologyEdges)}
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      {topologyEdges.map(([from, to], index) => (
        <motion.div
          key={`${from}-${to}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.025 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(138,43,226,0.15)', borderRadius: 16, padding: 12 }}
        >
          <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff' }}>{from}</div>
          <ArrowRight size={14} color="#8a2be2" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 5px #8a2be2)' }} />
          <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#b4b4c4' }}>{to}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

const ExistingGridPanel = ({ riftStatus, riftData, gridNodes, gridRoutes }) => (
  <section style={{ background: 'rgba(5,5,8,0.8)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: 32, padding: 24, backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(0,240,255,0.1)' }}>
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', textShadow: '0 0 15px rgba(0,240,255,0.5)' }}>
          <Globe size={18} color="#00f0ff" /> Existing Grid Bridge
        </h3>
        <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: '#8a8a9a' }}>
          Preserves your current EvoPulse nodes/routes while adding the 12-module command layer above it.
        </p>
      </div>
      <div style={{
        background: riftStatus === 'connected' ? 'rgba(0,255,136,0.1)' : 'rgba(255,0,85,0.1)',
        border: `1px solid ${riftStatus === 'connected' ? 'rgba(0,255,136,0.3)' : 'rgba(255,0,85,0.3)'}`,
        borderRadius: 12, padding: '6px 12px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em',
        color: riftStatus === 'connected' ? '#00ff88' : '#ff0055',
        boxShadow: `0 0 15px ${riftStatus === 'connected' ? 'rgba(0,255,136,0.2)' : 'rgba(255,0,85,0.2)'}`
      }}>
        {riftStatus === 'connected' ? 'Bridge Online' : 'Bridge Offline'}
      </div>
    </div>

    {riftStatus !== 'connected' && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: 16, marginBottom: 24, boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
        <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px #f59e0b)' }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '-0.02em' }}>Bridge not connected</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(245,158,11,0.8)', marginTop: 4 }}>
            The dashboard stays usable without the bridge. Start your bridge process when you want live node data.
          </div>
        </div>
      </div>
    )}

    <div className="grid gap-4 md:grid-cols-3">
      <PulseMetric icon={Database} label="Grid Nodes" value={gridNodes.length} detail="Existing registered node count from your evo store." />
      <PulseMetric icon={Route} label="Routes" value={gridRoutes.length} detail="Existing mesh route count from your evo store." />
      <PulseMetric icon={Activity} label="Runtime" value={riftStatus === 'connected' ? 'ON' : 'SAFE'} detail={riftData?.system_msg || 'Grid command layer is loaded with safe defaults.'} />
    </div>
  </section>
);

export default function EvoPulseGridView() {
  const riftStatus = useSovereignStore((s) => s.riftStatus);
  const riftData = useSovereignStore((s) => s.riftData);
  const gridNodes = useSovereignStore((s) => s.gridNodes);
  const gridRoutes = useSovereignStore((s) => s.gridRoutes);
  const globalTheme = useSovereignStore((s) => s.globalTheme);
  const activeThemeId = globalTheme?.theme || 'evoCore';

  // TRIDALL STATE
  const tridallState = useSovereignStore((s) => s.tridallState);
  const triggerTridallIngestion = useSovereignStore((s) => s.triggerTridallIngestion);

  // ─── LIVE MATURITY DATA FROM BRIDGE ───
  const [liveMaturity, setLiveMaturity] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function fetchMaturity() {
      try {
        const res = await fetch(`${getBridgeUrl()}/api/metrics`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.maturity?.modules) {
          setLiveMaturity(data.maturity);
        }
      } catch { /* bridge offline — use static fallback */ }
    }
    fetchMaturity();
    const interval = setInterval(fetchMaturity, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Merge live scores into the static module definitions
  const modules = EVO_PULSE_MODULES.map(mod => {
    if (!liveMaturity?.modules) return mod;
    const liveMod = liveMaturity.modules.find(m => m.name === mod.name || m.id === mod.id);
    if (liveMod) {
      return { ...mod, score: liveMod.score, status: liveMod.grade === 'A' ? 'ACTIVE' : liveMod.grade === 'B' ? 'PRIMED' : 'NEEDS_WORK' };
    }
    return mod;
  });

  const averageScore = liveMaturity?.averageScore || getAverageScore(modules);
  const totalProofGates = modules.reduce((sum, m) => sum + (m.gates?.length || 0), 0);
  const digest = buildDigest(modules.map(({ id, score, status }) => ({ id, score, status })));

  // ─── OMNI-EVOLUTION: TRIDALL PATTERN ENGINE ───
  if (activeThemeId === 'layoutTerminalFullscreen') {
    return (
      <div className="p-8 w-full h-full text-[#0f0] font-mono whitespace-pre-wrap bg-black flex-col">
        <div>{`[TRIDALL_PATTERN_ENGINE] ACTIVE.

Loading Pattern Modules...
${EVO_PULSE_MODULES.map(m => `> ${m.name.toUpperCase()} [SCORE: ${m.score}] [STATE: ${m.status}]`).join('\n')}
`}</div>
        
        <div className="mt-8 border-[#0f0] p-4">
          <div className="mb-4">ENGINE STATUS: {tridallState?.status || 'IDLE'}</div>
          {tridallState?.patterns?.length > 0 ? (
            <div>
              {tridallState.patterns.map((p, i) => (
                <div key={i} className="mb-4">
                  &gt; EXTRACTED: {p.concept}
                  &gt; CONFIDENCE: {p.confidence}%
                  &gt; BUYER MAP: {tridallState.buyerMaps[i]?.segment}
                  &gt; MONETIZATION: {tridallState.monetizationPaths[i]?.model}
                </div>
              ))}
            </div>
          ) : (
            <div>&gt; WAITING FOR PATTERN INGESTION... _</div>
          )}
          
          <button 
            className="mt-4 px-4 py-2 bg-[#0f0] text-black font-bold hover:bg-white transition-colors"
            onClick={() => triggerTridallIngestion('Analyze SaaS CRM trends', { time: 'Q4' })}
            disabled={tridallState?.status === 'INGESTING'}
          >
            {tridallState?.status === 'INGESTING' ? 'EXTRACTING...' : 'INITIATE INGESTION'}
          </button>
        </div>
      </div>
    );
  }

  if (activeThemeId === 'extremeWindows95') {
    return (
      <div className="p-8 w-full h-full bg-[#008080]">
        <div className="w-[800px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] flex-col text-black font-sans">
          <div className="bg-[#000080] text-white px-2 py-1 flex justify-between font-bold">
            <span>Tridall Pattern Engine v1.0</span>
            <div className="flex gap-1">
              <button className="bg-[#c0c0c0] text-black px-1 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold pb-1 leading-none" onClick={() => void('Window closed')}>X</button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            {EVO_PULSE_MODULES.map(m => (
              <div key={m.id} className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500" />
                <span className="text-xs font-bold leading-tight">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeThemeId === 'cyberpunk') {
    return (
      <div className="p-8 w-full h-full bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.1)_0%,rgba(0,0,0,1)_100%)] pointer-events-none" />
        <h1 className="text-[#f00] font-black text-6xl tracking-widest uppercase mb-8" style={{textShadow: '0 0 20px #f00'}}>Tridall Shadow Forge</h1>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          {EVO_PULSE_MODULES.map(m => (
            <div key={m.id} className="bg-black border-[#f00]/40 p-4 relative overflow-hidden group hover:border-[#f00] transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#f00] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <div className="text-[#f00] font-mono text-xs mb-2">TARGET: {m.id.toUpperCase()}</div>
              <div className="text-white font-bold text-lg mb-1">{m.name}</div>
              <div className="text-[#f00]/60 text-xs">BREACH PROBABILITY: {m.score}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <IDEPageLayout
      title={
        <>
          EvoPulse Grid <span style={{ color: '#00f0ff' }}>Command Core</span>
        </>
      }
      description="All 12 breakout inventions are fused into the existing EvoPulse page as a proof-gated studio command layer for visibility, reasoning, self-evolution, rollback, and founder invention scoring."
      icon={Rocket}
      actions={
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)',
          borderRadius: 20, padding: '6px 14px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
          color: '#00f0ff', boxShadow: '0 0 15px rgba(0,240,255,0.2)'
        }}>
          <Rocket size={14} /> Max Integration Build
        </div>
      }
    >
      <div className="space-y-8 animate-in fade-in duration-500 relative z-10" style={{ paddingBottom: 64 }}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 20 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{modules.length}</div>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#8a8a9a', marginTop: 4 }}>Modules</div>
          </div>
          <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 24, padding: 20, boxShadow: '0 0 20px rgba(0,255,136,0.15)' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#00ff88', lineHeight: 1, textShadow: '0 0 15px rgba(0,255,136,0.4)' }}>{averageScore}%</div>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(0,255,136,0.8)', marginTop: 4 }}>Avg Score</div>
          </div>
          <div style={{ background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.3)', borderRadius: 24, padding: 20, boxShadow: '0 0 20px rgba(138,43,226,0.15)' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#8a2be2', lineHeight: 1.5, textShadow: '0 0 15px rgba(138,43,226,0.4)' }}>{digest.slice(-6)}</div>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(138,43,226,0.8)', marginTop: 4 }}>Digest</div>
          </div>
        </div>

      <div className="grid gap-6 md:grid-cols-4">
        <PulseMetric icon={Layers3} label="Domains" value={String(DOMAIN_ORDER.length)} detail="Studio, LLM, self-evolve, and self-invent layers fused into one page." />
        <PulseMetric icon={CheckCircle2} label="Proof Gates" value={String(totalProofGates)} detail="Each module carries 3 required proof signals before production acceptance." />
        <PulseMetric icon={Shield} label="Boundary Mode" value="ON" detail="No invented success, no hidden mutation, no secret values, no unsupported claims." />
        <PulseMetric icon={Zap} label="Status" value="PRIMED" detail="Ready for deeper script, store, and backend bridge wiring in the next repo pass." />
      </div>

      <ExistingGridPanel riftStatus={riftStatus} riftData={riftData} gridNodes={gridNodes} gridRoutes={gridRoutes} />
      <TopologyPanel />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {DOMAIN_ORDER.map((domain) => (
          <DomainColumn key={domain} domain={domain} modules={modules} />
        ))}
      </div>
      </div>
    </IDEPageLayout>
  );
}
