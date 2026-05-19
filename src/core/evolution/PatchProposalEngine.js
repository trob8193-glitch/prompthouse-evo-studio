import fs from 'fs';
import path from 'path';
import { assertPathAllowed, requiresOwnerApproval } from './EvolutionPolicy.js';
import { scoreEvolutionRisk } from './EvolutionRiskScorer.js';

function safeRead(rootDir, relPath) {
  const full = path.join(rootDir, relPath);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

function buildEnvBridgePatch(rootDir) {
  const relPath = 'src/store.js';
  const current = safeRead(rootDir, relPath);
  if (!current.includes("const BRIDGE_URL = 'http://127.0.0.1:3001';")) return null;
  const proposedContent = current.replace(
    "const BRIDGE_URL = 'http://127.0.0.1:3001';",
    "const BRIDGE_URL = import.meta.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001';"
  );
  return {
    path: relPath,
    operation: 'update',
    reason: 'Replace hardcoded bridge URL with Vite environment fallback while preserving local default.',
    proposedContent,
  };
}

function buildTruthLanguagePatch(rootDir) {
  const relPath = 'src/self-implementation-policy.js';
  const current = safeRead(rootDir, relPath);
  if (!current) return null;
  let next = current
    .replace(/Autonomously fulfilled by the Great Realization Protocol\.\r?\n \* This module is now 100% functional and production-ready\./g, 'Truth-gated self-implementation policy helpers. Completion claims require receipts.')
    .replace(/Autonomously fulfilled by the Great Realization Protocol\.\r?\n \* Operational status is determined by live audits and proof receipts\./g, 'Truth-gated self-implementation policy helpers. Completion claims require receipts.')
    .replace(/this\.status = 'OMNIPOTENT';/g, "this.status = 'POLICY_READY';")
    .replace(/\r?\n\s*this\.iq_baseline = 165\.0;/g, '')
    .replace(/result: 'FULFILLED'/g, "result: 'POLICY_CHECKED'")
    .replace(/grade: 'S\+*'/g, "grade: 'POLICY_GATED'")
    .replace(/state: 'VERIFIED'/g, "state: 'READY'")
    .replace(/,\r?\n\s*resonance: 0\.99/g, '');
  if (next === current) return null;
  return {
    path: relPath,
    operation: 'update',
    reason: 'Remove unverified self-evolution completion language and replace with receipt-safe policy language.',
    proposedContent: next,
  };
}

export function buildPatchProposal({ runId = `evo_${Date.now()}`, objective = '', rootDir = process.cwd(), diagnostics = null, memory = null, policy = {} } = {}) {
  const objectiveText = String(objective || '').toLowerCase();
  const files = [];

  if (objectiveText.includes('bridge url') || objectiveText.includes('hardcoded') || objectiveText.includes('env')) {
    const patch = buildEnvBridgePatch(rootDir);
    if (patch) files.push(patch);
  }

  if (objectiveText.includes('truth') || objectiveText.includes('unverified') || objectiveText.includes('hype') || objectiveText.includes('self')) {
    const patch = buildTruthLanguagePatch(rootDir);
    if (patch) files.push(patch);
  }

  if (files.length === 0) {
    const truthPatch = buildTruthLanguagePatch(rootDir);
    if (truthPatch) files.push(truthPatch);
  }

  const proposal = {
    id: `proposal_${Date.now()}`,
    runId,
    objective: objective || 'Autonomous self-evolution safe cleanup',
    risk: 'LOW',
    riskScore: null,
    expectedImprovement: ['Reduce unverified completion language', 'Improve deployment environment readiness'],
    files,
    diagnosticsSummary: diagnostics?.summary || null,
    memoryHints: memory || null,
    requiresOwnerApproval: false,
    blockedReasons: [],
    createdAt: new Date().toISOString(),
  };

  const risk = scoreEvolutionRisk({ proposal });
  proposal.risk = risk.level;
  proposal.riskScore = risk;
  proposal.requiresOwnerApproval = requiresOwnerApproval(proposal, policy);
  return validatePatchProposal(proposal, policy);
}

export function validatePatchProposal(proposal, policy = {}) {
  if (!proposal || !Array.isArray(proposal.files)) throw new Error('Invalid patch proposal.');
  if (proposal.files.length === 0) {
    return { ...proposal, blockedReasons: ['No safe matching patch could be generated for the objective.'] };
  }
  const blockedReasons = [...(proposal.blockedReasons || [])];
  for (const file of proposal.files) {
    try {
      assertPathAllowed(file.path, policy);
      if (file.operation !== 'delete' && typeof file.proposedContent !== 'string') {
        blockedReasons.push(`Missing proposed content for ${file.path}`);
      }
    } catch (e) {
      blockedReasons.push(e.message);
    }
  }
  return { ...proposal, blockedReasons };
}
