import { runNuclearTruthAudit } from '../src/core/audit/NuclearTruthAudit.js';

const report = runNuclearTruthAudit(process.cwd());

console.log(JSON.stringify(report, null, 2));

const truth = String(report.truthState || '').toLowerCase();
const ok = truth === 'verified';
process.exit(ok ? 0 : 1);

