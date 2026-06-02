import { claimNextTask, completeTask } from '../scheduler/TaskScheduler.js';
import { executeAdapterTask } from './AdapterExecutor.js';
import { writeMemory } from '../memory/MemoryGraph.js';
import { emitDaemonEvent } from '../daemons/DaemonBus.js';

export async function runSchedulerWorkerOnce({ rootDir = process.cwd(), lane = null } = {}) {
  const task = claimNextTask({ rootDir, lane });
  if (!task) {
    return {
      success: true,
      status: 'IDLE',
      message: 'No queued task available.',
      checkedAt: new Date().toISOString()
    };
  }

  emitDaemonEvent({
    rootDir,
    daemonId: 'scheduler-worker',
    event: 'task_claimed',
    payload: { taskId: task.id, title: task.title, lane: task.lane }
  });

  const result = await executeAdapterTask({
    rootDir,
    task: task.title,
    payload: task.payload || {}
  });

  const completed = completeTask({
    rootDir,
    id: task.id,
    ok: Boolean(result.success),
    result
  });

  writeMemory({
    rootDir,
    type: 'scheduler_worker_result',
    data: { task: completed, execution: result }
  });

  emitDaemonEvent({
    rootDir,
    daemonId: 'scheduler-worker',
    event: 'task_completed',
    payload: { taskId: task.id, ok: Boolean(result.success), adapter: result.adapter }
  });

  return {
    success: Boolean(result.success),
    status: result.success ? 'DONE' : 'FAILED',
    task: completed,
    execution: result,
    completedAt: new Date().toISOString()
  };
}
