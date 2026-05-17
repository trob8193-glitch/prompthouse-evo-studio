import { runEvolutionCycle, getEvolutionStatus, listEvolutionRuns } from '../src/core/evolution/index.js';

const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode='));
const objectiveArg = args.find(arg => arg.startsWith('--objective='));
const list = args.includes('--list');
const status = args.includes('--status');

const mode = modeArg ? modeArg.split('=').slice(1).join('=').trim() : 'proposal';
const objective = objectiveArg
  ? objectiveArg.split('=').slice(1).join('=').trim()
  : 'Remove fake self-evolution language and improve local bridge URL environment readiness';

try {
  if (status) {
    console.log(JSON.stringify(getEvolutionStatus(), null, 2));
    process.exit(0);
  }
  if (list) {
    console.log(JSON.stringify(listEvolutionRuns({ limit: 25 }), null, 2));
    process.exit(0);
  }

  const result = await runEvolutionCycle({
    objective,
    mode,
    applyFixes: mode !== 'proposal',
    runTests: !args.includes('--skip-tests'),
    runBuild: !args.includes('--skip-build'),
    allowRollback: !args.includes('--no-rollback'),
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
} catch (error) {
  console.error(JSON.stringify({ success: false, error: error.message, code: error.code || 'SELF_EVOLUTION_CLI_ERROR' }, null, 2));
  process.exit(1);
}
