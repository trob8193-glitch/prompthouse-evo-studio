import { routeTask } from '../core/evo-layer/router/ToolRouter.js';
import { getAdapterStatus } from '../core/evo-layer/adapters/AdapterBus.js';
import { checkExecutionSafety } from '../core/evo-layer/safety/SafetyGate.js';
import { writeMemory } from '../core/evo-layer/memory/MemoryGraph.js';

export async function runTask({ rootDir = process.cwd(), task }) {
  const safety = checkExecutionSafety({ rootDir, task });

  if (!safety.allowed) {
    return {
      success: false,
      task,
      reason: safety.reason,
      ts: new Date().toISOString()
    };
  }

  const route = routeTask({ rootDir, task });
  const adapters = getAdapterStatus({ rootDir });

  const selected = adapters.find(a => a.name === route);

  const result = {
    success: true,
    task,
    route,
    adapter: selected?.name || 'filesystem',
    ts: new Date().toISOString(),
    note: 'TaskEngineCore v1 (routing + memory logging)'
  };

  writeMemory({
    rootDir,
    type: 'task_event',
    data: result
  });

  return result;
}