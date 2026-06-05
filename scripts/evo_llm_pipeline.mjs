#!/usr/bin/env node
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import {
  buildEvoLlmDataset,
  createEvoSeedDataset,
  evaluateEvoLlmDataset,
  writeEvoLlmModelCard,
  writeEvoLlmTrainingReceipt,
} from '../src/core/evo-llm/index.js';

const args = new Set(process.argv.slice(2));
const rootDir = process.cwd();

function printJson(value) {
  Log.info(JSON.stringify(value, null, 2));
}

if (args.has('--seed')) {
  const result = createEvoSeedDataset({ rootDir });
  Log.info(`Seed dataset ${result.created ? 'created' : 'already exists'}: ${result.seedFile}`);
}

if (args.has('--dataset') || process.argv.length <= 2) {
  const manifest = buildEvoLlmDataset({ rootDir });
  Log.info('Evo LLM Dataset Manifest');
  Log.info(`Truth State: ${manifest.truthState}`);
  Log.info(`Total Examples: ${manifest.totalExamples}`);
  Log.info(`Valid Examples: ${manifest.validExamples}`);
  Log.info(`Train Count: ${manifest.trainCount}`);
  Log.info(`Eval Count: ${manifest.evalCount}`);
  Log.info(`Train JSONL: ${manifest.files.trainJsonl}`);
  Log.info(`Eval JSONL: ${manifest.files.evalJsonl}`);
  if (args.has('--json')) printJson(manifest);
}

if (args.has('--eval')) {
  const report = evaluateEvoLlmDataset({ rootDir });
  Log.info('Evo LLM Evaluation');
  Log.info(`Truth State: ${report.truthState}`);
  Log.info(`Dataset Quality Score: ${report.datasetQualityScore}%`);
  Log.info(`Invalid Examples: ${report.invalidCount}`);
  if (args.has('--json')) printJson(report);
}

if (args.has('--model-card')) {
  const result = writeEvoLlmModelCard({ rootDir });
  Log.info(`Evo LLM model card written: ${result.file}`);
  if (args.has('--json')) printJson(result.card);
}

if (args.has('--receipt')) {
  const result = writeEvoLlmTrainingReceipt({ rootDir });
  Log.info(`Evo LLM training pipeline receipt written: ${result.file}`);
  if (args.has('--json')) printJson(result.receipt);
}

if (args.has('--strict')) {
  const report = evaluateEvoLlmDataset({ rootDir });
  if (report.datasetQualityScore < 90 || report.invalidCount > 0) {
    Log.error('Evo LLM strict check did not pass.');
    process.exit(1);
  }
}

Log.info('Evo LLM pipeline command complete.');
