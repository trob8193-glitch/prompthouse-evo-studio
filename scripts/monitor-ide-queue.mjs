import fs from 'fs/promises';
import path from 'path';

const queueFile = path.join(process.cwd(), '.prompthouse-data', 'evo-layer', 'ide_queue.json');

console.log("🚀 [IDE Agent] Monitoring ide_queue.json for Brain 2 & 4 delegations...");

async function checkQueue() {
  try {
    const content = await fs.readFile(queueFile, 'utf-8');
    let queue = JSON.parse(content);
    
    const pendingTasks = queue.filter(task => task.status === 'pending');
    
    if (pendingTasks.length > 0) {
      console.log(`\n\x1b[36m[IDE Agent] Wakeup Signal Received! (${pendingTasks.length} pending tasks)\x1b[0m`);
      
      pendingTasks.forEach(task => {
        console.log(`\x1b[33m--- NEW TASK FROM ${task.source.toUpperCase()} ---\x1b[0m`);
        console.log(`ID: ${task.id}`);
        console.log(`Priority: ${task.priority}`);
        console.log(`Description: ${task.description}`);
        console.log(`\x1b[33m--------------------------------------\x1b[0m`);
        
        // Mark as processing
        task.status = 'processing';
      });

      // We save the queue back so we don't process them again
      await fs.writeFile(queueFile, JSON.stringify(queue, null, 2), 'utf-8');
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error("[IDE Agent Error] Failed to read queue:", err.message);
    }
  }
}

// Poll every 5 seconds
setInterval(checkQueue, 5000);
