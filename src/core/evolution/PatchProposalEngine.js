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

function routeExists(rootDir, route) {
  const files = [
    'server/routes/studio-core.routes.js',
    'promptbridge-server.js',
    'generated_apis/evo_llm_routes.js',
  ];
  return files.some((relPath) => safeRead(rootDir, relPath).includes(route));
}

function buildBridgeContractExpectedRoutesPatch(rootDir) {
  const relPath = 'src/bridge-contract-ledger.js';
  const current = safeRead(rootDir, relPath);
  if (!current) return null;
  const required = [
    '/api/training/ingest',
    '/api/training-capture',
    '/api/training/stats',
    '/api/evo-runtime/status',
    '/api/evo-runtime/activate',
  ];
  const missing = required.filter((route) => !current.includes(`'${route}'`));
  if (missing.length === 0) return null;
  const anchor = "    '/api/queue/master',";
  if (!current.includes(anchor)) return null;
  const proposedContent = current.replace(anchor, [
    anchor,
    ...missing.map((route) => `    '${route}',`)
  ].join('\n'));
  return {
    path: relPath,
    operation: 'update',
    reason: 'Add self-training and Evo runtime routes to the bridge contract ledger.',
    proposedContent,
  };
}

function buildRouteProofPlanPatch(rootDir) {
  const relPath = 'docs/self-evolution-readiness.md';
  const current = safeRead(rootDir, relPath);
  const content = current || '# Self-Evolution Readiness\n\n';
  const marker = '## Autonomous Route Integrity';
  if (content.includes(marker)) return null;
  const proposedContent = `${content.trim()}\n\n${marker}\n\n- Run \`node scripts/audit-route-drift.mjs\` after route changes.\n- Run \`npm run audit:dead-surfaces\` after UI command changes.\n- Keep provider training in blocked, submitted, pending, or trained-weights states; never claim trained weights until the provider returns a fine-tuned model id.\n`;
  return {
    path: relPath,
    operation: current ? 'update' : 'create',
    reason: 'Document broader autonomous route/provider proof checks for future self-evolution cycles.',
    proposedContent,
  };
}

function buildVerificationOnlyProposal({ objective }) {
  return {
    reason: 'No deterministic source patch matched the objective; run proof gates and record a receipt-backed clean-state result.',
    verificationOnly: true,
    expectedImprovement: [
      'Confirm local proof gates still pass',
      'Record that no source mutation was required for the requested objective'
    ],
    objective: objective || 'Autonomous self-evolution verification cycle'
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

  if (objectiveText.includes('training') || objectiveText.includes('runtime') || objectiveText.includes('route') || objectiveText.includes('provider')) {
    const contractPatch = buildBridgeContractExpectedRoutesPatch(rootDir);
    if (contractPatch) files.push(contractPatch);
    const proofPlanPatch = buildRouteProofPlanPatch(rootDir);
    if (proofPlanPatch) files.push(proofPlanPatch);
  }

  if (files.length === 0) {
    if (!routeExists(rootDir, '/api/training-capture') || !routeExists(rootDir, '/api/evo-runtime/activate')) {
      const contractPatch = buildBridgeContractExpectedRoutesPatch(rootDir);
      if (contractPatch) files.push(contractPatch);
    }
    const truthPatch = buildTruthLanguagePatch(rootDir);
    if (truthPatch) files.push(truthPatch);
  }

  const verificationOnly = files.length === 0 ? buildVerificationOnlyProposal({ objective }) : null;

  const proposal = {
    id: `proposal_${Date.now()}`,
    runId,
    objective: objective || 'Autonomous self-evolution safe cleanup',
    risk: 'LOW',
    riskScore: null,
    expectedImprovement: verificationOnly?.expectedImprovement || ['Reduce unverified completion language', 'Improve deployment environment readiness'],
    files,
    verificationOnly: Boolean(verificationOnly),
    verificationReason: verificationOnly?.reason || null,
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
    if (proposal.verificationOnly) {
      return { ...proposal, blockedReasons: [] };
    }
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
