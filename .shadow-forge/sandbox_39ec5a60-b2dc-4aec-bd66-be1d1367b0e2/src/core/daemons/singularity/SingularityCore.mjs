import fs from 'fs';
import path from 'path';
import url from 'url';

const STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'singularity_state.json');

function ensureDir() {
  const dir = path.dirname(STATE_FILE());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * SINGULARITY CORE DAEMON
 * Orchestrates the singularity training loop — collects interaction data,
 * builds training samples, and feeds them to the OnlineLearningManager.
 */
export class SingularityCore {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.cycleCount = 0;
  }

  start(intervalMs = 60000) {
    if (this.intervalId) return;
    console.log(`[SingularityCore] Training loop starting with ${intervalMs}ms interval.`);
    this.intervalId = setInterval(() => this.tick(), intervalMs);
    this.tick();
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  async tick() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      // Collect interaction data from sovereign_broadcast.log
      const logPath = path.join(process.cwd(), 'sovereign_broadcast.log');
      let newEntries = 0;

      if (fs.existsSync(logPath)) {
        const stat = fs.statSync(logPath);
        // Only process if log has content and is recent (modified in last 5 min)
        if (stat.size > 0 && (Date.now() - stat.mtimeMs) < 300000) {
          try {
            const { OnlineLearningManager } = await import('../../evolution/OnlineLearningManager.js');
            const learner = new OnlineLearningManager();

            // Read last 20 lines
            const content = fs.readFileSync(logPath, 'utf8');
            const lines = content.trim().split('\n').slice(-20);

            for (const line of lines) {
              if (line.includes('[EXTERNAL IDE UPLINK]') || line.includes('[SOVEREIGN UPLINK]')) {
                await learner.ingestKnowledgeChunk({
                  id: `singularity_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                  source: 'singularity_training',
                  signal_strength: 0.7,
                  context_summary: line.slice(0, 500)
                });
                newEntries++;
              }
            }
          } catch {}
        }
      }

      // Collect from work memory events
      const workMemoryPath = path.join(process.cwd(), '.evo-llm', 'work-memory', 'events.jsonl');
      if (fs.existsSync(workMemoryPath)) {
        try {
          const { OnlineLearningManager } = await import('../../evolution/OnlineLearningManager.js');
          const learner = new OnlineLearningManager();
          const events = fs.readFileSync(workMemoryPath, 'utf8').trim().split('\n').slice(-10);
          for (const line of events) {
            try {
              const event = JSON.parse(line);
              if (event.sourceType && !event._ingested) {
                await learner.ingestKnowledgeChunk({
                  id: `work_mem_${event.id || Date.now()}`,
                  source: 'work_memory',
                  signal_strength: 0.6,
                  context_summary: `[WorkMemory] ${event.sourceType}: ${JSON.stringify(event.rawEvent || {}).slice(0, 300)}`
                });
                newEntries++;
              }
            } catch {}
          }
        } catch {}
      }

      this.cycleCount++;
      const state = {
        active: true,
        cycleCount: this.cycleCount,
        lastTickAt: new Date().toISOString(),
        entriesIngested: newEntries
      };

      ensureDir();
      fs.writeFileSync(STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');

    } catch (err) {
      console.error('[SingularityCore] Tick error:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  getStatus() {
    if (fs.existsSync(STATE_FILE())) {
      try { return JSON.parse(fs.readFileSync(STATE_FILE(), 'utf8')); } catch {}
    }
    return { active: false, cycleCount: 0 };
  }
}

export function run() {
  const core = new SingularityCore();
  core.start();
  return core;
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) run();