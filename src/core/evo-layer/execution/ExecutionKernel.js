import fs from 'fs';
import path from 'path';
import { getAdapterStatus } from '../adapters/AdapterBus.js';
import { routeTask } from '../router/ToolRouter.js';
import { checkExecutionSafety } from '../safety/SafetyGate.js';

function dir(rootDir) {
  return path.join(rootDir, '.evo-layer', 'execution');
}

function ensure(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function addTask({ rootDir = process.cwd(), task }) {
  const base = dir(rootDir);
  ensure(base);

  const record = {
    id: `task_${Date.now()}`,
    task,
    status: 'QUEUED',
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(path.join(base, `${record.id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export function runExecutionKernelStatus({ rootDir = process.cwd() } = {}) {
  const base = dir(rootDir);
  ensure(base);

  const files = fs.existsSync(base) ? fs.readdirSync(base) : [];

  const tasks = files
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(base, f), 'utf8')));

  return {
    success: true,
    kernel: 'ExecutionKernelV1',
    taskCount: tasks.length,
    queued: tasks.filter(t => t.status === 'QUEUED').length,
    executed: tasks.filter(t => t.status === 'DONE').length,
    adapters: getAdapterStatus({ rootDir }),
    safety: checkExecutionSafety({ rootDir }),
    timestamp: new Date().toISOString()
  };
}

export function executeTask({ rootDir = process.cwd(), task }) {
  const safety = checkExecutionSafety({ rootDir, task });
  if (!safety.allowed) {
    return { success: false, reason: safety.reason };
  }

  const routed = routeTask({ rootDir, task });

  const result = {
    success: true,
    task,
    route: routed,
    executedAt: new Date().toISOString()
  };

  const base = dir(rootDir);
  ensure(base);

  fs.writeFileSync(path.join(base, `result_${Date.now()}.json`), JSON.stringify(result, null, 2));

  return result;
}