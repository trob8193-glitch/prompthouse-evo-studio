#!/usr/bin/env node
import { PlatformReadinessEngine } from '../src/core/platform-sentinel/index.js';

const args = new Set(process.argv.slice(2));
const receipt = new PlatformReadinessEngine().receipt({ runCommands: args.has('--run'), includeHeavy: args.has('--heavy') });
console.log(JSON.stringify(receipt, null, 2));
