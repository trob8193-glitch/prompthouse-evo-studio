#!/usr/bin/env node
import { EvoCoreMasterOrchestrationKernel } from '../src/core/master-orchestrator/index.js';

const args = new Set(process.argv.slice(2));
const kernel = new EvoCoreMasterOrchestrationKernel();

if (args.has('--mission')) {
  const objective = process.argv.slice(3).join(' ') || 'Audit studio mission routing';
  console.log(JSON.stringify(kernel.planMission({ title: objective, objective }), null, 2));
} else {
  const status = kernel.status();
  console.log(JSON.stringify(status, null, 2));
  if (args.has('--strict') && status.truthLabel !== 'MASTER_READY') process.exitCode = 1;
}
