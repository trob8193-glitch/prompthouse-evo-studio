#!/usr/bin/env node
import { runModuleMaturityAudit, writeModuleMaturityReceipt } from '../src/core/maturity/index.js';

const args = new Set(process.argv.slice(2));
const report = runModuleMaturityAudit({ rootDir: process.cwd() });

console.log('\n🧪 MODULE MATURITY ENGINE');
console.log('══════════════════════════════════════════════════════════════');
console.log(`Truth State: ${report.truthState}`);
console.log(`Average Score: ${report.averageScore}%`);
console.log(`Modules: ${report.moduleCount}`);
console.log(`Grades: A=${report.summary.a} B=${report.summary.b} C=${report.summary.c} D=${report.summary.d} F=${report.summary.f}`);

if (args.has('--json')) {
  console.log(JSON.stringify(report, null, 2));
}

if (args.has('--summary') || !args.has('--json')) {
  console.log('\nModule Scores:');
  for (const module of report.modules) {
    const missing = module.missing.slice(0, 4).map(item => item.label).join('; ');
    console.log(`- ${module.grade} ${String(module.score).padStart(3, ' ')}% | ${module.name}${missing ? ` | Missing: ${missing}` : ''}`);
  }
}

if (args.has('--receipt')) {
  const receipt = writeModuleMaturityReceipt({ rootDir: process.cwd(), report });
  console.log(`\nReceipt saved: ${receipt.file}`);
}

if (args.has('--strict') && report.averageScore < 85) {
  console.error('\n❌ Module maturity strict gate failed. Average score is below 85%.');
  process.exit(1);
}

if (args.has('--fail-on-blockers') && report.blockers.length > 0) {
  console.error(`\n❌ Module maturity blockers found: ${report.blockers.length}`);
  process.exit(1);
}

console.log('\n✅ Module maturity scan complete.');
