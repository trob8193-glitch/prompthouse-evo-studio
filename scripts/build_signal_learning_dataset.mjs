#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {
  buildSignalLearningDataset,
  getSignalLearningStatus,
  importEvoSignalFabricSnapshot,
  ingestEvoSignalLearningEvent
} from '../src/core/evo-llm/EvoSignalLearningBridge.js';
import { collectEvoSignalFabric } from '../src/core/signals/EvoSignalFabric.js';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));

function readJsonArg(flag) {
  const value = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (!value) return null;
  const raw = value.slice(flag.length + 1);
  if (fs.existsSync(raw)) return JSON.parse(fs.readFileSync(raw, 'utf8'));
  return JSON.parse(raw);
}

if (args.has('--status')) {
  console.log(JSON.stringify(getSignalLearningStatus({ rootDir }), null, 2));
  process.exit(0);
}

const event = readJsonArg('--event');
if (event) {
  console.log(JSON.stringify(ingestEvoSignalLearningEvent({ rootDir, event }), null, 2));
  process.exit(0);
}

if (args.has('--import-fabric')) {
  const fabric = await collectEvoSignalFabric({ rootDir, timeoutMs: Number(process.env.EVO_SIGNAL_TIMEOUT_MS || 1200) });
  const connectedSources = readJsonArg('--connected-sources') || [];
  console.log(JSON.stringify(importEvoSignalFabricSnapshot({ rootDir, fabric, connectedSources }), null, 2));
  process.exit(0);
}

const result = buildSignalLearningDataset({ rootDir, limit: Number(process.env.EVO_SIGNAL_LEARNING_LIMIT || 1000), rebuildMainDataset: !args.has('--no-main-dataset') });
console.log(JSON.stringify(result, null, 2));
