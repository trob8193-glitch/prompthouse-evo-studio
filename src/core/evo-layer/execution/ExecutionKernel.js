import fs from 'fs';
import path from 'path';
import { getAdapterStatus } from '../adapters/AdapterBus.js';
import { checkExecutionSafety } from '../safety/SafetyGate.js';
import { executeAdapterTask } from './AdapterExecutor.js';
import { getSchedulerReport } from '../scheduler/TaskScheduler.js';
import { getCoordinationRuntimeReport } from '../coordination/CoordinationRuntime.js';
import { calculateAdapterHealth } from '../adapters/AdapterHealthEngine.js';

function dir(rootDir) {
  return path.join(rootDir, '.evo-layer', 'execution');
}

function ensure(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
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
  const records = files.filter(name => name.endsWith('.json')).map(name => readJson(path.join(base, name))).filter(Boolean);
  const adapterHealth = calculateAdapterHealth({ rootDir });
  return {
    success: true,
    kernel: 'ExecutionKernelV2',
    taskCount: records.length,
    queued: records.filter(row => row.status === 'QUEUED').length,
    executed: records.filter(row => row.status === 'DONE' || row.status === 'SUCCESS').length,
    failed: records.filter(row => row.status === 'FAILED').length,
    adapters: getAdapterStatus({ rootDir }),
    adapterHealth,
    scheduler: getSchedulerReport({ rootDir }),
    coordination: getCoordinationRuntimeReport({ rootDir }),
    safety: checkExecutionSafety({ rootDir }),
    timestamp: new Date().toISOString()
  };
}

export async function executeTask({ rootDir = process.cwd(), task, adapter = null, payload = {} } = {}) {
  const safety = checkExecutionSafety({ rootDir, task });
  if (!safety.allowed) {
    return { success: false, status: 'BLOCKED', reason: safety.reason, task, createdAt: new Date().toISOString() };
  }
  const result = await executeAdapterTask({ rootDir, task, adapter, payload });
  const base = dir(rootDir);
  ensure(base);
  fs.writeFileSync(path.join(base, `${result.id}.json`), JSON.stringify(result, null, 2));
  return result;
}
