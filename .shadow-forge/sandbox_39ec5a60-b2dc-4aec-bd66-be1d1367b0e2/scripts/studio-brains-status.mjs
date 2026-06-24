#!/usr/bin/env node
import dotenv from 'dotenv';
import { createTriBrainSystem } from '../src/core/tribrain/index.js';
import { getQuadBrainStatus } from '../src/core/quadbrain/index.js';
import { seedEngineRegistry, getEngineRegistryReport } from '../src/core/evo-layer/registry/EngineRegistry.js';
import { getMemoryGraph } from '../src/core/evo-layer/memory/MemoryGraph.js';
import { inferMemoryHealth } from '../src/core/evo-layer/memory/MemoryQueryEngine.js';
import { buildDaemonReadinessReport } from '../src/core/evo-layer/daemons/DaemonReadiness.js';
import { getEvolutionStatus } from '../src/core/evolution/index.js';
import { getSpineCoreContract } from '../src/core/spinecore/index.js';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.agent' });
dotenv.config({ path: '.env.local' });

const rootDir = process.cwd();
seedEngineRegistry({ rootDir });

const readiness = new PlatformReadinessEngine({ rootDir });
const onlineBlockers = readiness.onlineBlockers();
const onlineSummary = readiness.onlineSummary(onlineBlockers);
const daemonProof = buildDaemonReadinessReport({ rootDir });
const engineReport = getEngineRegistryReport({ rootDir });
const localGaps = [];
const roadmapGaps = [];

if (engineReport.avgCompletion < 100) {
  roadmapGaps.push(`Evo Layer engine registry average is ${engineReport.avgCompletion}%; planned engines remain roadmap work.`);
}

const selfEvolution = getEvolutionStatus({ rootDir });
if (selfEvolution.lastRun?.blockedReasons?.length) {
  localGaps.push(`Self-Evolution latest run has blockers: ${selfEvolution.lastRun.blockedReasons.join('; ')}`);
}
const selfEvolutionProofReady = selfEvolution.lastRun?.truthState === 'PROOF_PASSED'
  && selfEvolution.lastRun?.proof?.passed
  && selfEvolution.lastRun?.comparison?.improved;
if (!selfEvolutionProofReady) {
  localGaps.push('Self-Evolution has not produced a latest PROOF_PASSED receipt.');
}

if (!daemonProof.success) {
  localGaps.push(`Daemon proof has gaps: ${daemonProof.localGaps.join('; ')}`);
}

const memoryHealth = inferMemoryHealth({ rootDir });
const memoryGraph = getMemoryGraph({ rootDir });
if (memoryHealth.risk === 'ELEVATED') {
  localGaps.push('Evo Layer memory risk is elevated.');
}

function summarizeEvolutionRun(run) {
  if (!run) return null;
  return {
    objective: run.objective,
    truthState: run.truthState,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    blockedReasons: run.blockedReasons || [],
    changedFiles: run.changedFiles || [],
    verificationOnly: Boolean(run.proposal?.verificationOnly),
  };
}

const report = {
  success: localGaps.length === 0,
  truthState: localGaps.length === 0 ? 'LOCAL_BRAIN_STACK_READY' : 'LOCAL_BRAIN_STACK_HAS_GAPS',
  generatedAt: new Date().toISOString(),
  triBrain: createTriBrainSystem().status(),
  quadBrain: getQuadBrainStatus(),
  evoLayer: {
    engines: engineReport,
    daemons: daemonProof,
    roadmapGaps,
    memory: {
      graph: {
        success: memoryGraph.success,
        truthState: memoryGraph.truthState,
        nodeCount: memoryGraph.nodes.length,
        edgeCount: memoryGraph.edges.length,
        types: [...new Set(memoryGraph.nodes.map(node => node.type))],
        generatedAt: memoryGraph.generatedAt,
      },
      health: memoryHealth,
    },
  },
  selfEvolution: {
    success: selfEvolution.success,
    truthState: selfEvolution.truthState,
    lastRun: summarizeEvolutionRun(selfEvolution.lastRun),
    recentRuns: (selfEvolution.recentRuns || []).slice(0, 5).map(summarizeEvolutionRun),
    policy: selfEvolution.policy,
  },
  spineCore: {
    truthState: 'SPINECORE_CONTRACT_READY',
    contract: getSpineCoreContract(),
  },
  onlineSummary,
  onlineBlockers,
  localGaps,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.success ? 0 : 1);
