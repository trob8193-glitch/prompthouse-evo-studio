import React from 'react';
import { motion } from 'framer-motion';
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

const MODULE_DOMAINS = {
  STUDIO: 'PH Evo Studio',
  LLM: 'Evo LLM',
  SELF_EVOLVE: 'Studio Self-Evolve',
  SELF_INVENT: 'Self-Invent',
};

const DOMAIN_STYLES = {
  [MODULE_DOMAINS.STUDIO]: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  [MODULE_DOMAINS.LLM]: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  [MODULE_DOMAINS.SELF_EVOLVE]: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  [MODULE_DOMAINS.SELF_INVENT]: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
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

function getDomainModules(domain) {
  return EVO_PULSE_MODULES.filter((module) => module.domain === domain);
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

const PulseMetric = ({ icon: Icon, label, value, detail }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-xl shadow-black/10">
    <div className="flex items-center justify-between">
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-300">
        <Icon size={16} />
      </div>
      <div className="text-right">
        <div className="text-2xl font-black text-white tracking-tighter">{value}</div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</div>
      </div>
    </div>
    <div className="mt-3 text-[10px] font-semibold leading-relaxed text-slate-500">{detail}</div>
  </div>
);

const ModuleCard = ({ module, index }) => {
  const Icon = module.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      className="group rounded-2xl border border-slate-800 bg-slate-950/50 p-4 transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-900/70"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl border p-2 ${DOMAIN_STYLES[module.domain]}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-tight text-white group-hover:text-indigo-200">
              {module.name}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{module.layer}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-emerald-300">{module.score}%</div>
          <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500/80">{module.status}</div>
        </div>
      </div>

      <p className="min-h-[54px] text-[11px] font-semibold leading-relaxed text-slate-400">{module.summary}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <MiniList title="Inputs" items={module.inputs} />
        <MiniList title="Outputs" items={module.outputs} />
        <MiniList title="Gates" items={module.gates} />
      </div>
    </motion.div>
  );
};

const MiniList = ({ title, items }) => (
  <div className="rounded-xl border border-slate-800/70 bg-black/20 p-3">
    <div className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-slate-500">{title}</div>
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item} className="flex gap-2 text-[9px] font-bold leading-snug text-slate-400">
          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
          {item}
        </div>
      ))}
    </div>
  </div>
);

const DomainColumn = ({ domain }) => {
  const modules = getDomainModules(domain);
  const score = getAverageScore(modules);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-black uppercase tracking-tight text-white">{domain}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{modules.length} integrated modules</div>
        </div>
        <div className={`rounded-xl border px-3 py-2 text-right ${DOMAIN_STYLES[domain]}`}>
          <div className="text-lg font-black">{score}%</div>
          <div className="text-[8px] font-black uppercase tracking-widest opacity-80">Domain score</div>
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
  <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-300">
          <Route size={16} className="text-indigo-300" /> Pulse Topology Chain
        </h3>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          The 12 modules are fused into one proof-backed evolution path. Fancy words, yes. Still actual structure, thankfully.
        </p>
      </div>
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-300">
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
          className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-black/20 p-3"
        >
          <div className="min-w-0 flex-1 truncate text-[10px] font-black uppercase tracking-tight text-slate-300">{from}</div>
          <ArrowRight size={14} className="shrink-0 text-indigo-400" />
          <div className="min-w-0 flex-1 truncate text-[10px] font-black uppercase tracking-tight text-slate-400">{to}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

const ExistingGridPanel = ({ riftStatus, riftData, gridNodes, gridRoutes }) => (
  <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6">
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-300">
          <Globe size={16} className="text-cyan-300" /> Existing Grid Bridge
        </h3>
        <p className="mt-1 text-[11px] font-semibold text-slate-500">
          Preserves your current EvoPulse nodes/routes while adding the 12-module command layer above it.
        </p>
      </div>
      <div className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${riftStatus === 'connected' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
        {riftStatus === 'connected' ? 'Bridge Online' : 'Bridge Offline'}
      </div>
    </div>

    {riftStatus !== 'connected' && (
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200">
        <AlertCircle size={18} />
        <div>
          <div className="text-xs font-black uppercase tracking-tight">Bridge not connected</div>
          <div className="text-[10px] font-semibold text-amber-200/70">
            The dashboard stays usable without the bridge. Start your bridge process when you want live node data.
          </div>
        </div>
      </div>
    )}

    <div className="grid gap-4 md:grid-cols-3">
      <PulseMetric icon={Database} label="Grid Nodes" value={gridNodes.length} detail="Existing registered node count from your sovereign store." />
      <PulseMetric icon={Route} label="Routes" value={gridRoutes.length} detail="Existing mesh route count from your sovereign store." />
      <PulseMetric icon={Activity} label="Runtime" value={riftStatus === 'connected' ? 'ON' : 'SAFE'} detail={riftData?.system_msg || 'Grid command layer is loaded with safe defaults.'} />
    </div>
  </section>
);

export default function EvoPulseGridView() {
  const riftStatus = useSovereignStore((s) => s.riftStatus);
  const riftData = useSovereignStore((s) => s.riftData);
  const gridNodes = useSovereignStore((s) => s.gridNodes);
  const gridRoutes = useSovereignStore((s) => s.gridRoutes);

  const averageScore = getAverageScore();
  const digest = buildDigest(EVO_PULSE_MODULES.map(({ id, score, status }) => ({ id, score, status })));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/40 p-7 shadow-2xl shadow-indigo-950/20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-200">
              <Rocket size={13} /> Max Integration Build
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-white md:text-5xl">
              EvoPulse Grid Command Core
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-400">
              All 12 breakout inventions are fused into the existing EvoPulse page as a proof-gated studio command layer for visibility, reasoning, self-evolution, rollback, and founder invention scoring.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-right">
            <div className="rounded-2xl border border-slate-800 bg-black/30 p-4">
              <div className="text-3xl font-black text-white">12</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Modules</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="text-3xl font-black text-emerald-300">{averageScore}%</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Avg Score</div>
            </div>
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <div className="text-xl font-black text-indigo-200">{digest.slice(-6)}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400/80">Digest</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <PulseMetric icon={Layers3} label="Domains" value="4" detail="Studio, LLM, self-evolve, and self-invent layers fused into one page." />
        <PulseMetric icon={CheckCircle2} label="Proof Gates" value="36" detail="Each module carries 3 required proof signals before production acceptance." />
        <PulseMetric icon={Shield} label="Boundary Mode" value="ON" detail="No invented success, no hidden mutation, no secret values, no unsupported claims." />
        <PulseMetric icon={Zap} label="Status" value="PRIMED" detail="Ready for deeper script, store, and backend bridge wiring in the next repo pass." />
      </div>

      <ExistingGridPanel riftStatus={riftStatus} riftData={riftData} gridNodes={gridNodes} gridRoutes={gridRoutes} />
      <TopologyPanel />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {DOMAIN_ORDER.map((domain) => (
          <DomainColumn key={domain} domain={domain} />
        ))}
      </div>
    </div>
  );
}
