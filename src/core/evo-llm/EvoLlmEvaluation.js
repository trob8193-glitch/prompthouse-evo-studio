import fs from 'fs';
import path from 'path';
import { getEvoLlmPaths } from './EvoLlmPaths.js';
import { buildEvoLlmDataset } from './EvoLlmDataset.js';

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function writeJson(file, value) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }
function readJsonSafe(file, fallback = null) { try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback; } catch { return fallback; } }

export function evaluateEvoLlmDataset({ rootDir = process.cwd() } = {}) {
  const manifest = buildEvoLlmDataset({ rootDir });
  const score = manifest.totalExamples === 0 ? 0 : Math.round((manifest.validExamples / manifest.totalExamples) * 100);
  return {
    generatedAt: new Date().toISOString(),
    truthState: score >= 90 ? 'EVAL_READY' : 'EVAL_NEEDS_DATA_REPAIR',
    datasetQualityScore: score,
    totalExamples: manifest.totalExamples,
    validExamples: manifest.validExamples,
    invalidCount: manifest.invalidExamples.length,
    blockers: manifest.invalidExamples,
    requiredNextSteps: [
      'Add more project-specific examples from real PromptHouse Evo Studio workflows.',
      'Run provider-specific fine-tune command only after dataset validation passes.',
      'Store model output evaluations and compare against baseline prompts.'
    ]
  };
}

export function writeEvoLlmModelCard({ rootDir = process.cwd(), modelName = 'Evo LLM Local Pipeline' } = {}) {
  const paths = getEvoLlmPaths({ rootDir });
  const manifest = readJsonSafe(paths.manifest, null) || buildEvoLlmDataset({ rootDir });
  ensureDir(paths.modelCards);
  const card = {
    modelName,
    generatedAt: new Date().toISOString(),
    truthState: 'PIPELINE_MODEL_CARD_NOT_TRAINED_MODEL',
    intendedUse: 'PromptHouse Evo Studio architecture, audit, cost-control, module maturity, and proof-gated build assistance.',
    notFor: ['medical diagnosis', 'legal advice', 'financial guarantees', 'security bypass', 'claims of sentience or consciousness'],
    dataset: manifest,
    trainingStatus: 'DATASET_PREPARED_PROVIDER_TRAINING_NOT_EXECUTED',
    proofCommands: ['npm run evo:dataset', 'npm run evo:eval', 'npm run evo:model-card'],
    limitations: [
      'No provider fine-tune is executed by this local pipeline.',
      'Model quality depends on validated project examples.',
      'Outputs must remain truth-bound and proof-gated.'
    ]
  };
  const file = path.join(paths.modelCards, `evo-llm-model-card-${Date.now()}.json`);
  writeJson(file, card);
  return { file, card };
}

export function writeEvoLlmTrainingReceipt({ rootDir = process.cwd() } = {}) {
  const paths = getEvoLlmPaths({ rootDir });
  ensureDir(paths.receipts);
  const manifest = buildEvoLlmDataset({ rootDir });
  const evalReport = evaluateEvoLlmDataset({ rootDir });
  const modelCard = writeEvoLlmModelCard({ rootDir });
  const receipt = {
    generatedAt: new Date().toISOString(),
    truthState: 'PIPELINE_PREPARED_NO_PROVIDER_TRAINING_EXECUTED',
    manifest,
    evalReport,
    modelCardFile: path.relative(rootDir, modelCard.file)
  };
  const file = path.join(paths.receipts, `evo-llm-training-receipt-${Date.now()}.json`);
  writeJson(file, receipt);
  return { file, receipt };
}
