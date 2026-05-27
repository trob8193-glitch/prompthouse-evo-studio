import { runNuclearTruthAudit } from '../src/core/audit/NuclearTruthAudit.js';

const result = runNuclearTruthAudit();
console.log(JSON.stringify(result, null, 2));
