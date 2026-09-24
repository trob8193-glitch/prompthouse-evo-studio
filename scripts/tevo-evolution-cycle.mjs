import { QuadBrainEvolutionDaemon } from '../src/core/daemons/QuadBrainEvolutionDaemon.js';

const mode = process.argv.includes('--proof') ? 'proof' : 'cycle';
const daemon = new QuadBrainEvolutionDaemon(process.cwd());
const result = await daemon.runOnce({ mode });

console.log(JSON.stringify({
  truthState: result.truthState,
  runId: result.id || null,
  applied: result.applied ?? false,
  comparison: result.comparison || null,
  rollback: result.rollback || null,
  proof: result.proof || null
}, null, 2));

process.exitCode = result.truthState === 'ERROR' ? 1 : 0;
