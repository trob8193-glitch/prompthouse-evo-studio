#!/usr/bin/env node
import { buildDaemonReadinessReport } from '../src/core/evo-layer/daemons/DaemonReadiness.js';

const args = process.argv.slice(2);
const report = buildDaemonReadinessReport({
  rootDir: process.cwd(),
  runSyntaxCheck: !args.includes('--skip-syntax'),
});

console.log(JSON.stringify(report, null, 2));
process.exit(report.success ? 0 : 1);
