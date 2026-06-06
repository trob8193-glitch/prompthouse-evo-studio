import { runEvolutionCycle, getEvolutionStatus, listEvolutionRuns } from '../src/core/evolution/index.js';

import { Log } from '../src/core/autonomy/SovereignLogger.js';

const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode='));
const objectiveArg = args.find(arg => arg.startsWith('--objective='));
const list = args.includes('--list');
const status = args.includes('--status');

const mode = modeArg ? modeArg.split('=').slice(1).join('=').trim() : 'proposal';
const objective = objectiveArg
  ? objectiveArg.split('=').slice(1).join('=').trim()
  : 'Remove non-production self-evolution language and improve local bridge URL environment readiness';

try {
  if (status) {
    Log.info(JSON.stringify(compactStatus(getEvolutionStatus()), null, 2));
    process.exit(0);
  }
  if (list) {
    Log.info(JSON.stringify(listEvolutionRuns({ limit: 25 }).map(compactRun), null, 2));
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
  Log.info(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
} catch (error) {
  Log.error(JSON.stringify({ success: false, error: error.message, code: error.code || 'SELF_EVOLUTION_CLI_ERROR' }, null, 2));
  process.exit(1);
}

function compactStatus(statusPayload) {
  return {
    success: statusPayload.success,
    truthState: statusPayload.truthState,
    lastRun: compactRun(statusPayload.lastRun),
    recentRuns: (statusPayload.recentRuns || []).slice(0, 5).map(compactRun),
    policy: {
      proofCommands: statusPayload.policy?.proofCommands || [],
      maxRiskScore: statusPayload.policy?.maxRiskScore,
      protectedPaths: statusPayload.policy?.protectedPaths || []
    }
  };
}

function compactRun(run) {
  if (!run) return null;
  return {
    runId: run.runId,
    objective: truncateText(run.objective),
    truthState: run.truthState,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    blockedReasons: run.blockedReasons || [],
    changedFiles: run.changedFiles || [],
    proof: run.proof ? {
      passed: run.proof.passed,
      commandCount: run.proof.commands?.length || 0,
      failedCommands: (run.proof.commands || [])
        .filter(command => command.exitCode !== 0)
        .map(command => command.command)
    } : null,
    comparison: run.comparison ? {
      improved: run.comparison.improved,
      beforeScore: run.comparison.beforeScore,
      afterScore: run.comparison.afterScore
    } : null
  };
}

function truncateText(value, maxLength = 240) {
  if (typeof value !== 'string' || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}
