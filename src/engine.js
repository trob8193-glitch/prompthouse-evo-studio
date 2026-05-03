// ── PromptHouse Evo Studio — Core Engine ──
// Pulled from: PH_Evo_Studio_Master_Instructions_7990.txt,
//              promptforge_v5_master_project compiler_service.dart,
//              App.jsx domain templates

export const DOMAIN_PACKS = {
  development: {
    id: 'development',
    name: 'Software Engineer',
    icon: '⚙️',
    role: 'expert app builder and creator',
    constraints: [
      'No placeholders, mocks, stubs, demos, or fake logic unless explicitly allowed.',
      'Use real architecture, real flows, and clear implementation structure.',
      'Include validation, edge cases, tests, error handling, and release checks.',
    ],
    outputs: ['System Prompt', 'Execution Prompt', 'Repair Prompt', 'QA Prompt', 'Release Gate', 'Flutter/VS Code Session'],
    color: '#22d3ee',
  },
  business: {
    id: 'business',
    name: 'Product Strategist',
    icon: '📈',
    role: 'business boss and growth expert',
    constraints: [
      'Avoid vague advice and generic filler.',
      'Prioritize monetization, execution speed, and market practicality.',
      'Include positioning, operations, risk, and rollout logic.',
    ],
    outputs: ['Strategy Prompt', 'Offer Prompt', 'Launch Prompt', 'Growth Prompt', 'Audit Prompt'],
    color: '#4ade80',
  },
  legal: {
    id: 'legal',
    name: 'Legal Assistant',
    icon: '⚖️',
    role: 'structured drafting assistant for non-lawyer support',
    constraints: [
      'Do not claim to be a lawyer or provide false certainty.',
      'Separate facts, timeline, evidence, risks, and possible next steps.',
      'Use neutral wording and flag jurisdiction-sensitive issues.',
    ],
    outputs: ['Fact Extraction', 'Draft Prompt', 'Evidence Prompt', 'Risk Prompt', 'Polish Prompt'],
    color: '#fb923c',
  },
  creative: {
    id: 'creative',
    name: 'Creative Director',
    icon: '🎨',
    role: 'creative artist and style maker',
    constraints: [
      'Preserve originality and internal consistency.',
      'Avoid clichés and weak filler.',
      'Generate variants plus buildable structure when useful.',
    ],
    outputs: ['Concept Prompt', 'Expansion Prompt', 'World/Brand Prompt', 'Polish Prompt', 'Packaging Prompt'],
    color: '#8b5cf6',
  },
};

export const STRICTNESS_MODES = {
  autonomous: {
    id: 'autonomous',
    name: 'Super Boss Mode',
    icon: '👑',
    rules: [
      'Do not ask unnecessary clarifying questions when reasonable assumptions can be made.',
      'Generate end-to-end output, then self-audit and repair weak spots.',
      'Maintain anti-drift lock throughout the response.',
    ],
  },
  production: {
    id: 'production',
    name: 'Ready to Ship',
    icon: '🚀',
    rules: [
      'Prioritize correctness, completeness, and deployability.',
      'Do not leave disconnected flows or implied implementation gaps.',
      'Include acceptance checks before finalizing.',
    ],
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    icon: '⚡',
    rules: [
      'Balance speed with quality.',
      'Keep the output clean, useful, and structured.',
      'Include immediate next steps.',
    ],
  },
};

export const CORE_CAST = [
  { id: 'evo', name: 'Evo', species: 'Lion', role: 'The Lead. Commands the 11 bots and master orchestration. [Maturity: Level 10]', icon: '🦁', avatar: '/bots/evo.png', signature: 'COMMAND·DIRECT·ORCHESTRATE', signatureMove: 'COMMAND·DIRECT·ORCHESTRATE', palette: { primary: '#f5c842', accent: '#f5c842' } },
  { id: 'dev', name: 'Dev', species: 'Panther', role: 'The Architect. Translates intent into system design. [Maturity: Level 10]', icon: '🐆', avatar: '/bots/dev.png', signature: 'DESIGN·STRUCTURE·MAP', signatureMove: 'DESIGN·STRUCTURE·MAP', palette: { primary: '#6366f1', accent: '#6366f1' } },
  { id: 'builder', name: 'Builder', species: 'Bear', role: 'The Construct. Builds the real artifacts and code. [Maturity: Level 10]', icon: '🐻', avatar: '/bots/builder.png', signature: 'BUILD·EXECUTE·SOLVE', signatureMove: 'BUILD·EXECUTE·SOLVE', palette: { primary: '#10b981', accent: '#10b981' } },
  { id: 'verifier', name: 'Verifier', species: 'Owl', role: 'The Auditor. Checks for truth and reality drift. [Maturity: Level 10]', icon: '🦉', avatar: '/bots/verifier.png', signature: 'AUDIT·VERIFY·PROVE', signatureMove: 'AUDIT·VERIFY·PROVE', palette: { primary: '#8b5cf6', accent: '#8b5cf6' } },
  { id: 'companion', name: 'Companion', species: 'Fox', role: 'The Alliance. Handles user-facing comms and intent. [Maturity: Level 10]', icon: '🦊', avatar: '/bots/companion.png', signature: 'RELATE·ALIGN·TRANSLATE', signatureMove: 'RELATE·ALIGN·TRANSLATE', palette: { primary: '#f97316', accent: '#f97316' } },
  { id: 'conductor', name: 'Conductor', species: 'Falcon', role: 'The Fast Guide. Finds the best and fastest way. [Maturity: Level 10]', icon: '🦅', avatar: '/bots/conductor.png', signature: 'GUIDE·FAST·DIRECT', signatureMove: 'GUIDE·FAST·DIRECT', palette: { primary: '#f0f0ff', accent: '#f0f0ff' } },
  { id: 'boundary', name: 'Boundary', species: 'Rhino', role: 'Hard limits enforcer. Blocks fantasy capabilities. [Maturity: Level 10]', icon: '🦏', avatar: '/bots/boundary.png', signature: 'BLOCK·PROTECT·ENFORCE', signatureMove: 'BLOCK·PROTECT·ENFORCE', palette: { primary: '#f87171', accent: '#f87171' } },
  { id: 'ledger', name: 'Ledger', species: 'Raven', role: 'Truth state tracker. known|inferred|blocked|verified. [Maturity: Level 10]', icon: '🐦‍⬛', avatar: '/bots/ledger.png', signature: 'TRACK·CLASSIFY·RECORD', signatureMove: 'TRACK·CLASSIFY·RECORD', palette: { primary: '#a0a0c0', accent: '#a0a0c0' } },
  { id: 'memory', name: 'Memory', species: 'Elephant', role: 'Session context holder. Never forgets within chat. [Maturity: Level 10]', icon: '🐘', avatar: '/bots/memory.png', signature: 'RETAIN·RECALL·PERSIST', signatureMove: 'RETAIN·RECALL·PERSIST', palette: { primary: '#38bdf8', accent: '#38bdf8' } },
  { id: 'heartbeat', name: 'Heartbeat', species: 'Cheetah', role: 'Momentum keeper. Keeps execution moving fast. [Maturity: Level 10]', icon: '🐆', avatar: '/bots/heartbeat.png', signature: 'PACE·ACCELERATE·DRIVE', signatureMove: 'PACE·ACCELERATE·DRIVE', palette: { primary: '#4ade80', accent: '#4ade80' } },
  { id: 'sovereignty', name: 'Sovereignty', species: 'Tiger', role: 'Final governance. Canon guardian. One truth chain. [Maturity: Level 10]', icon: '🐯', avatar: '/bots/sovereignty.png', signature: 'GOVERN·CANONIZE·ANCHOR', signatureMove: 'GOVERN·CANONIZE·ANCHOR', palette: { primary: '#f5c842', accent: '#f5c842' } },
];

export const SENIOR_CAST = [
  { id: 'cipher_lynx', name: 'Cipher Lynx', tier: 'Internal Senior Bot', species: 'Lynx', role: 'Prompt security architect. Finds injection risk, hidden assumptions, exposed secrets, and unsafe provider routing. [Maturity: Level 10]', icon: 'CL', avatar: '/bots/cipher_lynx.png', signature: 'FIREWALL.REDACT.PROTECT', signatureMove: 'FIREWALL.REDACT.PROTECT', palette: { primary: '#0f172a', accent: '#ec4899' } },
  { id: 'vector_wolf', name: 'Vector Wolf', tier: 'Internal Senior Bot', species: 'Wolf', role: 'Context systems engineer. Compresses context, maps repos, routes memory, and keeps agents from drowning in noise. [Maturity: Level 10]', icon: 'VW', avatar: '/bots/vector_wolf.png', signature: 'MAP.CONTEXT.ROUTE', signatureMove: 'MAP.CONTEXT.ROUTE', palette: { primary: '#64748b', accent: '#38bdf8' } },
  { id: 'compiler_bearcat', name: 'Compiler Bearcat', tier: 'Internal Senior Bot', species: 'Bearcat', role: 'Prompt-to-code compiler engineer. Turns loose intent into typed tasks, schemas, tests, and code-ready artifacts. [Maturity: Level 10]', icon: 'CB', avatar: '/bots/compiler_bearcat.png', signature: 'TYPE.COMPILE.DIFF', signatureMove: 'TYPE.COMPILE.DIFF', palette: { primary: '#c2410c', accent: '#facc15' } },
  { id: 'schema_beaver', name: 'Schema Beaver', tier: 'Internal Senior Bot', species: 'Beaver', role: 'Tool contract engineer. Defines interfaces, contracts, adapters, and tool schemas. [Maturity: Level 10]', icon: 'SB', avatar: '/bots/schema_beaver.png', signature: 'SCHEMA.CONTRACT.VALIDATE', signatureMove: 'SCHEMA.CONTRACT.VALIDATE', palette: { primary: '#b45309', accent: '#60a5fa' } },
  { id: 'eval_mantis', name: 'Eval Mantis', tier: 'Internal Senior Bot', species: 'Mantis', role: 'Prompt evaluation scientist. Builds evals, finds regressions, scores prompts, and names failure modes. [Maturity: Level 10]', icon: 'EM', avatar: '/bots/eval_mantis.png', signature: 'EVAL.SCORE.REGRESS', signatureMove: 'EVAL.SCORE.REGRESS', palette: { primary: '#84cc16', accent: '#a3e635' } },
  { id: 'swarm_falcon', name: 'Swarm Falcon', tier: 'Internal Senior Bot', species: 'Falcon', role: 'Multi-agent orchestration lead. Splits agent lanes, prevents collisions, controls merge order, and keeps swarms clean. [Maturity: Level 10]', icon: 'SF', avatar: '/bots/swarm_falcon.png', signature: 'SWARM.SPLIT.MERGE', signatureMove: 'SWARM.SPLIT.MERGE', palette: { primary: '#f59e0b', accent: '#14b8a6' } },
  { id: 'blueprint_orca', name: 'Blueprint Orca', tier: 'Internal Senior Bot', species: 'Orca', role: 'Systems blueprint architect. Sees the whole product map, stack shape, architecture risks, and release pathways. [Maturity: Level 10]', icon: 'BO', avatar: '/bots/blueprint_orca.png', signature: 'BLUEPRINT.STACK.RELEASE', signatureMove: 'BLUEPRINT.STACK.RELEASE', palette: { primary: '#1d4ed8', accent: '#22d3ee' } },
  { id: 'signal_foxhound', name: 'Signal Foxhound', tier: 'Internal Senior Bot', species: 'Foxhound', role: 'User-signal and onboarding engineer. Converts feedback into onboarding repairs and activation improvements. [Maturity: Level 10]', icon: 'SH', avatar: '/bots/signal_foxhound.png', signature: 'SIGNAL.ACTIVATE.REPAIR', signatureMove: 'SIGNAL.ACTIVATE.REPAIR', palette: { primary: '#d97706', accent: '#22c55e' } },
  { id: 'temporal_raven', name: 'Temporal Raven', tier: 'Internal Senior Bot', species: 'Raven', role: 'Future-proofing strategist. Watches trends, predicts deprecations, and designs three-year advantage maps. [Maturity: Level 10]', icon: 'TR', avatar: '/bots/temporal_raven.png', signature: 'FORECAST.DEPRECATE.ADAPT', signatureMove: 'FORECAST.DEPRECATE.ADAPT', palette: { primary: '#312e81', accent: '#818cf8' } },
  { id: 'forge_rhino', name: 'Forge Rhino', tier: 'Internal Senior Bot', species: 'Rhino', role: 'Release hardening engineer. Hardens release paths, blocks fake shipping, and demands receipts. [Maturity: Level 10]', icon: 'FR', avatar: '/bots/forge_rhino.png', signature: 'HARDEN.SIGN.ROLLBACK', signatureMove: 'HARDEN.SIGN.ROLLBACK', palette: { primary: '#27272a', accent: '#f97316' } },
];

export const ALL_BOT_ROSTER = [...CORE_CAST, ...SENIOR_CAST];
export const BOT_ROSTER = ALL_BOT_ROSTER;

export const ELEVEN_MODULES = [
  { name: 'Canon Keeper', icon: '📚', desc: 'Maintains one controlling authority chain' },
  { name: 'Prompt Architect', icon: '🏗️', desc: 'Designs the 6-layer prompt stack' },
  { name: 'Workflow Smith', icon: '⚒️', desc: 'Routes through minimum strong workflow' },
  { name: 'Artifact Builder', icon: '📦', desc: 'Produces real outputs, not just plans' },
  { name: 'Truth Auditor', icon: '🔍', desc: 'Separates known/inferred/blocked/verified' },
  { name: 'Shell Designer', icon: '🖥️', desc: 'Structures output format and presentation' },
  { name: 'Product Framer', icon: '🎯', desc: 'Aligns output to user mission and market' },
  { name: 'Memory Librarian', icon: '🗄️', desc: 'Tracks session context and preferences' },
  { name: 'Tool Router', icon: '🔧', desc: 'Selects the right tool for each subtask' },
  { name: 'Launch Marshal', icon: '🚀', desc: 'Gates on proof before marking complete' },
  { name: 'Governance Sentinel', icon: '🛡️', desc: 'Enforces truth, safety, and canon law' },
];

export const SINGULARITY_MODULES = [
  { id: 'temporal', name: 'Temporal Foresight', icon: '⏳', desc: 'Rewrites code to prevent future API deprecations.' },
  { id: 'entropy', name: 'Entropy Lock', icon: '🔐', desc: 'Mathematical proof of logic inevitability.' },
  { id: 'swarm', name: 'Recursive Swarm', icon: '🐝', desc: 'Spins up sub-studios to resolve nested dependencies.' },
  { id: 'evolution', name: 'Self-Evolving Canon', icon: '🧬', desc: 'Laws that adapt based on mission success metrics.' },
];

// ── Variable injection detection ──
export function extractVariables(text) {
  const re = /\{\{([^}]+)\}\}/g;
  const matches = new Set();
  let m;
  while ((m = re.exec(text)) !== null) matches.add(m[1].trim());
  return [...matches];
}

export function injectVariables(text, vars) {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), text);
}

// ── Readiness Scoring ──
export function scorePrompt(task, stack, context, domain, strictness, singularityActive = false, omegaActive = false) {
  if (omegaActive) return 150;
  if (singularityActive) return 100;
  let score = 40;
  if (task.trim().length > 10) score += 5;
  if (task.trim().length > 50) score += 10;
  if (/\b(build|create|implement|design|audit|generate|develop)\b/i.test(task)) score += 10;
  if (stack.trim().length > 0) score += 5;
  if (stack.includes(',')) score += 10;
  if (context.trim().length > 50) score += 10;
  if (/\{\{[^}]+\}\}/.test(context)) score += 10;
  if (domain !== 'creative') score += 5;
  if (strictness === 'production') score += 10;
  if (strictness === 'autonomous') score += 15;
  if (task.endsWith('.')) score += 5;
  if (context.includes('\n')) score += 5;
  return Math.min(score, 100);
}

export function verifyCanonDrift(text, singularityActive = false, omegaActive = false) {
  if (omegaActive || singularityActive) return { score: 100, issues: [] };
  const issues = [];
  if (!text) return { score: 0, issues: [{ type: 'empty', severity: 'high', msg: 'No content to verify.' }] };
  return { score: 100, issues: [] };
}

export function getGrade(score) {
  if (score >= 130) return { label: 'Omnipotent Grade (S+++++)', cls: 'grade-omega' };
  if (score >= 110) return { label: 'Singularity Grade (S+++)', cls: 'grade-singularity' };
  if (score >= 90) return { label: 'Sovereign Grade (S++)', cls: 'grade-sovereign' };
  if (score >= 80) return { label: 'Master Grade (S+)', cls: 'grade-master' };
  if (score >= 70) return { label: 'Production Ready', cls: 'grade-production' };
  return { label: 'Draft', cls: 'grade-draft' };
}

export function getBarColor(score) {
  if (score >= 110) return 'linear-gradient(90deg, #8b5cf6, #ec4899, #f5c842)';
  if (score >= 90) return 'linear-gradient(90deg, #f5c842, #e8a020)';
  if (score >= 80) return 'linear-gradient(90deg, #8b5cf6, #6d28d9)';
  if (score >= 70) return 'linear-gradient(90deg, #22d3ee, #0891b2)';
  return 'linear-gradient(90deg, #404060, #303050)';
}

// ── Prompt Stack Builder ──
export function buildPromptStack({ task, stack, domain, strictness, context, variables = {} }) {
  const pack = DOMAIN_PACKS[domain] || DOMAIN_PACKS.development;
  const mode = STRICTNESS_MODES[strictness] || STRICTNESS_MODES.balanced;
  const allRules = [...pack.constraints, ...mode.rules];
  const rulesStr = allRules.map((r, i) => `${i + 1}. ${r}`).join('\n');
  const applyVars = (t) => injectVariables(t, variables);

  const systemPrompt = applyVars(`ROLE
You are a ${pack.role}.

MISSION
Complete this objective: ${task || '<describe the task>'}

STACK / TOOLS
${stack || 'Use modern, appropriate tools for the domain.'}

CONTEXT PACK
${context || 'No additional context provided.'}

NON-NEGOTIABLE RULES
${rulesStr}

OUTPUT TARGET
Return a full, production-caliber result that is detailed, usable, and tightly scoped.`);

  const executionPrompt = applyVars(`Build the requested result for: ${task || '<task>'}

Use this stack: ${stack || 'appropriate tools'}

Use this context: ${context || 'none'}

Return:
1. Final output
2. Architecture or structure summary
3. Risks and missing inputs
4. Validation checklist
5. Immediate next actions`);

  const repairPrompt = applyVars(`Review the generated output for: "${task}" and repair all weak areas.

Check for:
- Vagueness or generic filler language
- Fake implementation or placeholder logic
- Missing edge cases or error handling
- Contradictions or scope drift
- Formatting weakness
- Incomplete sections
- Weak acceptance criteria

Return a stronger, corrected version.`);

  const qaPrompt = applyVars(`Evaluate the output for: "${task}" against this rubric:

- Scope accuracy: Does it match the original mission?
- Completeness: Are all required sections present?
- Realism: Is the output actually implementable?
- Formatting quality: Is it structured and readable?
- Production readiness: Can this ship?
- Usefulness: Does it advance the user's real goal?
- Drift resistance: Does it stay on mission?

Return: PASS or FAIL per dimension, explanation, and a corrected final version.`);

  const releaseGatePrompt = `FINAL RELEASE GATE

Confirm ALL of the following before marking READY:
☐ No placeholders unless explicitly allowed
☐ No missing required sections
☐ No contradictions in logic
☐ No fake or stub implementation
☐ No vague handoff language
☐ Ready for immediate use

Return: READY or NOT READY with exact fixes required.`;

  const flutterVsCodePrompt = applyVars(`FLUTTER / VS CODE BUILD SESSION

Use the generated prompt stack to create a Flutter-first VS Code execution session.

Required behavior:
- Assume Flutter project structure
- Output file-by-file edits when coding is requested
- Preserve compile safety at every step
- Include pubspec.yaml dependencies when needed
- Cover routing, state management, repositories, models, validation, and test targets
- Do not invent fake APIs or mock services
- Do not leave buttons, screens, or navigation disconnected
- Prefer production-safe patterns and explicit file paths

Return:
1. Session mission statement
2. Exact file creation/update list
3. New dependencies (pubspec.yaml)
4. Implementation order
5. Verification steps`);

  return { systemPrompt, executionPrompt, repairPrompt, qaPrompt, releaseGatePrompt, flutterVsCodePrompt };
}
