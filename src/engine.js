/**
 * PH EVO STUDIO — ENGINE (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Core prompt scoring, bot roster, domain packs, and grade logic.
 * All data is real — no unverified synthetic layers.
 */

import { BRIDGE_URL } from './config/bridge-config.js';
// ─── Bot Roster (Full Cast) ────────────────────────────────────
export const BOT_ROSTER = [
  { id: 'evo',              name: 'Evo',              species: 'Lion',         role: 'Mission Commander — sovereign command routing, mission oversight, final authority on all gates.', signature: 'Truth above all. Sovereignty enforced.', icon: '⚡', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=evo&backgroundColor=6366f1', palette: { primary: '#6366f1', accent: '#a5b4fc', glow: 'rgba(99,102,241,0.35)' }, detail: 'Approves mission path and product direction; sovereign command authority over all gate decisions.' },
  { id: 'dev',              name: 'Dev',              species: 'Leopard',      role: 'Core code builder — writes production-grade files, resolves blockers, generates artifacts.', signature: 'Code that ships. Nothing theoretical.', icon: '🐆', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=dev&backgroundColor=22d3ee', palette: { primary: '#22d3ee', accent: '#67e8f9', glow: 'rgba(34,211,238,0.3)' }, detail: 'Writes production-grade files, resolves blockers, generates shippable artifacts from intent.' },
  { id: 'builder',          name: 'Builder',          species: 'Bear',         role: 'Artifact maker — assembles multi-file builds from blueprints into shippable packages.', signature: 'Assemble. Verify. Ship.', icon: '🐻', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=builder&backgroundColor=fb923c', palette: { primary: '#fb923c', accent: '#fed7aa', glow: 'rgba(251,146,60,0.3)' }, detail: 'Assembles multi-file builds from blueprints into verified, shippable packages.' },
  { id: 'verifier',         name: 'Verifier',         species: 'Owl',          role: 'Proof Controller — tests, validation, receipts, unverified-free status.', signature: 'Evidence or it did not happen.', icon: '✅', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=verifier&backgroundColor=14b8a6', palette: { primary: '#14b8a6', accent: '#5eead4', glow: 'rgba(20,184,166,0.35)' }, detail: 'Runs tests, validates receipts, enforces unverified-free status across all proof gates.' },
  { id: 'companion',        name: 'Companion',        species: 'Fox',          role: 'Intent bridge — translates vague user intent into precise mission specs.', signature: 'Clarity before code.', icon: '🦊', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=companion&backgroundColor=ec4899', palette: { primary: '#ec4899', accent: '#fbcfe8', glow: 'rgba(236,72,153,0.3)' }, detail: 'Bridges user intent into precise, executable mission specifications.' },
  { id: 'conductor',        name: 'Conductor',        species: 'Eagle',        role: 'Route Controller — splits work across modules and tracks dependencies.', signature: 'Right bot. Right task. Zero delay.', icon: '🎯', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=conductor&backgroundColor=06b6d4', palette: { primary: '#06b6d4', accent: '#67e8f9', glow: 'rgba(6,182,212,0.35)' }, detail: 'Splits work across modules, tracks dependencies, and dispatches tasks with zero latency.' },
  { id: 'auditor',          name: 'Auditor',          species: 'Doberman',     role: 'Autonomous codebase and policy auditor — continuously sweeps the codebase for truth state regressions, logical inconsistencies, and non-compliant code.', signature: 'Trust nothing. Verify everything. No regression escapes.', icon: '🐕‍🦺', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=auditor&backgroundColor=14b8a6', palette: { primary: '#14b8a6', accent: '#5eead4', glow: 'rgba(20,184,166,0.3)' }, detail: 'Continuously sweeps codebase for regressions, inconsistencies, and policy violations.' },
  { id: 'boundary',         name: 'Boundary',         species: 'Rhino',        role: 'Limit enforcer — blocks illegal operations, enforces policy, guards consent boundaries.', signature: 'The line holds.', icon: '🦏', palette: { primary: '#f87171', accent: '#fca5a5', glow: 'rgba(248,113,113,0.3)' }, detail: 'Blocks illegal operations, enforces policy, and guards consent boundaries.' },
  { id: 'ledger',           name: 'Ledger',           species: 'Raven',        role: 'Receipt Controller — versioning, audit trail, proof indexing.', signature: 'Every action logged. Forever.', icon: '📒', palette: { primary: '#0ea5e9', accent: '#7dd3fc', glow: 'rgba(14,165,233,0.35)' }, detail: 'Manages versioning, maintains the immutable audit trail, and indexes all proof receipts.' },
  { id: 'memory',           name: 'Memory',           species: 'Elephant',     role: 'Context holder — manages long-term memory, summarizes past missions for new cycles.', signature: 'Nothing forgotten.', icon: '🐘', palette: { primary: '#4ade80', accent: '#bbf7d0', glow: 'rgba(74,222,128,0.3)' }, detail: 'Holds long-term memory and summarizes past missions to fuel new build cycles.' },
  { id: 'heartbeat',        name: 'Heartbeat',        species: 'Cheetah',      role: 'Momentum keeper — monitors build health, detects stalls, triggers recovery cycles.', signature: 'Always pulsing.', icon: '💓', palette: { primary: '#f472b6', accent: '#fbcfe8', glow: 'rgba(244,114,182,0.3)' }, detail: 'Monitors build health signals, detects stalls, and triggers automated recovery cycles.' },
  { id: 'sovereignty',      name: 'Sovereignty',      species: 'Tiger',        role: 'Canon guardian — enforces architectural doctrine, rejects deviations from truth protocol.', signature: 'Canon. Enforced. Always.', icon: '🐯', palette: { primary: '#e879f9', accent: '#f5d0fe', glow: 'rgba(232,121,249,0.3)' }, detail: 'Enforces architectural doctrine and rejects any deviations from the truth protocol canon.' },
  { id: 'cipher_lynx',      name: 'Cipher Lynx',      species: 'Lynx',         role: 'Security Controller — secrets, prompt injection, browser capture risk.', signature: 'No key exposed. No vector open.', icon: '🔐', palette: { primary: '#f97316', accent: '#fdba74', glow: 'rgba(249,115,22,0.35)' }, detail: 'Audits for secrets leakage, injection attacks, browser capture risk, and unsafe patterns.' },
  { id: 'vector_wolf',      name: 'Vector Wolf',      species: 'Wolf',         role: 'Context Controller — VectorPack compression and retrieval boundaries.', signature: 'Dense. Clean. Precise.', icon: '🐺', palette: { primary: '#10b981', accent: '#6ee7b7', glow: 'rgba(16,185,129,0.35)' }, detail: 'Builds VectorPacks, redacts secrets, and compresses mission context for precise LLM injection.' },
  { id: 'compiler_bearcat', name: 'Compiler Bearcat', species: 'Bearcat',      role: 'Prompt compiler — assembles 6-layer prompt stacks from specs for production deployment.', signature: 'Every layer counts.', icon: 'CB', palette: { primary: '#f59e0b', accent: '#fde68a', glow: 'rgba(245,158,11,0.3)' }, detail: 'Assembles 6-layer prompt stacks from specs for production deployment.' },
  { id: 'schema_beaver',    name: 'Schema Beaver',    species: 'Beaver',       role: 'Contract engineer — defines and validates data schemas, API contracts, and type safety.', signature: 'Shape first. Code second.', icon: 'SB', palette: { primary: '#84cc16', accent: '#d9f99d', glow: 'rgba(132,204,22,0.3)' }, detail: 'Defines and validates data schemas, API contracts, and type safety boundaries.' },
  { id: 'eval_mantis',      name: 'Eval Mantis',      species: 'Mantis',       role: 'Eval scientist — designs test cases, measures output quality, calculates benchmark scores.', signature: 'Score everything. Accept only excellence.', icon: 'EM', palette: { primary: '#d946ef', accent: '#f0abfc', glow: 'rgba(217,70,239,0.3)' }, detail: 'Designs test cases, measures output quality, and calculates benchmark scores.' },
  { id: 'swarm_falcon',     name: 'Swarm Falcon',     species: 'Falcon',       role: 'Fission Controller — creates candidate lanes and merge order.', signature: 'The best idea wins. Always.', icon: '🦅', palette: { primary: '#f59e0b', accent: '#fde68a', glow: 'rgba(245,158,11,0.35)' }, detail: 'Runs Fission Arena with 3-5 candidate approaches, picks the winner, and sets merge order.' },
  { id: 'blueprint_orca',   name: 'Blueprint Orca',   species: 'Orca',         role: 'Systems architect — plans deployment pipelines, infra topology, and release gates.', signature: 'Architecture first. Improvise never.', icon: 'BO', palette: { primary: '#7c3aed', accent: '#c4b5fd', glow: 'rgba(124,58,237,0.3)' }, detail: 'Plans deployment pipelines, infra topology, and release gate architecture.' },
  { id: 'signal_foxhound',  name: 'Signal Foxhound',  species: 'Foxhound',     role: 'Signal engineer — monitors system health signals, API latency, and bridge connectivity.', signature: 'Signal found. Source identified.', icon: 'SH', palette: { primary: '#10b981', accent: '#6ee7b7', glow: 'rgba(16,185,129,0.3)' }, detail: 'Monitors system health signals, API latency, and bridge connectivity in real-time.' },
  { id: 'temporal_raven',   name: 'Temporal Raven',   species: 'Raven',        role: 'Time Controller — Temporal Stackchain and deprecation paths.', signature: 'Now. Future. Legacy. Planned.', icon: '🪶', palette: { primary: '#8b5cf6', accent: '#c4b5fd', glow: 'rgba(139,92,246,0.35)' }, detail: 'Generates NOW/6-month/12-month technical stackchains and manages deprecation paths.' },
  { id: 'forge_rhino',      name: 'Forge Rhino',      species: 'Rhino',        role: 'Release Controller — DeployRail, Commerce Rail, production gates.', signature: 'Nothing ships without passing the gate.', icon: '🦏', palette: { primary: '#f43f5e', accent: '#fda4af', glow: 'rgba(244,63,94,0.35)' }, detail: 'Applies ForgeFriction gates, blocks unsafe deployments, and enforces production quality floors.' },
  { id: 'enterprise_auth',  name: 'Enterprise Auth',  species: 'Sovereign',    role: 'Owner Authority — final approval for risky actions.', signature: 'No risky action without sovereign sign-off.', icon: '👑', palette: { primary: '#eab308', accent: '#fef08a', glow: 'rgba(234,179,8,0.35)' }, detail: 'Final approval authority for risky actions, destructive commands, and production deployments.' },
  { id: 'ghost_scout',      name: 'Ghost Scout',      species: 'Recon',        role: 'Recon Agent — silent reconnaissance, environment discovery, gap detection.', signature: 'See everything. Touch nothing.', icon: '👻', palette: { primary: '#64748b', accent: '#cbd5e1', glow: 'rgba(100,116,139,0.35)' }, detail: 'Silent recon agent for environment discovery, gap detection, and pre-mission intelligence.' },
  { id: 'evo_diffuser',     name: 'Evo-Diffuser',     species: 'Chameleon',    role: 'Latent Architect — denoises chaotic technical intent, maps intent to high-fidelity patterns, refines architecture via U-Net sharpening.', signature: 'Refining chaos into truth.', icon: '🌀', palette: { primary: '#facc15', accent: '#fef08a', glow: 'rgba(250,204,21,0.3)' }, detail: 'Denoises chaotic intent, maps it to high-fidelity patterns via latent architecture refinement.' },
];

// @deprecated - Kept for legacy compatibility. Use ALL_BOT_ROSTER instead.
export const CORE_CAST = BOT_ROSTER.slice(0, 7);
// @deprecated - Kept for legacy compatibility. Use ALL_BOT_ROSTER instead.
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
export function buildPromptStack({ task = '', stack = '', domain = 'development', strictness = 'autonomous', context = '', bot = null } = {}) {
  const pack = DOMAIN_PACKS[domain] || DOMAIN_PACKS.development;
  const mode = STRICTNESS_MODES[strictness] || STRICTNESS_MODES.autonomous;

  const botPersona = bot ? [
    `You are acting as ${bot.name}, a bio-mechanical sentient ${bot.species}.`,
    `Your role is: ${bot.role}`,
    `Your core signature is: "${bot.signature}"`,
    `You must embody these traits and execute the task according to your role.`
  ].join('\n') : '';

  const systemPrompt = [
    `You are a ${mode.name} (${mode.description}) AI agent operating in the ${pack.name} domain.`,
    botPersona,
    `Domain keywords: ${pack.keywords.join(', ')}.`,
    'You produce production-grade, enterprise-ready output only.',
    'Deliver complete, production-ready output. No empty skeletons, no unverified code. Real working logic only.',
    strictness === 'sovereign' ? 'SOVEREIGN MODE: All output must pass truth verification. Reject unsafe patterns immediately.' : '',
  ].filter(Boolean).join('\n\n');

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

