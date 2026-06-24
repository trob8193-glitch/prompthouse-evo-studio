import { Log } from '../autonomy/SovereignLogger.js';

/**
 * PH EVO STUDIO — MISSION QUEUE (PHASE 14)
 * ═══════════════════════════════════════════════════════════════
 * Dynamic priority queue for mission allocation. Orders tasks 
 * based on urgency, complexity, and bot specialization.
 */

export class MissionQueue {
  constructor() {
    this.queue = [];
    this.history = [];
  }

  enqueue(task, priority = 1, requiredSpecialty = null) {
    Log.info(`📥 [Queue] Enqueueing task: ${task} (Priority: ${priority})`);
    const entry = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      task,
      priority,
      requiredSpecialty,
      timestamp: Date.now(),
      status: 'QUEUED'
    };
    
    this.queue.push(entry);
    this.sortQueue();
    return entry.id;
  }

  sortQueue() {
    // Sort by priority (descending) and then by timestamp (ascending)
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.timestamp - b.timestamp;
    });
  }

  popNext(botSpecialty = null) {
    if (this.queue.length === 0) return null;

    // If a specialty is provided, find the highest priority task matching it
    if (botSpecialty) {
      const matchIndex = this.queue.findIndex(t => t.requiredSpecialty === botSpecialty || !t.requiredSpecialty);
      if (matchIndex !== -1) {
        return this.queue.splice(matchIndex, 1)[0];
      }
    }

    return this.queue.shift();
  }

  getStats() {
    return {
      pending: this.queue.length,
      completed: this.history.length,
      topPriority: this.queue[0]?.priority || 0
    };
  }
}
