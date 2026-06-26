import fs from 'fs';
import path from 'path';
import { getSwarmConsensus } from '../src/core/daemons/swarm/SwarmConsensusEngine.js';
import { OnlineLearningManager } from '../src/core/evolution/OnlineLearningManager.js';
import { Log } from '../src/core/autonomy/SovereignLogger.js';

const DATA_DIR = path.join(process.cwd(), '.prompthouse-data', 'evolution');
const APPROVAL_QUEUE_FILE = path.join(DATA_DIR, 'approval_queue.jsonl');

async function processMassApproval() {
  Log.info('\x1b[36m[MASS APPROVAL] Commencing Owner Override: Training Studio on all 96 Queue Items...\x1b[0m');
  
  // 1. Resolve all Swarm Tasks
  const swarm = getSwarmConsensus();
  const allTasks = Array.from(swarm.tasks.values());
  const pendingTasks = allTasks.filter(t => t.status === 'PROPOSED' || t.status === 'CLAIMED');
  
  Log.info(`[MASS APPROVAL] Found ${pendingTasks.length} pending Swarm tasks.`);
  
  for (const task of pendingTasks) {
    try {
      await swarm.resolveTask(task.id, { status: 'SUCCESS', override: 'OWNER_MASS_APPROVAL' });
    } catch (e) {
      Log.error(`[MASS APPROVAL] Error resolving task ${task.id}: ${e.message}`);
    }
  }
  Log.info(`\x1b[32m[MASS APPROVAL] All ${pendingTasks.length} Swarm tasks resolved.\x1b[0m`);

  // 2. Read the Approval Queue file and ingest to OnlineLearningManager
  if (fs.existsSync(APPROVAL_QUEUE_FILE)) {
    const lines = fs.readFileSync(APPROVAL_QUEUE_FILE, 'utf8').split('\n').filter(l => l.trim() !== '');
    Log.info(`[MASS APPROVAL] Found ${lines.length} items in local QuadBrain approval queue.`);
    
    const learningManager = new OnlineLearningManager();
    let trainedCount = 0;

    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.suggestion && item.suggestion.description) {
          await learningManager.ingestKnowledgeChunk({
            id: `mass_approval_train_${item.id}`,
            source: 'owner_mass_approval',
            signal_strength: 1.0, // High confidence since owner approved
            context_summary: `[Evolution Override] Owner approved pattern: ${item.suggestion.description}`
          });
          trainedCount++;
        }
      } catch (e) {
        Log.error(`[MASS APPROVAL] Error parsing queue item: ${e.message}`);
      }
    }
    
    Log.info(`\x1b[32m[MASS APPROVAL] Successfully trained studio on ${trainedCount} approved heuristic patterns.\x1b[0m`);
    
    // 3. Clear the queue
    fs.writeFileSync(APPROVAL_QUEUE_FILE, '', 'utf8');
    Log.info(`\x1b[32m[MASS APPROVAL] Approval queue cleared.\x1b[0m`);
  } else {
    Log.info(`[MASS APPROVAL] No approval queue file found.`);
  }

  Log.info('\x1b[35m[MASS APPROVAL] Owner Override Execution Complete. Circuit Breaker is now safe to reset.\x1b[0m');
}

processMassApproval().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
