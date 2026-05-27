#!/usr/bin/env node
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const result = new PlatformReadinessEngine().status({ runCommands: false, includeHeavy: false });
Log.info(JSON.stringify({ verdict: result.release, score: result.score, blockers: result.repairQueue }, null, 2));
if (!['PLATFORM_READY', 'READY_FOR_PILOT', 'PROVIDER_GATED'].includes(result.release.verdict)) process.exitCode = 1;
