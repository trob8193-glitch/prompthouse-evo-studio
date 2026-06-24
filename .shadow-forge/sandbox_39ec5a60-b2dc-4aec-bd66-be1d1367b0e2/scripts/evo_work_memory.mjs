#!/usr/bin/env node
import fs from 'fs';
import {
  buildEvoWorkMemoryDataset,
  getEvoWorkMemoryContract,
  getEvoWorkMemoryStatus,
  ingestEvoWorkMemory,
  writeEvoWorkMemoryReceipt
} from '../src/core/evo-llm/EvoWorkMemoryEngine.js';

const rootDir = process.cwd();
const args = new Set(process.argv.slice(2));

function readJsonArg(flag) {
  const found = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (!found) return null;
  const raw = found.slice(flag.length + 1);
  if (fs.existsSync(raw)) return JSON.parse(fs.readFileSync(raw, 'utf8'));
  return JSON.parse(raw);
}

try {
  if (args.has('--contract')) {
    console.log(JSON.stringify(getEvoWorkMemoryContract(), null, 2));
    process.exit(0);
  }
  if (args.has('--status')) {
    console.log(JSON.stringify(getEvoWorkMemoryStatus({ rootDir }), null, 2));
    process.exit(0);
  }
  const item = readJsonArg('--item');
  if (item) {
    console.log(JSON.stringify(ingestEvoWorkMemory({ rootDir, item }), null, 2));
    process.exit(0);
  }
  const result = buildEvoWorkMemoryDataset({ rootDir, limit: Number(process.env.EVO_WORK_MEMORY_LIMIT || 1000), rebuildMainDataset: !args.has('--no-main-dataset') });
  const receipt = writeEvoWorkMemoryReceipt({ rootDir, type: 'work_memory_cli_receipt', payload: result });
  console.log(JSON.stringify({ ...result, receipt }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ success: false, truthState: 'WORK_MEMORY_CLI_FAILED', error: error.message }, null, 2));
  process.exit(1);
}
