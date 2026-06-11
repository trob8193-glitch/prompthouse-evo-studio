#!/usr/bin/env node
import fs from 'fs';
import {
  buildAppIntelligenceDataset,
  getAppIntelligenceStatus,
  ingestAppIntelligenceSource
} from '../src/core/evo-llm/EvoAppIntelligenceBridge.js';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));

function readJsonArg(flag) {
  const found = process.argv.find((arg) => arg.startsWith(flag + '='));
  if (!found) return null;
  const raw = found.slice(flag.length + 1);
  if (fs.existsSync(raw)) return JSON.parse(fs.readFileSync(raw, 'utf8'));
  return JSON.parse(raw);
}

if (args.has('--status')) {
  console.log(JSON.stringify(getAppIntelligenceStatus({ rootDir }), null, 2));
  process.exit(0);
}

const source = readJsonArg('--source');
if (source) {
  console.log(JSON.stringify(ingestAppIntelligenceSource({ rootDir, source }), null, 2));
  process.exit(0);
}

console.log(JSON.stringify(buildAppIntelligenceDataset({
  rootDir,
  limit: Number(process.env.EVO_APP_INTELLIGENCE_LIMIT || 1000),
  rebuildMainDataset: !args.has('--no-main-dataset')
}), null, 2));
