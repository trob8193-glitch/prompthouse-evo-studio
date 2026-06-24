#!/usr/bin/env node
import {
  buildGlobalContributionPacket,
  getGlobalNodeStatus,
  submitGlobalContributionPacket
} from '../src/core/evo-llm/index.js';

const args = process.argv.slice(2);
const command = args[0] || 'status';
const rootDir = process.cwd();

function arg(name, fallback = '') {
  const prefix = `${name}=`;
  const found = args.find((item) => item.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function flag(name) {
  return args.includes(name);
}

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

if (command === 'status') {
  print(getGlobalNodeStatus({ rootDir }));
} else if (command === 'package') {
  print(buildGlobalContributionPacket({
    rootDir,
    contributor: arg('--contributor', 'local-copy'),
    scope: arg('--scope', 'global-corpus'),
    includeExamples: flag('--include-examples'),
    consent: {
      globalContribution: flag('--global-opt-in'),
      dataRightsConfirmed: flag('--data-rights-confirmed'),
      privateProviderTraining: flag('--private-provider-training')
    }
  }));
} else if (command === 'submit') {
  const result = await submitGlobalContributionPacket({
    rootDir,
    packetId: arg('--packet-id', null),
    hubUrl: arg('--hub-url', process.env.GLOBAL_EVO_HUB_URL),
    hubToken: arg('--hub-token', process.env.GLOBAL_EVO_HUB_TOKEN)
  });
  print(result);
} else {
  console.error('Usage: node scripts/evo_global_node.mjs status|package|submit');
  process.exitCode = 1;
}
