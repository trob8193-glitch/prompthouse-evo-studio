import { runEvoLayerStatus, runEvoLayerSnapshot, runEvoLayerX10, createEvoLayerManifest } from '../src/core/evo-layer/index.js';
import { getRuntimeControlCenterStatus } from '../src/core/evo-layer/observability/RuntimeControlCenter.js';
import { getEngineRegistryReport, seedEngineRegistry } from '../src/core/evo-layer/registry/EngineRegistry.js';
import { getTetherReport, seedTetherMap } from '../src/core/evo-layer/tether/AutonomousTetherEngine.js';
import { getCoordinationReport, seedDefaultDaemons } from '../src/core/evo-layer/coordination/DaemonCoordinator.js';
import { getCoordinationRuntimeReport, runCoordinationCycle } from '../src/core/evo-layer/coordination/CoordinationRuntime.js';
import { calculateAdapterHealth, getAdapterHealthReport } from '../src/core/evo-layer/adapters/AdapterHealthEngine.js';
import { getSchedulerReport } from '../src/core/evo-layer/scheduler/TaskScheduler.js';
import { getMemoryGraph } from '../src/core/evo-layer/memory/MemoryGraph.js';
import { inferMemoryHealth } from '../src/core/evo-layer/memory/MemoryQueryEngine.js';
import { runSelfHealingCycle, diagnoseRuntime, createRepairPlan } from '../src/core/evo-layer/self-healing/SelfHealingRuntime.js';
import { runExecutionKernelStatus, executeTask } from '../src/core/evo-layer/execution/ExecutionKernel.js';
import { runSchedulerWorkerOnce } from '../src/core/evo-layer/execution/SchedulerWorker.js';

const args = process.argv.slice(2);
const mode = args[0] || 'status';

function print(value) {
  console.log(JSON.stringify(value, null, 2));
}

try {
  if (mode === 'manifest') {
    print(createEvoLayerManifest({ label: args[1] || 'manual_manifest' }));
  } else if (mode === 'snapshot') {
    print(runEvoLayerSnapshot({ label: args[1] || 'manual_snapshot' }));
  } else if (mode === 'x10') {
    print(runEvoLayerX10());
  } else if (mode === 'runtime') {
    print(getRuntimeControlCenterStatus());
  } else if (mode === 'engines') {
    seedEngineRegistry();
    print(getEngineRegistryReport());
  } else if (mode === 'tethers') {
    seedTetherMap();
    print(getTetherReport());
  } else if (mode === 'coordination') {
    seedDefaultDaemons();
    print({ coordinator: getCoordinationReport(), runtime: getCoordinationRuntimeReport() });
  } else if (mode === 'coordinate') {
    seedDefaultDaemons();
    print(runCoordinationCycle());
  } else if (mode === 'health') {
    print(calculateAdapterHealth());
  } else if (mode === 'health:last') {
    print(getAdapterHealthReport());
  } else if (mode === 'scheduler') {
    print(getSchedulerReport());
  } else if (mode === 'worker') {
    print(await runSchedulerWorkerOnce({ lane: args[1] || null }));
  } else if (mode === 'memory') {
    print({ graph: getMemoryGraph({ rootDir: process.cwd() }), health: inferMemoryHealth({ rootDir: process.cwd() }) });
  } else if (mode === 'heal') {
    print(runSelfHealingCycle({ apply: args.includes('--apply') }));
  } else if (mode === 'diagnose') {
    const diagnosis = diagnoseRuntime();
    print({ diagnosis, plan: createRepairPlan({ diagnosis }) });
  } else if (mode === 'execute') {
    const task = args.slice(1).join(' ') || 'git status';
    print(await executeTask({ task }));
  } else if (mode === 'kernel') {
    print(runExecutionKernelStatus());
  } else {
    print(runEvoLayerStatus());
  }
} catch (error) {
  print({ success: false, error: error.message, stack: error.stack, code: 'EVO_LAYER_CLI_ERROR' });
  process.exit(1);
}
