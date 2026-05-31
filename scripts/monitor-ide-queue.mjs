import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CrashProofEngine } from '../src/core/autonomy/CrashProofEngine.js';

CrashProofEngine.initialize('MonitorIdeQueue');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const queueFile = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'ide_queue.json');
const inboxFile = path.join(rootDir, '.prompthouse-data', 'evo-layer', 'inbox', 'inbox.json');
const receiptDir = path.join(rootDir, 'proof_receipts', 'ide_completions');

console.log('🚀 [IDE Agent] Monitoring ide_queue.json for Brain 2 & 4 delegations...');

async function ensureDirs() {
  await fs.mkdir(path.dirname(queueFile), { recursive: true });
  await fs.mkdir(path.dirname(inboxFile), { recursive: true });
  await fs.mkdir(receiptDir, { recursive: true });
}

/**
 * Post a result message back to the MCP inbox so Brain 2 (ChatGPT) and Brain 4
 * can read completion receipts without polling the queue file directly.
 */
async function postToInbox(task, result) {
  let messages = [];
  try {
    messages = JSON.parse(await fs.readFile(inboxFile, 'utf-8'));
  } catch { /* inbox may not exist yet */ }

  messages.push({
    id: `ide_result_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'ide_task_result',
    source: 'ide_agent_brain3',
    taskId: task.id,
    originalSource: task.source,
    priority: task.priority,
    description: task.description,
    result,
    read: false,
  });

  await fs.writeFile(inboxFile, JSON.stringify(messages, null, 2), 'utf-8');
}

/**
 * Write a sealed proof receipt for every completed IDE task.
 */
async function writeReceipt(task, result) {
  const receipt = {
    taskId: task.id,
    completedAt: new Date().toISOString(),
    source: task.source,
    priority: task.priority,
    description: task.description,
    result,
  };
  const receiptPath = path.join(receiptDir, `receipt_${task.id}.json`);
  await fs.writeFile(receiptPath, JSON.stringify(receipt, null, 2), 'utf-8');
}

/**
 * Execute a queued IDE task. Currently logs and marks complete with a receipt.
 * This is the extension point where real execution (patch apply, git, etc.) hooks in.
 */
async function executeTask(task) {
  console.log(`\x1b[36m[IDE Agent] Executing Task: ${task.id}\x1b[0m`);
  console.log(`  Source:   ${task.source}`);
  console.log(`  Priority: ${task.priority}`);
  console.log(`  Task:     ${task.description}`);

  // --- Execution Hook ---
  // Future: route to TetherEngine for AI-powered execution, patch apply, etc.
  const result = {
    status: 'logged',
    message: `Task received and logged by IDE Agent (Brain 3). Full autonomous execution pending TetherEngine routing.`,
    executedAt: new Date().toISOString(),
  };

  // Post result back to inbox (Brain 2 / Brain 4 can read this)
  await postToInbox(task, result);

  // Write sealed proof receipt
  await writeReceipt(task, result);

  console.log(`\x1b[32m[IDE Agent] ✅ Task ${task.id} complete. Receipt written. Inbox notified.\x1b[0m`);
  return result;
}

async function checkQueue() {
  try {
    const content = await fs.readFile(queueFile, 'utf-8');
    let queue = JSON.parse(content);

    const pendingTasks = queue.filter((task) => task.status === 'pending');

    if (pendingTasks.length > 0) {
      console.log(`\n\x1b[36m[IDE Agent] Wakeup Signal! (${pendingTasks.length} pending tasks)\x1b[0m`);

      for (const task of pendingTasks) {
        // Mark as processing immediately to prevent double-execution
        task.status = 'processing';
        await fs.writeFile(queueFile, JSON.stringify(queue, null, 2), 'utf-8');

        try {
          const result = await executeTask(task);
          task.status = 'completed';
          task.result = result;
          task.completedAt = new Date().toISOString();
        } catch (execErr) {
          console.error(`[IDE Agent] ❌ Task ${task.id} failed:`, execErr.message);
          task.status = 'failed';
          task.error = execErr.message;
          await postToInbox(task, { status: 'failed', error: execErr.message });
        }

        // Persist the final state
        await fs.writeFile(queueFile, JSON.stringify(queue, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('[IDE Agent Error] Failed to process queue:', err.message);
    }
  }
}

await ensureDirs();

// Poll every 5 seconds
setInterval(checkQueue, 5000);
