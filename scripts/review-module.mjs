#!/usr/bin/env node
import { Gatekeeper } from '../src/core/proof/Gatekeeper.js';

const args = Object.fromEntries(process.argv.slice(2).map(item => {
  const clean = item.replace(/^--/, '');
  const [key, value = true] = clean.split('=');
  return [key, value];
}));

const moduleId = args.module || process.argv[2] || 'cost-firewall';
const targetStage = args.stage || 'production';
const rollbackRef = args.rollbackRef || args.rollback || 'main';

const result = await Gatekeeper.review({ moduleId, targetStage, rollbackRef });
console.log(JSON.stringify({
  approved: result.approved,
  truthState: result.truthState,
  moduleId,
  targetStage,
  issues: result.issues,
  manifest: result.manifest
}, null, 2));
