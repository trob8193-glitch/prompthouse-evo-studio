/**
 * AsyncQueue — Priority-based async queue for background task management
 * Status: ACTIVE
 */
export class AsyncQueue {
  constructor(concurrency = 3) {
    this.name = 'AsyncQueue';
    this.description = 'Priority-based async queue for background task management';
    this.status = 'ACTIVE';
    this.concurrency = concurrency;
    this.queue = [];       // { id, fn, priority, added }
    this.running = 0;
    this.completed = [];
    this.failed = [];
  }

  enqueue(id, fn, priority = 0) {
    this.queue.push({ id, fn, priority, added: Date.now() });
    this.queue.sort((a, b) => b.priority - a.priority);
    this._tick();
    return id;
  }

  async _tick() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      this.running++;
      try {
        const result = await task.fn();
        this.completed.push({ id: task.id, result, finishedAt: Date.now() });
      } catch (err) {
        this.failed.push({ id: task.id, error: err.message, finishedAt: Date.now() });
      } finally {
        this.running--;
      }
    }
  }

  async drain() {
    while (this.queue.length > 0 || this.running > 0) {
      await new Promise(r => setTimeout(r, 10));
    }
    return { completed: this.completed.length, failed: this.failed.length };
  }

  getMetrics() {
    return {
      queued: this.queue.length,
      running: this.running,
      completed: this.completed.length,
      failed: this.failed.length
    };
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'A',
      state: this.status,
      resonance: 100,
      description: this.description,
      ...this.getMetrics()
    };
  }
}

