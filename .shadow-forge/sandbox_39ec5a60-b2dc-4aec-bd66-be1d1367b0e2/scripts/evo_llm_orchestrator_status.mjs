#!/usr/bin/env node
import { Log } from '../src/core/autonomy/SovereignLogger.js';
import {
  approveEvoTrainPlan,
  createEvoTrainPlan,
  evaluateEvoLlmTrainingCostGate,
  evaluateEvoProviderGate,
  getEvoTrainRun,
  getEvoTrainStatus,
  listEvoModelVersions,
  listEvoTrainPlans,
  listEvoTrainRuns,
  promoteEvoModelVersion,
  rollbackEvoModelVersion,
  runEvoTrainPlan,
  syncEvoTrainRun,
} from '../src/core/evo-llm/index.js';

const args = process.argv.slice(2);
const flags = new Set(args);
const rootDir = process.cwd();

function getArg(name, fallback = '') {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function getNumberArg(name, fallback = null) {
  const value = getArg(name, '');
  if (value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBooleanArg(name, fallback = null) {
  const value = getArg(name, '');
  if (value === '') return fallback;
  return value === 'true' || value === '1' || value === 'yes';
}

function print(value) {
  Log.info(JSON.stringify(value, null, 2));
}

function usage() {
  return {
    command: 'evo_llm_orchestrator_status.mjs',
    truthState: 'EVO_LLM_ORCHESTRATOR_CLI_READY',
    modes: [
      '--status',
      '--plan --provider=local-dataset|openai --objective="..."',
      '--approve --planId=evo_train_plan_x --scope=dataset-only|provider-training',
      '--run --planId=evo_train_plan_x --maxTrainingBudgetUsd=25 --allowProviderTraining=true',
      '--sync --runId=evo_train_run_x',
      '--promote --runId=evo_train_run_x',
      '--rollback --reason="..."',
      '--plans',
      '--runs',
      '--run-status --runId=evo_train_run_x',
      '--versions',
      '--provider-gate --provider=openai --providerKeyPresent=true --maxTrainingBudgetUsd=25 --allowProviderTraining=true',
      '--cost-gate --provider=openai --examples=1000',
    ],
  };
}

async function main() {
  if (flags.has('--help') || flags.has('-h')) {
    print(usage());
    return;
  }

  if (flags.has('--plan')) {
    print(createEvoTrainPlan({
      rootDir,
      provider: getArg('--provider', 'local-dataset'),
      objective: getArg('--objective', 'Improve Evo LLM studio reasoning from validated examples'),
      model: getArg('--model', null),
      providerKeyPresent: getBooleanArg('--providerKeyPresent', false),
      maxTrainingBudgetUsd: getNumberArg('--maxTrainingBudgetUsd', null),
      allowProviderTraining: getBooleanArg('--allowProviderTraining', null),
      contributionMode: getArg('--contributionMode', 'private'),
    }));
    return;
  }

  if (flags.has('--approve')) {
    print(approveEvoTrainPlan({
      rootDir,
      planId: getArg('--planId'),
      actor: getArg('--actor', 'studio_owner'),
      scope: getArg('--scope', 'dataset-only'),
    }));
    return;
  }

  if (flags.has('--run')) {
    print(await runEvoTrainPlan({
      rootDir,
      planId: getArg('--planId'),
      maxTrainingBudgetUsd: getNumberArg('--maxTrainingBudgetUsd', null),
      allowProviderTraining: getBooleanArg('--allowProviderTraining', null),
    }));
    return;
  }

  if (flags.has('--sync')) {
    print(await syncEvoTrainRun({ rootDir, runId: getArg('--runId') }));
    return;
  }

  if (flags.has('--promote')) {
    print(promoteEvoModelVersion({
      rootDir,
      runId: getArg('--runId'),
      actor: getArg('--actor', 'studio_owner'),
    }));
    return;
  }

  if (flags.has('--rollback')) {
    print(rollbackEvoModelVersion({
      rootDir,
      actor: getArg('--actor', 'studio_owner'),
      reason: getArg('--reason', 'CLI rollback'),
    }));
    return;
  }

  if (flags.has('--plans')) {
    print({ plans: listEvoTrainPlans({ rootDir, limit: getNumberArg('--limit', 50) }) });
    return;
  }

  if (flags.has('--runs')) {
    print({ runs: listEvoTrainRuns({ rootDir, limit: getNumberArg('--limit', 50) }) });
    return;
  }

  if (flags.has('--run-status')) {
    print({ run: getEvoTrainRun({ rootDir, runId: getArg('--runId') }) });
    return;
  }

  if (flags.has('--versions')) {
    print({ versions: listEvoModelVersions({ rootDir, limit: getNumberArg('--limit', 50) }) });
    return;
  }

  if (flags.has('--provider-gate')) {
    print({
      gate: evaluateEvoProviderGate({
        provider: getArg('--provider', 'local-dataset'),
        providerKeyPresent: getBooleanArg('--providerKeyPresent', false),
        maxTrainingBudgetUsd: getNumberArg('--maxTrainingBudgetUsd', null),
        allowProviderTraining: getBooleanArg('--allowProviderTraining', null),
        model: getArg('--model', null),
      }),
    });
    return;
  }

  if (flags.has('--cost-gate')) {
    print({
      gate: evaluateEvoLlmTrainingCostGate({
        provider: getArg('--provider', 'local-dataset'),
        examples: getNumberArg('--examples', 0),
      }),
    });
    return;
  }

  print(getEvoTrainStatus({ rootDir }));
}

main()
  .then(() => Log.info('✅ Evo LLM orchestrator command complete.'))
  .catch((error) => {
    Log.error(JSON.stringify({
      success: false,
      truthState: 'EVO_LLM_ORCHESTRATOR_CLI_FAILED',
      error: error.message || String(error),
    }, null, 2));
    process.exit(1);
  });
