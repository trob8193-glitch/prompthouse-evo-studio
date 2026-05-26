#!/usr/bin/env node
import { runSpineCore, getSpineCoreContract } from '../src/core/spinecore/index.js';

const args = new Set(process.argv.slice(2));
const payload = args.has('--run')
  ? runSpineCore({ lessons: [], objective: 'Improve Evo Studio learning pipeline' })
  : { success: true, truthState: 'SPINECORE_SCRIPT_READY', contract: getSpineCoreContract() };

console.log(JSON.stringify(payload, null, 2));
