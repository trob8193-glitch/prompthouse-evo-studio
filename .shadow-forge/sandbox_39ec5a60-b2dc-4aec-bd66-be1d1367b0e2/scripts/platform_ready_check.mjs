#!/usr/bin/env node
import dotenv from 'dotenv';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.agent' });
dotenv.config({ path: '.env.local' });

const args = new Set(process.argv.slice(2));
const engine = new PlatformReadinessEngine();
const runCommands = args.has('--run') || args.has('--audit') || args.has('--release-verdict');
const includeHeavy = args.has('--heavy') || args.has('--ready');
const result = engine.status({ runCommands, includeHeavy });

if (args.has('--online-blockers')) {
  Log.info(JSON.stringify({
    generatedAt: result.generatedAt,
    onlineSummary: result.onlineSummary,
    onlineBlockers: result.onlineBlockers,
  }, null, 2));
} else if (args.has('--json')) {
  Log.info(JSON.stringify(result, null, 2));
} else if (args.has('--release-verdict')) {
  Log.info(`PLATFORM_RELEASE_VERDICT=${result.release.verdict}`);
  Log.info(`TRUTH_LABEL=${result.release.truthLabel}`);
  Log.info(`SCORE=${result.score}`);
  Log.info(`REASON=${result.release.reason}`);
} else {
  Log.info('🛡️ PLATFORM SENTINEL STATUS');
  Log.info('══════════════════════════════════════════════════════════════');
  Log.info(`Score: ${result.score}`);
  Log.info(`Verdict: ${result.release.verdict}`);
  Log.info(`Truth Label: ${result.release.truthLabel}`);
  Log.info(`Issues: ${result.issues.length}`);
  Log.info(`P0 Repairs: ${result.repairQueue.length}`);
  Log.info(`Online Blockers: ${result.onlineSummary?.requiredBlockers ?? 0} required, ${result.onlineSummary?.optionalBlockers ?? 0} optional`);
  for (const repair of result.repairQueue.slice(0, 12)) Log.info(`- ${repair.priority} ${repair.title}`);
  for (const blocker of (result.onlineBlockers || []).slice(0, 12)) Log.info(`- ${blocker.severity} ${blocker.label}: ${blocker.reasons.join('; ')}`);
}

if (args.has('--strict') && result.release.verdict !== 'PLATFORM_READY') process.exitCode = 1;
