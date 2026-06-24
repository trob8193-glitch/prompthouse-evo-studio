import { Log } from './SovereignLogger.js';

class MetacognitiveObserver {
  constructor() {
    this.failureCounts = new Map();
  }

  recordFailure(filePath) {
    const current = this.failureCounts.get(filePath) || 0;
    const nextCount = current + 1;
    this.failureCounts.set(filePath, nextCount);
    Log.warn(`[MetacognitiveObserver] Recorded failure for ${filePath}. Total: ${nextCount}`);

    if (nextCount >= 3) {
      this.failureCounts.set(filePath, 0); // Reset after triggering
      return {
        triggered: true,
        pivotOverride: `[STRATEGIC PIVOT OVERRIDE] You have failed to fix the syntax in ${filePath} 3 times in a row. Your architectural approach is fundamentally flawed. Stop trying to patch the existing syntax. Step back, invent a completely new design pattern for this component, and rewrite it from scratch.`
      };
    }

    return { triggered: false };
  }

  reset(filePath) {
    this.failureCounts.set(filePath, 0);
  }
}

export const metacognitiveObserver = new MetacognitiveObserver();
