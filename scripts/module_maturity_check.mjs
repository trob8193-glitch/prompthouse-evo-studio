#!/usr/bin/env node
import { runModuleMaturityAudit, writeModuleMaturityReceipt } from '../src/core/maturity/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const args = new Set(process.argv.slice(2));
const report = runModuleMaturityAudit({ rootDir: process.cwd() });

Log.info('\n🧪 MODULE MATURITY ENGINE');
Log.info('══════════════════════════════════════════════════════════════');
Log.info(`Truth State: ${report.truthState}`);
Log.info(`Average Score: ${report.averageScore}%`);
Log.info(`Modules: ${report.moduleCount}`);
Log.info(`Grades: A=${report.summary.a} B=${report.summary.b} C=${report.summary.c} D=${report.summary.d} F=${report.summary.f}`);

if (args.has('--json')) {
  Log.info(JSON.stringify(report, null, 2));
}

if (args.has('--summary') || !args.has('--json')) {
  Log.info('\nModule Scores:');
  for (const module of report.modules) {
    const missing = module.missing.slice(0, 4).map(item => item.label).join('; ');
    Log.info(`- ${module.grade} ${String(module.score).padStart(3, ' ')}% | ${module.name}${missing ? ` | Missing: ${missing}` : ''}`);
  }
}

if (args.has('--receipt')) {
  const receipt = writeModuleMaturityReceipt({ rootDir: process.cwd(), report });
  Log.info(`\nReceipt saved: ${receipt.file}`);
}

if (args.has('--strict') && report.averageScore < 85) {
  Log.error('\n❌ Module maturity strict gate failed. Average score is below 85%.');
  process.exit(1);
}

if (args.has('--fail-on-blockers') && report.blockers.length > 0) {
  Log.error(`\n❌ Module maturity blockers found: ${report.blockers.length}`);
  process.exit(1);
}

Log.info('\n✅ Module maturity scan complete.');
