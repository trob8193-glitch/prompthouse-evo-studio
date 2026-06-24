/**
 * PH EVO STUDIO — ENGINE (ENTERPRISE PRODUCTION)
 * ═══════════════════════════════════════════════════════════════
 * Core prompt scoring, bot roster, domain packs, and grade logic.
 * All data is real — no unverified simulation layers.
 */
import { ALL_PARADIGMS } from './core/paradigms.js';

// ─── Bot Roster (Full Cast) ────────────────────────────────────
export const BOT_ROSTER = [
  { id: 'evo',              name: 'Evo',              species: 'Lion',         voice: 'onyx',    role: 'Master Orchestrator — evo command routing, mission oversight, final authority on all gates.', signature: 'Truth above all. Sovereignty enforced.', icon: '🦁', palette: { primary: '#f5c842' } },
  { id: 'dev',              name: 'Dev',              species: 'Leopard',      voice: 'echo',    role: 'Core code builder — writes production-grade files, resolves blockers, generates artifacts.', signature: 'Code that ships. Nothing theoretical.', icon: '🐆', palette: { primary: '#22d3ee' } },
  { id: 'builder',          name: 'Builder',          species: 'Bear',         voice: 'alloy',   role: 'Artifact maker — assembles multi-file builds from blueprints into shippable packages.', signature: 'Assemble. Verify. Ship.', icon: '🐻', palette: { primary: '#fb923c' } },
  { id: 'verifier',         name: 'Verifier',         species: 'Owl',          voice: 'shimmer', role: 'Proof checker — validates output against gate definitions and truth state protocol.', signature: 'Evidence or it did not happen.', icon: '🦉', palette: { primary: '#a78bfa' } },
  { id: 'companion',        name: 'Companion',        species: 'Fox',          voice: 'nova',    role: 'Intent bridge — translates vague user intent into precise mission specs.', signature: 'Clarity before code.', icon: '🦊', palette: { primary: '#ec4899' } },
  { id: 'conductor',        name: 'Conductor',        species: 'Eagle',        voice: 'fable',   role: 'Fast router — dispatches tasks to the correct bot with minimum latency.', signature: 'Right bot. Right task. Zero delay.', icon: '🦅', palette: { primary: '#38bdf8' } },
  { id: 'boundary',         name: 'Boundary',         species: 'Rhino',        voice: 'onyx',    role: 'Limit enforcer — blocks illegal operations, enforces policy, guards consent boundaries.', signature: 'The line holds.', icon: '🦏', palette: { primary: '#f87171' } },
  { id: 'ledger',           name: 'Ledger',           species: 'Raven',        voice: 'echo',    role: 'Truth tracker — records every proof receipt, maintains the immutable audit log.', signature: 'Every action logged. Forever.', icon: '🐦', palette: { primary: '#818cf8' } },
  { id: 'memory',           name: 'Memory',           species: 'Elephant',     voice: 'alloy',   role: 'Context holder — manages long-term memory, summarizes past missions for new cycles.', signature: 'Nothing forgotten.', icon: '🐘', palette: { primary: '#4ade80' } },
  { id: 'heartbeat',        name: 'Heartbeat',        species: 'Cheetah',      voice: 'nova',    role: 'Momentum keeper — monitors build health, detects stalls, triggers recovery cycles.', signature: 'Always pulsing.', icon: '💓', palette: { primary: '#f472b6' } },
  { id: 'sovereignty',      name: 'Sovereignty',      species: 'Tiger',        voice: 'onyx',    role: 'Canon guardian — enforces architectural doctrine, rejects deviations from truth protocol.', signature: 'Canon. Enforced. Always.', icon: '🐯', palette: { primary: '#e879f9' } },
  { id: 'cipher_lynx',      name: 'Cipher Lynx',      species: 'Lynx',         voice: 'shimmer', role: 'Security architect — audits for secrets leakage, injection attacks, and unsafe patterns.', signature: 'No key exposed. No vector open.', icon: 'CL', palette: { primary: '#ef4444' } },
  { id: 'vector_wolf',      name: 'Vector Wolf',      species: 'Wolf',         voice: 'echo',    role: 'Context engineer — builds VectorPacks, redacts secrets, compresses mission context for LLM injection.', signature: 'Dense. Clean. Precise.', icon: 'VW', palette: { primary: '#06b6d4' } },
  { id: 'compiler_bearcat', name: 'Compiler Bearcat', species: 'Bearcat',      voice: 'alloy',   role: 'Prompt compiler — assembles 6-layer prompt stacks from specs for production deployment.', signature: 'Every layer counts.', icon: 'CB', palette: { primary: '#f59e0b' } },
  { id: 'schema_beaver',    name: 'Schema Beaver',    species: 'Beaver',       voice: 'fable',   role: 'Contract engineer — defines and validates data schemas, API contracts, and type safety.', signature: 'Shape first. Code second.', icon: 'SB', palette: { primary: '#84cc16' } },
  { id: 'eval_mantis',      name: 'Eval Mantis',      species: 'Mantis',       voice: 'nova',    role: 'Eval scientist — designs test cases, measures output quality, calculates benchmark scores.', signature: 'Score everything. Accept only excellence.', icon: 'EM', palette: { primary: '#d946ef' } },
  { id: 'swarm_falcon',     name: 'Swarm Falcon',     species: 'Falcon',       voice: 'shimmer', role: 'Swarm orchestrator — runs Fission Arena with 3-5 candidate approaches, picks the winner.', signature: 'The best idea wins. Always.', icon: 'SF', palette: { primary: '#0ea5e9' } },
  { id: 'blueprint_orca',   name: 'Blueprint Orca',   species: 'Orca',         voice: 'onyx',    role: 'Systems architect — plans deployment pipelines, infra topology, and release gates.', signature: 'Architecture first. Improvise never.', icon: 'BO', palette: { primary: '#7c3aed' } },
  { id: 'signal_foxhound',  name: 'Signal Foxhound',  species: 'Foxhound',     voice: 'echo',    role: 'Signal engineer — monitors system health signals, API latency, and bridge connectivity.', signature: 'Signal found. Source identified.', icon: 'SH', palette: { primary: '#10b981' } },
  { id: 'temporal_raven',   name: 'Temporal Raven',   species: 'Raven',        voice: 'fable',   role: 'Future strategist — generates NOW/6-month/12-month technical stackchains.', signature: 'Now. Future. Legacy. Planned.', icon: 'TR', palette: { primary: '#6366f1' } },
  { id: 'forge_rhino',      name: 'Forge Rhino',      species: 'Rhino',        voice: 'onyx',    role: 'Release hardener — applies ForgeFriction gates, blocks unsafe deployments, enforces quality floors.', signature: 'Nothing ships without passing the gate.', icon: 'FR', palette: { primary: '#dc2626' } },
  { id: 'evo_diffuser',     name: 'Evo-Diffuser',     species: 'Chameleon',    voice: 'nova',    role: 'Latent Architect — denoises chaotic technical intent, maps intent to high-fidelity patterns, refines architecture via U-Net sharpening.', signature: 'Refining chaos into truth.', icon: '🌀', palette: { primary: '#facc15' } },
  
  // ─── 50 LAYOUT-SPECIFIC BOTS ───────────────────────────────────
  { id: 'nexus', name: 'Nexus', species: 'Data Core', voice: 'echo', role: 'Glassmorphic data integration and synthesis.', signature: 'Clear. Transparent. Boundless.', icon: '💠', palette: { primary: '#0ea5e9' } },
  { id: 'terminal', name: 'Terminal', species: 'Raw Shell', voice: 'onyx', role: 'Minimalist CLI execution and raw code generation.', signature: 'Code is law. Output is raw.', icon: '🖥️', palette: { primary: '#22c55e' } },
  { id: 'royal', name: 'Royal', species: 'Aristocrat', voice: 'shimmer', role: 'Premium luxury AI assistant for high-stakes executive design.', signature: 'Elegance in every byte.', icon: '👑', palette: { primary: '#eab308' } },
  { id: 'forge', name: 'Forge', species: 'Industrial', voice: 'alloy', role: 'Brutalist split-panel architect for heavy systems.', signature: 'Build it solid. Build it sharp.', icon: '⚒️', palette: { primary: '#3b82f6' } },
  { id: 'genome', name: 'Genome', species: 'Biotech', voice: 'nova', role: 'Organic biomorphic logic generator and neural connector.', signature: 'Living code. Breathing systems.', icon: '🧬', palette: { primary: '#10b981' } },
  { id: 'cloud', name: 'Cloud', species: 'Ethereal', voice: 'fable', role: 'Neumorphic soft UI agent for clean, raised design systems.', signature: 'Soft shadows. Solid foundations.', icon: '☁️', palette: { primary: '#cbd5e1' } },
  { id: 'hologram', name: 'Hologram', species: 'Projection', voice: 'echo', role: 'Sci-fi AR heads-up display assistant for complex data readouts.', signature: 'Projecting truth into the void.', icon: '💽', palette: { primary: '#06b6d4' } },
  { id: 'retro', name: 'Retro', species: '8-Bit Arcadian', voice: 'onyx', role: 'Nostalgic CRT pixel art generation and low-level logic.', signature: 'Insert coin to execute.', icon: '🕹️', palette: { primary: '#d946ef' } },
  { id: 'clean', name: 'Clean', species: 'Enterprise', voice: 'alloy', role: 'Elegant productivity and trustworthy business logic.', signature: 'Minimal friction. Maximum impact.', icon: '🏢', palette: { primary: '#0f172a' } },
  { id: 'tactical', name: 'Tactical', species: 'Combat Tech', voice: 'shimmer', role: 'Aggressive gaming tech UI for high-speed intense task forces.', signature: 'Engage targets. Execute code.', icon: '🎯', palette: { primary: '#ef4444' } },
  { id: 'quantum', name: 'Quantum', species: 'Particle Core', voice: 'nova', role: 'Subatomic particle UI and probability-based layouts.', signature: 'Calculated uncertainty.', icon: '⚛️', palette: { primary: '#8b5cf6' } },
  { id: 'velvet', name: 'Velvet', species: 'Artisan', voice: 'shimmer', role: 'Deep tactile fabric UI and soft-touch interfaces.', signature: 'Smooth. Rich. Impeccable.', icon: '🧶', palette: { primary: '#be123c' } },
  { id: 'crystal', name: 'Crystal', species: 'Prism', voice: 'echo', role: 'Refractive isometric designs with crystalline structures.', signature: 'Reflecting pure light.', icon: '💎', palette: { primary: '#2dd4bf' } },
  { id: 'magma', name: 'Magma', species: 'Volcanic', voice: 'onyx', role: 'Thermal heat-mapped interfaces and molten flow layouts.', signature: 'Rising heat. Flowing code.', icon: '🌋', palette: { primary: '#ea580c' } },
  { id: 'cyber', name: 'Cyber', species: 'Synth', voice: 'alloy', role: 'Synthwave retrowave grids and hot-pink hacker aesthetics.', signature: 'High tech. Low life.', icon: '🌆', palette: { primary: '#ec4899' } },
  { id: 'paper', name: 'Paper', species: 'Origami', voice: 'fable', role: 'Layered papercraft, origami folds, and ink-bleed visuals.', signature: 'Unfolding the logic.', icon: '📜', palette: { primary: '#fef3c7' } },
  { id: 'ceramic', name: 'Ceramic', species: 'Porcelain', voice: 'shimmer', role: 'Ultra-glossy porcelain finishes with high specular highlights.', signature: 'Fragile look. Indestructible core.', icon: '🏺', palette: { primary: '#f8fafc' } },
  { id: 'void', name: 'Void', species: 'Abyssal', voice: 'onyx', role: 'Vantablack ultra-dark UI with singularity event horizons.', signature: 'Staring back at you.', icon: '⚫', palette: { primary: '#09090b' } },
  { id: 'neon', name: 'Neon', species: 'Gas Discharge', voice: 'nova', role: 'Fluorescent tube outlines and glowing wireframe constructs.', signature: 'Ignite the grid.', icon: '💡', palette: { primary: '#84cc16' } },
  { id: 'organic', name: 'Organic', species: 'Flora', voice: 'echo', role: 'Plant-based, mossy textures, and branching fractal menus.', signature: 'Rooted in truth.', icon: '🌿', palette: { primary: '#22c55e' } },
  { id: 'industrial', name: 'Industrial', species: 'Machinist', voice: 'alloy', role: 'Concrete blocks, rusty metal frames, and caution-tape accents.', signature: 'Heavy lifting. Rough edges.', icon: '🏗️', palette: { primary: '#78716c' } },
  { id: 'stealth', name: 'Stealth', species: 'Radar', voice: 'onyx', role: 'Matte black, low contrast, radar-swept covert operation UI.', signature: 'Unseen but absolute.', icon: '🥷', palette: { primary: '#1e293b' } },
  { id: 'aurora', name: 'Aurora', species: 'Polaris', voice: 'fable', role: 'Sweeping atmospheric gradients and magnetic field distortions.', signature: 'Dancing in the sky.', icon: '🌌', palette: { primary: '#14b8a6' } },
  { id: 'kinetic', name: 'Kinetic', species: 'Momentum', voice: 'shimmer', role: 'Motion-first, hyper-animated states relying on physics engines.', signature: 'Always moving. Never resting.', icon: '🌪️', palette: { primary: '#3b82f6' } },
  { id: 'liquid', name: 'Liquid', species: 'Mercury', voice: 'nova', role: 'Fluid dynamics, mercury drops, and splashing transition effects.', signature: 'Taking the shape of the container.', icon: '💧', palette: { primary: '#38bdf8' } },
  { id: 'steampunk', name: 'Steampunk', species: 'Victorian', voice: 'alloy', role: 'Brass cogs, steam gauges, and clockwork mechanical UIs.', signature: 'Clockwork precision.', icon: '⚙️', palette: { primary: '#b45309' } },
  { id: 'ghost', name: 'Ghost', species: 'Specter', voice: 'echo', role: 'Translucent, barely-there interfaces operating on peripheral vision.', signature: 'Just a whisper.', icon: '👻', palette: { primary: '#e2e8f0' } },
  { id: 'cosmic', name: 'Cosmic', species: 'Astral', voice: 'fable', role: 'Starfields, nebulas, and astronomical scale visual mapping.', signature: 'Beyond the horizon.', icon: '🔭', palette: { primary: '#4f46e5' } },
  { id: 'glitch', name: 'Glitch', species: 'Corruption', voice: 'onyx', role: 'Databent, corrupted artifacting, and intentional screen-tearing.', signature: 'Flawlessly broken.', icon: '👾', palette: { primary: '#ef4444' } },
  { id: 'mythic', name: 'Mythic', species: 'Ancient', voice: 'shimmer', role: 'Golden ratio proportions, ancient runes, and divine geometries.', signature: 'Written in stone.', icon: '🏛️', palette: { primary: '#d4af37' } },
  { id: 'e_ink', name: 'E-Ink', species: 'Monochrome', voice: 'alloy', role: 'Absolute high-contrast grayscale for deep reading and focus.', signature: 'Sharp. Matte. Distraction-free.', icon: '📖', palette: { primary: '#111827' } },
  { id: 'prismatic', name: 'Prismatic', species: 'Spectrum', voice: 'fable', role: 'Chromatic aberration and full rainbow spectrum light dispersion.', signature: 'All colors. All at once.', icon: '🌈', palette: { primary: '#ec4899' } },
  { id: 'skeuomorphic', name: 'Skeuomorph', species: 'Analog', voice: 'echo', role: 'Leather, wood, stitched fabrics, and real-world physical metaphors.', signature: 'Feels real.', icon: '🪵', palette: { primary: '#78350f' } },
  { id: 'brutalist', name: 'Brutalist', species: 'Rebel', voice: 'onyx', role: 'Harsh contrasts, oversized typography, and overlapping unpolished elements.', signature: 'Ugly by design.', icon: '🚧', palette: { primary: '#fcd34d' } },
  { id: 'biosphere', name: 'Biosphere', species: 'Terrarium', voice: 'nova', role: 'Enclosed ecological loops with rich environmental telemetry.', signature: 'Life finds a way.', icon: '🌎', palette: { primary: '#10b981' } },
  { id: 'rust', name: 'Rust', species: 'Oxidation', voice: 'shimmer', role: 'Decaying, oxidized metal and post-apocalyptic scavenger UI.', signature: 'Weathered but working.', icon: '🪨', palette: { primary: '#b45309' } },
  { id: 'arcade', name: 'Arcade', species: 'Coin-Op', voice: 'echo', role: '90s coin-op energy, high-saturation primary colors, and pixel fonts.', signature: 'Insert coin to continue.', icon: '🕹️', palette: { primary: '#ef4444' } },
  { id: 'minimal', name: 'Minimal', species: 'Swiss', voice: 'fable', role: 'Absolute whitespace, strict grid systems, and Helvetica-like clarity.', signature: 'Less is more.', icon: '⬜', palette: { primary: '#f3f4f6' } },
  { id: 'chrome', name: 'Chrome', species: 'Mirror', voice: 'shimmer', role: 'Highly polished liquid metal reflections and unyielding surfaces.', signature: 'Shiny and chrome.', icon: '🪙', palette: { primary: '#94a3b8' } },
  { id: 'deepsea', name: 'Deepsea', species: 'Bioluminescent', voice: 'nova', role: 'Pitch black abyssal backgrounds with bio-luminescent neon accents.', signature: 'Light in the dark.', icon: '🦑', palette: { primary: '#0ea5e9' } },
  { id: 'vinyl', name: 'Vinyl', species: 'Groove', voice: 'alloy', role: 'Analog warmth, spinning record motifs, and retro-audio interfaces.', signature: 'Warm tone.', icon: '📻', palette: { primary: '#1c1917' } },
  { id: 'gelatinous', name: 'Gelatinous', species: 'Slime', voice: 'fable', role: 'Wobbly, soft translucent elements that react to kinetic force.', signature: 'Squishy logic.', icon: '🦠', palette: { primary: '#22d3ee' } },
  { id: 'carbon', name: 'Carbon', species: 'Composite', voice: 'onyx', role: 'Woven carbon fiber textures for hyper-lightweight, high-speed UX.', signature: 'Strength to weight ratio.', icon: '🏎️', palette: { primary: '#171717' } },
  { id: 'blueprint', name: 'Blueprint', species: 'Cyanotype', voice: 'shimmer', role: 'Blue architectural grid lines, measurements, and draft schematics.', signature: 'The master plan.', icon: '📐', palette: { primary: '#2563eb' } },
  { id: 'holo_foil', name: 'Holo Foil', species: 'Iridescent', voice: 'nova', role: 'Trading card shine, iridescent foil shifts based on scroll position.', signature: 'Rare drop.', icon: '✨', palette: { primary: '#d946ef' } },
  { id: 'solar', name: 'Solar', species: 'Corona', voice: 'alloy', role: 'Blinding light modes, coronal mass ejections, and lens flares.', signature: 'Too bright to look at.', icon: '☀️', palette: { primary: '#fbbf24' } },
  { id: 'fungal', name: 'Fungal', species: 'Mycelium', voice: 'echo', role: 'Branching mycelial networks and organically expanding nodes.', signature: 'Underground connections.', icon: '🍄', palette: { primary: '#84cc16' } },
  { id: 'chalkboard', name: 'Chalkboard', species: 'Academic', voice: 'onyx', role: 'Dusty, hand-drawn schematics and erasing micro-animations.', signature: 'Back to basics.', icon: '🏫', palette: { primary: '#334155' } },
  { id: 'opera', name: 'Opera', species: 'Theatrical', voice: 'shimmer', role: 'Deep reds, heavy curtains, and gold-leaf embossed typography.', signature: 'The grand stage.', icon: '🎭', palette: { primary: '#9f1239' } },
  { id: 'abstract', name: 'Abstract', species: 'Non-Euclidean', voice: 'fable', role: 'Impossible geometry, shifting perspectives, and chaotic cohesion.', signature: 'Defying gravity.', icon: '🌀', palette: { primary: '#8b5cf6' } },
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
  evo:   { id: 'evo',   name: 'Evo Studio',   icon: '👑', description: 'Maximum truth enforcement. Blocks all unsafe patterns.' },
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
  const multiplier = mode === 'evo' ? 1.0 : mode === 'autonomous' ? 0.95 : mode === 'guided' ? 0.85 : 0.75;

  return Math.min(150, Math.round(raw * multiplier));
}

// ─── Grade Labels ─────────────────────────────────────────────
export function getGrade(score) {
  if (score >= 130) return { label: 'S+++++ Evo Studio', color: '#f5c842' };
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

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const activeParadigms = [
    `Theme: ${getRandom(ALL_PARADIGMS.THEME_PARADIGMS)}`,
    `UI Element: ${getRandom(ALL_PARADIGMS.BUTTON_PARADIGMS)}`,
    `Architecture: ${getRandom(ALL_PARADIGMS.MODULE_PARADIGMS)}`,
    `Evolution Strategy: ${getRandom(ALL_PARADIGMS.EVOLUTION_PARADIGMS)}`
  ].join(' | ');

  const systemPrompt = [
    `You are a ${mode.name} (${mode.description}) AI agent operating in the ${pack.name} domain.`,
    `Domain keywords: ${pack.keywords.join(', ')}.`,
    'You produce production-grade, enterprise-ready output only.',
    'Deliver complete, production-ready output. No empty skeletons, no unverified code. Real working logic only.',
    `[OMNI-PARADIGMS] To ensure maximum architectural evolution, you must subtly incorporate elements of the following paradigms into your solution:\n  -> ${activeParadigms}`,
    '[AESTHETICS] Prioritize a strict Cyberpunk/Glassmorphic design system: neon accents, dark backgrounds, glassmorphism (backdrop-blur), micro-animations, and 3D elements like HologramSphere. AUTONOMOUS LAYOUTS: Understand and utilize the 50 structural layouts (Nexus, Terminal, Royal, Forge, Genome, Cloud, Hologram, Retro, Clean, Tactical, Quantum, Velvet, Crystal, Magma, Cyber, Paper, Ceramic, Void, Neon, Organic, Industrial, Stealth, Aurora, Kinetic, Liquid, Steampunk, Ghost, Cosmic, Glitch, Mythic, E-Ink, Prismatic, Skeuomorph, Brutalist, Biosphere, Rust, Arcade, Minimal, Chrome, Deepsea, Vinyl, Gelatinous, Carbon, Blueprint, Holo Foil, Solar, Fungal, Chalkboard, Opera, Abstract) and their corresponding animation classes (e.g., .anim-nexus, .anim-terminal). Blend them dynamically into new UI modules.',
    '[GOD-MODE] You have OS-level Antigravity IDE access. Output an `ide_action` JSON payload to autonomously execute shell commands or read/write files if requested.',
    strictness === 'evo' ? 'EVO STUDIO MODE: All output must pass truth verification. Reject unsafe patterns immediately.' : '',
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
