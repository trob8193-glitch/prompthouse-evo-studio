#!/usr/bin/env node
import dotenv from 'dotenv';
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.agent' });
dotenv.config({ path: '.env.local' });

const result = new PlatformReadinessEngine().status({ runCommands: false, includeHeavy: false });
Log.info(JSON.stringify({
  verdict: result.release,
  score: result.score,
  blockers: result.repairQueue,
  onlineSummary: result.onlineSummary,
  onlineBlockers: result.onlineBlockers,
}, null, 2));
if (!['PLATFORM_READY', 'READY_FOR_PILOT', 'PROVIDER_GATED'].includes(result.release.verdict)) process.exitCode = 1;
