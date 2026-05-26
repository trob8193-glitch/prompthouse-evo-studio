#!/usr/bin/env node
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
  console.log(JSON.stringify(value, null, 2));
}

if (args.has('--seed')) {
  const result = createEvoSeedDataset({ rootDir });
  console.log(`Seed dataset ${result.created ? 'created' : 'already exists'}: ${result.seedFile}`);
}

if (args.has('--dataset') || process.argv.length <= 2) {
  const manifest = buildEvoLlmDataset({ rootDir });
  console.log('\n🧠 Evo LLM Dataset Manifest');
  console.log(`Truth State: ${manifest.truthState}`);
  console.log(`Total Examples: ${manifest.totalExamples}`);
  console.log(`Valid Examples: ${manifest.validExamples}`);
  console.log(`Train Count: ${manifest.trainCount}`);
  console.log(`Eval Count: ${manifest.evalCount}`);
  console.log(`Train JSONL: ${manifest.files.trainJsonl}`);
  console.log(`Eval JSONL: ${manifest.files.evalJsonl}`);
  if (args.has('--json')) printJson(manifest);
}

if (args.has('--eval')) {
  const report = evaluateEvoLlmDataset({ rootDir });
  console.log('\n🧪 Evo LLM Evaluation');
  console.log(`Truth State: ${report.truthState}`);
  console.log(`Dataset Quality Score: ${report.datasetQualityScore}%`);
  console.log(`Invalid Examples: ${report.invalidCount}`);
  if (args.has('--json')) printJson(report);
}

if (args.has('--model-card')) {
  const result = writeEvoLlmModelCard({ rootDir });
  console.log(`\n📇 Evo LLM model card written: ${result.file}`);
  if (args.has('--json')) printJson(result.card);
}

if (args.has('--receipt')) {
  const result = writeEvoLlmTrainingReceipt({ rootDir });
  console.log(`\n🧾 Evo LLM training pipeline receipt written: ${result.file}`);
  if (args.has('--json')) printJson(result.receipt);
}

if (args.has('--strict')) {
  const report = evaluateEvoLlmDataset({ rootDir });
  if (report.datasetQualityScore < 90 || report.invalidCount > 0) {
    console.error('\n❌ Evo LLM strict gate failed. Dataset quality is below threshold or invalid examples exist.');
    process.exit(1);
  }
}

console.log('\n✅ Evo LLM pipeline command complete.');
