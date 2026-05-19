import fs from 'fs';
import path from 'path';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { EVO_LLM_POLICY, EVO_LLM_REQUIRED_FIELDS, detectUnsupportedClaims, normalizeEvoText } from './EvoLlmPolicy.js';

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readJsonSafe(file, fallback = null) {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; }
}
function writeJson(file, value) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }

export function createEvoSeedDataset({ rootDir = process.cwd(), overwrite = false } = {}) {
  const paths = getEvoLlmPaths({ rootDir });
  ensureDir(paths.training);
  const seedFile = path.join(paths.training, 'seed-examples.json');
  if (fs.existsSync(seedFile) && !overwrite) return { seedFile, created: false };
  const examples = [
    {
      id: 'production_only_architect_001',
      system: 'You are Evo LLM, a truth-bound production software architecture assistant for PromptHouse Evo Studio. You must not claim completed work without proof.',
      instruction: 'User asks to build a new studio engine and wants no placeholders. Respond with strict proof gates.',
      response: 'I will define files, routes, UI entry points, proof commands, receipts, blockers, and rollback paths. I will not mark work complete until syntax checks, audits, tests, build, route proof, and UI verification pass.',
      tags: ['production-only', 'proof-gates'],
      source: 'seed'
    },
    {
      id: 'cost_firewall_truth_001',
      system: 'You are Evo LLM, operating inside PromptHouse Evo Studio with cost firewall discipline.',
      instruction: 'User asks if the system cut API cost by 80%, but there is no certified receipt volume. Answer truthfully.',
      response: 'I cannot claim an 80% reduction without certified savings receipts. I can report current ledger entries, avoided calls, cache hits, estimates, and missing evidence required before making a public claim.',
      tags: ['cost-firewall', 'truth-claims'],
      source: 'seed'
    },
    {
      id: 'module_maturity_001',
      system: 'You are Evo LLM, a module maturity auditor for PromptHouse Evo Studio.',
      instruction: 'Grade a module with UI and route but no tests, no proof receipt, and unclear error handling.',
      response: 'The module is not production-complete. It passes UI and route existence, but fails tests, receipt generation, and clear error handling. The next work is to add tests, generate proof receipts, and expose user-readable success and failure states.',
      tags: ['module-maturity', 'audit'],
      source: 'seed'
    }
  ];
  writeJson(seedFile, examples);
  return { seedFile, created: true, count: examples.length };
}

export function validateEvoExample(example, index = 0) {
  const issues = [];
  for (const field of EVO_LLM_REQUIRED_FIELDS) if (!normalizeEvoText(example[field])) issues.push(`Missing required field: ${field}`);
  const merged = EVO_LLM_REQUIRED_FIELDS.map((field) => normalizeEvoText(example[field])).join('\n');
  const banned = detectUnsupportedClaims(merged);
  if (banned.length) issues.push(`Unsupported claim detected: ${banned.join(', ')}`);
  if (normalizeEvoText(example.response).length < 20) issues.push('Response is too short for useful training.');
  if (normalizeEvoText(example.instruction).length < 8) issues.push('Instruction is too short for useful training.');
  return { index, valid: issues.length === 0, issues };
}

export function evoExampleToJsonl(example) {
  return JSON.stringify({
    messages: [
      { role: 'system', content: normalizeEvoText(example.system) },
      { role: 'user', content: normalizeEvoText(example.instruction) },
      { role: 'assistant', content: normalizeEvoText(example.response) }
    ],
    metadata: {
      source: example.source || 'prompt-house-evo-studio',
      tags: Array.isArray(example.tags) ? example.tags : [],
      truthPolicy: example.truthPolicy || 'truth-bound-production-only'
    }
  });
}

export function buildEvoLlmDataset({ rootDir = process.cwd(), trainRatio = 0.8 } = {}) {
  const paths = getEvoLlmPaths({ rootDir });
  ensureDir(paths.training);
  createEvoSeedDataset({ rootDir });
  const jsonFiles = fs.readdirSync(paths.training).filter((file) => file.endsWith('.json')).map((file) => path.join(paths.training, file));
  const examples = [];
  for (const file of jsonFiles) {
    const parsed = readJsonSafe(file, []);
    if (Array.isArray(parsed)) examples.push(...parsed.map((item) => ({ ...item, sourceFile: path.relative(rootDir, file) })));
  }
  const validations = examples.map(validateEvoExample);
  const validExamples = examples.filter((_, index) => validations[index].valid);
  const invalidExamples = validations.filter((item) => !item.valid);
  const splitIndex = Math.max(1, Math.floor(validExamples.length * trainRatio));
  const train = validExamples.slice(0, splitIndex);
  const evalSet = validExamples.slice(splitIndex);
  fs.writeFileSync(paths.trainJsonl, train.map(evoExampleToJsonl).join('\n') + (train.length ? '\n' : ''), 'utf8');
  fs.writeFileSync(paths.evalJsonl, evalSet.map(evoExampleToJsonl).join('\n') + (evalSet.length ? '\n' : ''), 'utf8');
  const manifest = {
    generatedAt: new Date().toISOString(),
    truthState: invalidExamples.length ? 'DATASET_WARNINGS' : 'DATASET_READY',
    totalExamples: examples.length,
    validExamples: validExamples.length,
    invalidExamples,
    trainCount: train.length,
    evalCount: evalSet.length,
    files: { trainJsonl: path.relative(rootDir, paths.trainJsonl), evalJsonl: path.relative(rootDir, paths.evalJsonl) },
    policy: EVO_LLM_POLICY
  };
  writeJson(paths.manifest, manifest);
  return manifest;
}
