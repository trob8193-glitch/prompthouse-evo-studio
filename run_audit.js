import { runNuclearTruthAudit } from './src/core/audit/NuclearTruthAudit.js';
import fs from 'fs';

const results = runNuclearTruthAudit(process.cwd());
fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));
console.log('Audit complete. Score:', results.score, 'State:', results.truthState);
if (results.brokenWires.length > 0) {
  console.log('Broken Wires:', results.brokenWires.length);
}
