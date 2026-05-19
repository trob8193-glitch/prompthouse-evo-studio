#!/usr/bin/env node
import {
  createEvoTrainPlan,
  getEvoTrainStatus,
} from '../src/core/evo-llm/index.js';

const args = process.argv.slice(2);
const flags = new Set(args);
const rootDir = process.cwd();

function getArg(name, fallback = '') {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

if (flags.has('--plan')) {
  const result = createEvoTrainPlan({
    rootDir,
    provider: getArg('--provider', 'local-dataset'),
    objective: getArg('--objective', 'Improve Evo LLM studio reasoning from validated examples')
  });
  console.log(JSON.stringify(result.plan, null, 2));
} else {
  console.log(JSON.stringify(getEvoTrainStatus({ rootDir }), null, 2));
}

console.log('✅ Evo LLM orchestrator status command complete.');
