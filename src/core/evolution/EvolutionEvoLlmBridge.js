import fs from 'fs';
import path from 'path';
import { buildEvoLlmDataset, evaluateEvoLlmDataset, writeEvoLlmTrainingReceipt } from '../evo-llm/index.js';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(file, fallback = null) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function compact(value, max = 1600) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function buildEvolutionTrainingExample({ receipt = {}, result = {} } = {}) {
  const objective = compact(receipt.objective || result.objective || 'Self-evolution studio improvement cycle');
  const truthState = compact(result.truthState || receipt.truthState || 'UNKNOWN');
  const proposalSummary = compact(receipt.proposal?.summary || receipt.proposal?.title || 'Self-evolution proposal completed a gated analysis step.');
  const blockers = Array.isArray(receipt.blockedReasons) ? receipt.blockedReasons : [];
  const proofSummary = result.proof ? compact(JSON.stringify(result.proof), 1200) : 'No proof object was attached to this cycle result.';

  return {
    id: `self_evolution_${receipt.runId || result.runId || Date.now()}`,
    system: 'You are Evo LLM for PromptHouse Evo Studio. Learn from self-evolution cycles while staying truth-bound, receipt-backed, and approval-gated.',
    instruction: `Analyze this self-evolution cycle and explain the next safest studio improvement. Objective: ${objective}. Truth state: ${truthState}.`,
    response: [
      `Cycle truth state: ${truthState}.`,
      `Proposal summary: ${proposalSummary}`,
      blockers.length ? `Blocked reasons: ${blockers.join('; ')}` : 'No blocker list was recorded for this cycle.',
      `Proof summary: ${proofSummary}`,
      'Next safest improvement: keep the change behind proof gates, update receipts, run audits/tests/build, and require owner approval before promotion.'
    ].join('\n'),
    tags: ['self-evolution', 'evo-llm', 'receipt-learning'],
    source: 'self-evolution-bridge',
    truthPolicy: 'truth-bound-production-only'
  };
}

export function recordEvolutionForEvoLlm({ rootDir = process.cwd(), receipt = {}, result = {} } = {}) {
  const trainingDir = path.join(rootDir, '.evo-llm', 'training-data');
  const bridgeFile = path.join(trainingDir, 'self-evolution-examples.json');
  ensureDir(trainingDir);

  const existing = readJsonSafe(bridgeFile, []);
  const examples = Array.isArray(existing) ? existing : [];
  const example = buildEvolutionTrainingExample({ receipt, result });
  const deduped = examples.filter((item) => item.id !== example.id);
  deduped.push(example);
  writeJson(bridgeFile, deduped);

  const manifest = buildEvoLlmDataset({ rootDir });
  const evaluation = evaluateEvoLlmDataset({ rootDir });
  const trainingReceipt = writeEvoLlmTrainingReceipt({ rootDir });

  return {
    success: true,
    truthState: 'SELF_EVOLUTION_CAPTURED_FOR_EVO_LLM',
    exampleId: example.id,
    exampleFile: path.relative(rootDir, bridgeFile),
    manifest,
    evaluation,
    trainingReceiptFile: path.relative(rootDir, trainingReceipt.file)
  };
}
