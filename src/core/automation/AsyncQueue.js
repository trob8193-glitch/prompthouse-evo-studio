/**
 * AsyncQueue - Manages high-load automated tasks without blocking the main event loop.
 * Part of the "Reducing Delays" action plan.
 */

export class AsyncQueue {
  constructor(concurrency = 2) {
    this.queue = [];
    this.running = 0;
    this.concurrency = concurrency;
    this.history = [];
  }

  async push(taskName, taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskName, taskFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;

    const { taskName, taskFn, resolve, reject } = this.queue.shift();
    this.running++;
    
    const start = Date.now();
    console.log(`[Queue] Starting task: ${taskName}`);

    try {
      const result = await taskFn();
      const duration = Date.now() - start;
      this.history.push({ taskName, duration, status: 'success', timestamp: Date.now() });
      resolve(result);
    } catch (err) {
      console.error(`[Queue] Task failed: ${taskName}`, err);
      this.history.push({ taskName, duration: Date.now() - start, status: 'failed', error: err.message, timestamp: Date.now() });
      reject(err);
    } finally {
      this.running--;
      this.process();
    }
  }

  getMetrics() {
    const total = this.history.length;
    const avgDuration = total > 0 ? this.history.reduce((a, b) => a + b.duration, 0) / total : 0;
    return {
      activeTasks: this.running,
      queuedTasks: this.queue.length,
      completedTotal: total,
      avgDurationMs: avgDuration.toFixed(2)
    };
  }
}

export const globalQueue = new AsyncQueue();
