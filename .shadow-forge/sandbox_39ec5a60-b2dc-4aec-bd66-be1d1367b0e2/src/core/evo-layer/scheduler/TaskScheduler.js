import fs from 'fs';
import path from 'path';

const STATES = Object.freeze({
  queued: 'QUEUED',
  running: 'RUNNING',
  done: 'DONE',
  failed: 'FAILED'
});

function schedulerRoot(rootDir) {
  const dir = path.join(rootDir, '.evo-layer', 'scheduler');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function taskFile(rootDir, id) {
  return path.join(schedulerRoot(rootDir), `${id}.json`);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function createTask({ rootDir = process.cwd(), title, payload = {}, priority = 1, lane = 'default' } = {}) {
  if (!title) throw new Error('createTask requires title.');
  const task = {
    id: `task_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title,
    payload,
    priority,
    lane,
    state: STATES.queued,
    attempts: 0,
    maxAttempts: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(taskFile(rootDir, task.id), JSON.stringify(task, null, 2));
  return task;
}

export function listTasks({ rootDir = process.cwd(), state = null } = {}) {
  const dir = schedulerRoot(rootDir);
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .map(name => readJson(path.join(dir, name)))
    .filter(Boolean)
    .filter(task => !state || task.state === state)
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
}

export function claimNextTask({ rootDir = process.cwd(), lane = null } = {}) {
  const next = listTasks({ rootDir, state: STATES.queued })
    .filter(task => !lane || task.lane === lane)[0];
  if (!next) return null;
  next.state = STATES.running;
  next.attempts = Number(next.attempts || 0) + 1;
  next.updatedAt = new Date().toISOString();
  fs.writeFileSync(taskFile(rootDir, next.id), JSON.stringify(next, null, 2));
  return next;
}

export function completeTask({ rootDir = process.cwd(), id, result = {}, ok = true } = {}) {
  if (!id) throw new Error('completeTask requires id.');
  const file = taskFile(rootDir, id);
  const task = readJson(file);
  if (!task) return null;
  task.state = ok ? STATES.done : STATES.failed;
  task.result = result;
  task.updatedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(task, null, 2));
  return task;
}

export function getSchedulerReport({ rootDir = process.cwd() } = {}) {
  const tasks = listTasks({ rootDir });
  const byState = tasks.reduce((acc, task) => {
    acc[task.state] = (acc[task.state] || 0) + 1;
    return acc;
  }, {});
  return {
    total: tasks.length,
    byState,
    next: tasks.find(task => task.state === STATES.queued) || null,
    lanes: Array.from(new Set(tasks.map(task => task.lane || 'default'))),
    generatedAt: new Date().toISOString()
  };
}
