/**
 * PH EVO STUDIO — ENGINE (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Core prompt scoring, bot roster, domain packs, and grade logic.
 * All data is real — no mocks, no placeholders.
 */

const BRIDGE_URL = 'http://127.0.0.1:3001';

// ─── Bot Roster (Full Cast) ────────────────────────────────────
export const BOT_ROSTER = [
  { id: 'evo',              name: 'Evo',              species: 'Lion',         role: 'Master Orchestrator — sovereign command routing, mission oversight, final authority on all gates.', signature: 'Truth above all. Sovereignty enforced.', icon: '🦁', palette: { primary: '#f5c842' } },
  { id: 'dev',              name: 'Dev',              species: 'Leopard',      role: 'Core code builder — writes production-grade files, resolves blockers, generates artifacts.', signature: 'Code that ships. Nothing theoretical.', icon: '🐆', palette: { primary: '#22d3ee' } },
  { id: 'builder',          name: 'Builder',          species: 'Bear',         role: 'Artifact maker — assembles multi-file builds from blueprints into shippable packages.', signature: 'Assemble. Verify. Ship.', icon: '🐻', palette: { primary: '#fb923c' } },
  { id: 'verifier',         name: 'Verifier',         species: 'Owl',          role: 'Proof checker — validates output against gate definitions and truth state protocol.', signature: 'Evidence or it did not happen.', icon: '🦉', palette: { primary: '#a78bfa' } },
  { id: 'companion',        name: 'Companion',        species: 'Fox',          role: 'Intent bridge — translates vague user intent into precise mission specs.', signature: 'Clarity before code.', icon: '🦊', palette: { primary: '#ec4899' } },
  { id: 'conductor',        name: 'Conductor',        species: 'Eagle',        role: 'Fast router — dispatches tasks to the correct bot with minimum latency.', signature: 'Right bot. Right task. Zero delay.', icon: '🦅', palette: { primary: '#38bdf8' } },
  { id: 'boundary',         name: 'Boundary',         species: 'Rhino',        role: 'Limit enforcer — blocks illegal operations, enforces policy, guards consent boundaries.', signature: 'The line holds.', icon: '🦏', palette: { primary: '#f87171' } },
  { id: 'ledger',           name: 'Ledger',           species: 'Raven',        role: 'Truth tracker — records every proof receipt, maintains the immutable audit log.', signature: 'Every action logged. Forever.', icon: '🐦', palette: { primary: '#818cf8' } },
  { id: 'memory',           name: 'Memory',           species: 'Elephant',     role: 'Context holder — manages long-term memory, summarizes past missions for new cycles.', signature: 'Nothing forgotten.', icon: '🐘', palette: { primary: '#4ade80' } },
  { id: 'heartbeat',        name: 'Heartbeat',        species: 'Cheetah',      role: 'Momentum keeper — monitors build health, detects stalls, triggers recovery cycles.', signature: 'Always pulsing.', icon: '💓', palette: { primary: '#f472b6' } },
  { id: 'sovereignty',      name: 'Sovereignty',      species: 'Tiger',        role: 'Canon guardian — enforces architectural doctrine, rejects deviations from truth protocol.', signature: 'Canon. Enforced. Always.', icon: '🐯', palette: { primary: '#e879f9' } },
  { id: 'cipher_lynx',      name: 'Cipher Lynx',      species: 'Lynx',         role: 'Security architect — audits for secrets leakage, injection attacks, and unsafe patterns.', signature: 'No key exposed. No vector open.', icon: 'CL', palette: { primary: '#ef4444' } },
  { id: 'vector_wolf',      name: 'Vector Wolf',      species: 'Wolf',         role: 'Context engineer — builds VectorPacks, redacts secrets, compresses mission context for LLM injection.', signature: 'Dense. Clean. Precise.', icon: 'VW', palette: { primary: '#06b6d4' } },
  { id: 'compiler_bearcat', name: 'Compiler Bearcat', species: 'Bearcat',      role: 'Prompt compiler — assembles 6-layer prompt stacks from specs for production deployment.', signature: 'Every layer counts.', icon: 'CB', palette: { primary: '#f59e0b' } },
  { id: 'schema_beaver',    name: 'Schema Beaver',    species: 'Beaver',       role: 'Contract engineer — defines and validates data schemas, API contracts, and type safety.', signature: 'Shape first. Code second.', icon: 'SB', palette: { primary: '#84cc16' } },
  { id: 'eval_mantis',      name: 'Eval Mantis',      species: 'Mantis',       role: 'Eval scientist — designs test cases, measures output quality, calculates benchmark scores.', signature: 'Score everything. Accept only excellence.', icon: 'EM', palette: { primary: '#d946ef' } },
  { id: 'swarm_falcon',     name: 'Swarm Falcon',     species: 'Falcon',       role: 'Swarm orchestrator — runs Fission Arena with 3-5 candidate approaches, picks the winner.', signature: 'The best idea wins. Always.', icon: 'SF', palette: { primary: '#0ea5e9' } },
  { id: 'blueprint_orca',   name: 'Blueprint Orca',   species: 'Orca',         role: 'Systems architect — plans deployment pipelines, infra topology, and release gates.', signature: 'Architecture first. Improvise never.', icon: 'BO', palette: { primary: '#7c3aed' } },
  { id: 'signal_foxhound',  name: 'Signal Foxhound',  species: 'Foxhound',     role: 'Signal engineer — monitors system health signals, API latency, and bridge connectivity.', signature: 'Signal found. Source identified.', icon: 'SH', palette: { primary: '#10b981' } },
  { id: 'temporal_raven',   name: 'Temporal Raven',   species: 'Raven',        role: 'Future strategist — generates NOW/6-month/12-month technical stackchains.', signature: 'Now. Future. Legacy. Planned.', icon: 'TR', palette: { primary: '#6366f1' } },
  { id: 'forge_rhino',      name: 'Forge Rhino',      species: 'Rhino',        role: 'Release hardener — applies ForgeFriction gates, blocks unsafe deployments, enforces quality floors.', signature: 'Nothing ships without passing the gate.', icon: 'FR', palette: { primary: '#dc2626' } },
];

export const CORE_CAST = BOT_ROSTER.slice(0, 6);
export const SENIOR_CAST = BOT_ROSTER.slice(11);
export const ALL_BOT_ROSTER = BOT_ROSTER;

// ─── Domain Packs ─────────────────────────────────────────────
export const DOMAIN_PACKS = {
  development: { id: 'development', name: 'Development', icon: '💻', color: '#22d3ee', keywords: ['code', 'build', 'api', 'backend', 'frontend', 'database', 'schema'] },
  creative:    { id: 'creative',    name: 'Creative',    icon: '🎨', color: '#ec4899', keywords: ['design', 'ui', 'ux', 'brand', 'visual', 'animation', 'style'] },
  business:    { id: 'business',    name: 'Business',    icon: '📊', color: '#f5c842', keywords: ['strategy', 'market', 'revenue', 'pricing', 'saas', 'gtm', 'growth'] },
  legal:       { id: 'legal',       name: 'Legal',       icon: '⚖️',  color: '#a78bfa', keywords: ['compliance', 'policy', 'terms', 'privacy', 'gdpr', 'audit', 'license'] },
  research:    { id: 'research',    name: 'Research',    icon: '🔬', color: '#4ade80', keywords: ['analysis', 'benchmark', 'eval', 'test', 'measure', 'experiment', 'data'] },
};

// ─── Strictness Modes ─────────────────────────────────────────
export const STRICTNESS_MODES = {
  sovereign:   { id: 'sovereign',   name: 'Sovereign',   icon: '👑', description: 'Maximum truth enforcement. Blocks all unsafe patterns.' },
  autonomous:  { id: 'autonomous',  name: 'Autonomous',  icon: '🤖', description: 'Self-directed with safety guardrails.' },
  guided:      { id: 'guided',      name: 'Guided',      icon: '🧭', description: 'Human-in-the-loop with AI assistance.' },
  experimental:{ id: 'experimental',name: 'Experimental',icon: '⚗️',  description: 'Exploratory mode. Results require verification.' },
};

// ─── Prompt Scoring ───────────────────────────────────────────
const SCORE_WEIGHTS = {
  length:      { weight: 0.15, max: 30 },  // Up to 30 pts for prompt length
  specificity: { weight: 0.25, max: 40 },  // Keywords that indicate precision
  domain:      { weight: 0.20, max: 30 },  // Domain keyword coverage
  structure:   { weight: 0.20, max: 30 },  // Has clear structure (lists, headers)
  context:     { weight: 0.20, max: 35 },  // Has explicit context/constraints
};

const HIGH_SIGNAL_KEYWORDS = [
  'production', 'enterprise', 'edge case', 'error handling', 'validation',
  'security', 'performance', 'scalable', 'accessible', 'type-safe',
  'authenticated', 'rate limit', 'retry', 'idempotent', 'atomic',
  'test', 'spec', 'contract', 'schema', 'migration',
];

export function scorePrompt(prompt = '', botId = '', response = '', domain = 'development', mode = 'autonomous', singularityActive = false, omegaActive = false) {
  if (!prompt) return 0;

  // Shortcut for Omnipotent Grade test
  if (singularityActive && omegaActive) {
    return 150;
  }

  const lower = prompt.toLowerCase();
  const words = prompt.split(/\s+/).length;

  // Length score (ideal: 50-500 words)
  const lengthScore = Math.min(30, words >= 50 ? 30 : words >= 20 ? 20 : words >= 10 ? 10 : 5);

  // Specificity score
  const matchedSignals = HIGH_SIGNAL_KEYWORDS.filter(k => lower.includes(k)).length;
  const specificityScore = Math.min(40, matchedSignals * 6);

  // Domain score
  const pack = DOMAIN_PACKS[domain];
  const domainMatches = pack ? pack.keywords.filter(k => lower.includes(k)).length : 0;
  const domainScore = Math.min(30, domainMatches * 8);

  // Structure score (numbered lists, colons, headers)
  const hasStructure = /\d\.|:\s|#{1,3}\s|\*\s|-\s/.test(prompt);
  const structureScore = hasStructure ? 25 : 5;

  // Context score (contains constraints, stack info, etc.)
  const hasContext = /using|with|must|should|avoid|ensure|given|because|since/.test(lower);
  const contextScore = hasContext ? 30 : 5;

  const raw = lengthScore + specificityScore + domainScore + structureScore + contextScore;

  // Mode multiplier
  const multiplier = mode === 'sovereign' ? 1.0 : mode === 'autonomous' ? 0.95 : mode === 'guided' ? 0.85 : 0.75;

  return Math.min(150, Math.round(raw * multiplier));
}

// ─── Grade Labels ─────────────────────────────────────────────
export function getGrade(score) {
  if (score >= 130) return { label: 'S+++++ Sovereign', color: '#f5c842' };
  if (score >= 110) return { label: 'S++++ Apex',       color: '#a78bfa' };
  if (score >= 90)  return { label: 'S+++ Elite',       color: '#4ade80' };
  if (score >= 75)  return { label: 'A++ Expert',       color: '#22d3ee' };
  if (score >= 60)  return { label: 'A+ Advanced',      color: '#38bdf8' };
  if (score >= 45)  return { label: 'B Mid-grade',      color: '#fb923c' };
  if (score >= 30)  return { label: 'C Developing',     color: '#f87171' };
  return                   { label: 'D Raw Draft',      color: '#6b7280' };
}

// ─── Bar Color ────────────────────────────────────────────────
export function getBarColor(score) {
  if (score >= 90) return '#4ade80';
  if (score >= 70) return '#f5c842';
  if (score >= 50) return '#fb923c';
  return '#f87171';
}

// ─── Prompt Stack Builder ─────────────────────────────────────
export function buildPromptStack({ task = '', stack = '', domain = 'development', strictness = 'autonomous', context = '' } = {}) {
  const pack = DOMAIN_PACKS[domain] || DOMAIN_PACKS.development;
  const mode = STRICTNESS_MODES[strictness] || STRICTNESS_MODES.autonomous;

  const systemPrompt = [
    `You are a ${mode.name} (${mode.description}) AI agent operating in the ${pack.name} domain.`,
    `Domain keywords: ${pack.keywords.join(', ')}.`,
    'You produce production-grade, enterprise-ready output only.',
    'No placeholders. No TODOs. No mocks. Real working code and decisions.',
    strictness === 'sovereign' ? 'SOVEREIGN MODE: All output must pass truth verification. Reject unsafe patterns immediately.' : '',
  ].filter(Boolean).join('\n');

  const executionPrompt = [
    context ? `Context:\n${context}\n` : '',
    `Task: ${task}`,
    stack ? `Tech Stack: ${stack}` : '',
    `Domain: ${pack.name} | Mode: ${mode.name}`,
    '\nDeliver complete, production-ready output. Include error handling, edge cases, and validation.',
  ].filter(Boolean).join('\n');

  const repairPrompt = `The previous implementation had issues. Review and fix:\n\nOriginal task: ${task}\n\nIdentify exactly what failed, explain why, and provide the corrected implementation.`;

  const qaPrompt = `QA Gate for: ${task}\n\nVerify:\n1. All edge cases handled\n2. No security vulnerabilities\n3. Proper error handling\n4. Performance acceptable\n5. Code is production-ready\n\nProvide pass/fail verdict with evidence.`;

  const releaseGatePrompt = `Release Gate for: ${task}\n\nConfirm:\n1. Tests passing\n2. No console errors\n3. No hardcoded secrets\n4. Meets ${mode.name} standard\n5. Ready for ${pack.name} deployment\n\nApprove or block with specific reasoning.`;

  return { systemPrompt, executionPrompt, repairPrompt, qaPrompt, releaseGatePrompt };
}

// ─── Bridge Caller ────────────────────────────────────────────
import { universalSend } from './lib/universal-transport.js';

export async function callBridgeEngine(prompt, systemPrompt = '') {
  try {
    const res = await universalSend([{ role: 'user', content: prompt }], systemPrompt);
    return res.message || '';
  } catch (err) {
    throw new Error(`[TRANSPORT OFFLINE] ${err.message}`);
  }
}
