import fs from 'fs';
import path from 'path';

const DEFAULT_MEMORY_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'evolution', 'memory', 'patterns.json');

export function loadEvolutionMemory(file = DEFAULT_MEMORY_FILE()) {
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}

function saveEvolutionMemory(memory, file = DEFAULT_MEMORY_FILE()) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(memory, null, 2), 'utf8');
  return memory;
}

function classify(receipt = {}) {
  const objective = String(receipt.objective || '').toLowerCase();
  if (objective.includes('bridge') || objective.includes('env')) return 'hardcoded local bridge URL';
  if (objective.includes('truth') || objective.includes('unverified') || objective.includes('hype')) return 'unverified completion language';
  return 'general studio hardening';
}

export function recordEvolutionOutcome({ receipt, file = DEFAULT_MEMORY_FILE() } = {}) {
  const memory = loadEvolutionMemory(file);
  const pattern = classify(receipt);
  let entry = memory.find(item => item.pattern === pattern);
  if (!entry) {
    entry = { pattern, category: 'self_evolution', successfulFixes: 0, failedFixes: 0, preferredRepair: '', risk: 'LOW', lastSeen: null, examples: [] };
    memory.push(entry);
  }
  const passed = receipt?.truthState === 'PROOF_PASSED' || receipt?.truthState === 'MERGED';
  if (passed) entry.successfulFixes += 1;
  else entry.failedFixes += 1;
  entry.lastSeen = new Date().toISOString();
  entry.examples = [...new Set([...(entry.examples || []), receipt?.id].filter(Boolean))].slice(-20);
  if (!entry.preferredRepair && passed) entry.preferredRepair = receipt?.proposal?.objective || receipt?.objective || '';
  return saveEvolutionMemory(memory, file);
}

export function suggestRepairFromMemory({ diagnostics } = {}) {
  const memory = loadEvolutionMemory();
  return memory
    .slice()
    .sort((a, b) => (b.successfulFixes - b.failedFixes) - (a.successfulFixes - a.failedFixes))
    .slice(0, 5);
}

export function scoreKnownRisk({ proposal } = {}) {
  const memory = loadEvolutionMemory();
  const paths = (proposal?.files || []).map(file => file.path).join(' ');
  const risky = memory.filter(item => item.failedFixes > item.successfulFixes && paths.toLowerCase().includes(String(item.pattern).toLowerCase()));
  return risky.length ? { level: 'MEDIUM', reasons: risky.map(item => `Known risky pattern: ${item.pattern}`) } : { level: 'LOW', reasons: [] };
}
