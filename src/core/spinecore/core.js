import fs from 'fs';
import path from 'path';

export const SPINECORE_VERSION = '1.0.0';
export const SPINECORE_ROOT = '.evo-spinecore';

export const SPINECORE_MODULES = [
  'CURRICULUM',
  'LESSON_CAPTURE',
  'RANKING',
  'QUEUE',
  'SCENARIOS',
  'ARENA',
  'CONTRACT',
  'DIFFS',
  'HEATMAP',
  'PROMPT_VARIANTS',
  'CAPSULES',
  'STOP_GATE',
  'ORCHESTRATOR'
];

export const SPINECORE_SKILLS = [
  'react-repair',
  'vite-build',
  'cost-firewall',
  'prompt-engineering',
  'ui-theme',
  'github-pr',
  'firebase',
  'stripe',
  'maps-gps',
  'flutter',
  'security-rules',
  'truth-labeling',
  'evolution-cycle'
];

export const SPINECORE_CONTRACT = [
  'Claim command results only when a receipt or direct tool result exists.',
  'Require job id, cost gate result, owner approval, and receipt for external model updates.',
  'Run cost checks before paid provider actions.',
  'Extend existing studio modules before creating new architecture.',
  'Require evaluation, receipt, and rollback path before promotion.',
  'Truth-label built, blocked, verified, and local-proof-required states.',
  'Prefer local learning capture before provider actions.',
  'Preserve owner approval gates for spending, publishing, deletion, and provider actions.'
];

export function nowIso() { return new Date().toISOString(); }
export function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
export function readJson(file, fallback = null) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }
export function writeJson(file, value) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); return file; }
export function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(file => file.endsWith('.json')).map(file => readJson(path.join(dir, file), null)).filter(Boolean);
}
export function spinePaths(rootDir = process.cwd()) {
  const base = path.join(rootDir, SPINECORE_ROOT);
  return {
    base,
    receipts: path.join(base, 'receipts'),
    queue: path.join(base, 'queue'),
    lessons: path.join(base, 'lessons'),
    scenarios: path.join(base, 'scenarios'),
    capsules: path.join(base, 'capsules'),
    prompts: path.join(base, 'prompt-variants'),
    diffs: path.join(base, 'diffs'),
    contract: path.join(base, 'behavior-contract.json'),
    heatmap: path.join(base, 'weakness-heatmap.json'),
    stopGate: path.join(base, 'stop-gate.json'),
    status: path.join(base, 'status.json')
  };
}
export function evolutionReceiptDir(rootDir = process.cwd()) {
  return path.join(rootDir, '.prompthouse-data', 'evolution', 'receipts');
}
