import { runModuleMaturityAudit } from './src/core/maturity/ModuleMaturityEngine.js';
import fs from 'fs';
const result = runModuleMaturityAudit();
fs.writeFileSync('maturity_output.json', JSON.stringify(result, null, 2));
