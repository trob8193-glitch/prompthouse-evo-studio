#!/usr/bin/env node
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

const args = new Set(process.argv.slice(2));
const engine = new PlatformReadinessEngine();
const runCommands = args.has('--run') || args.has('--audit') || args.has('--release-verdict');
const includeHeavy = args.has('--heavy') || args.has('--ready');
const result = engine.status({ runCommands, includeHeavy });

if (args.has('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else if (args.has('--release-verdict')) {
  console.log(`PLATFORM_RELEASE_VERDICT=${result.release.verdict}`);
  console.log(`TRUTH_LABEL=${result.release.truthLabel}`);
  console.log(`SCORE=${result.score}`);
  console.log(`REASON=${result.release.reason}`);
} else {
  console.log('🛡️ PLATFORM SENTINEL STATUS');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`Score: ${result.score}`);
  console.log(`Verdict: ${result.release.verdict}`);
  console.log(`Truth Label: ${result.release.truthLabel}`);
  console.log(`Issues: ${result.issues.length}`);
  console.log(`P0 Repairs: ${result.repairQueue.length}`);
  for (const repair of result.repairQueue.slice(0, 12)) console.log(`- ${repair.priority} ${repair.title}`);
}

if (args.has('--strict') && result.release.verdict !== 'PLATFORM_READY') process.exitCode = 1;
