#!/usr/bin/env node
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const args = new Set(process.argv.slice(2));
const receipt = new PlatformReadinessEngine().receipt({ runCommands: args.has('--run'), includeHeavy: args.has('--heavy') });
Log.info(JSON.stringify(receipt, null, 2));
