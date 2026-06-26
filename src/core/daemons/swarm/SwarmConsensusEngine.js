import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getMegaTether } from '../../tethers/MegaTetherCore.js';
import { GlobalWebhookDispatcher } from '../../api/WebhookDispatcher.js';

const SWARM_STATE_FILE = () => path.join(process.cwd(), '.prompthouse-data', 'daemons', 'swarm_state.json');

function ensureDir() {
  const dir = path.dirname(SWARM_STATE_FILE());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Swarm Consensus Engine
 * Manages the shared Task Queue for daemons to collaborate.
 */
export class SwarmConsensusEngine {
  constructor() {
    this.tasks = new Map();
    this.loadState();
  }

  loadState() {
    ensureDir();
    if (fs.existsSync(SWARM_STATE_FILE())) {
      try {
        const state = JSON.parse(fs.readFileSync(SWARM_STATE_FILE(), 'utf8'));
        this.tasks = new Map(state.tasks || []);
      } catch (err) {
        console.error('[Swarm] Failed to load state:', err.message);
      }
    }
  }

  saveState() {
    ensureDir();
    const state = {
      tasks: Array.from(this.tasks.entries()),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(SWARM_STATE_FILE(), JSON.stringify(state, null, 2), 'utf8');
  }

  /**
   * Called by an agent (e.g. FinanceDaemon) to propose a task.
   */
  async proposeTask(sourceAgent, type, payload) {
    const taskId = crypto.randomUUID();
    const task = {
      id: taskId,
      source: sourceAgent,
      type,
      payload,
      status: 'PROPOSED',
      createdAt: new Date().toISOString()
    };

    this.tasks.set(taskId, task);
    this.saveState();
    
    console.log(`[Swarm] Task PROPOSED [${type}] by ${sourceAgent} (ID: ${taskId})`);
    
    // Dispatch webhook for newly proposed task
    GlobalWebhookDispatcher.dispatch({ event: 'SWARM_TASK_PROPOSED', task });

    let tether = null;
    try { tether = getMegaTether(); } catch (e) {}
    if (tether) {
      await tether.broadcast('swarm_consensus', 'SWARM_TASK_PROPOSED', task);
    }
    
    return taskId;
  }

  /**
   * Called by an agent (e.g. QuadBrain) to claim a proposed task.
   */
  async claimTask(taskId, claimingAgent) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'PROPOSED') throw new Error(`Task already ${task.status}`);

    task.status = 'CLAIMED';
    task.claimedBy = claimingAgent;
    task.claimedAt = new Date().toISOString();
    
    this.tasks.set(taskId, task);
    this.saveState();

    console.log(`[Swarm] Task CLAIMED by ${claimingAgent} (ID: ${taskId})`);

    let tether = null;
    try { tether = getMegaTether(); } catch (e) {}
    if (tether) {
      await tether.broadcast('swarm_consensus', 'SWARM_TASK_CLAIMED', task);
    }
    
    return task;
  }

  /**
   * Called by an agent to resolve a task they claimed.
   */
  async resolveTask(taskId, resolutionPayload) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.status = 'RESOLVED';
    task.resolution = resolutionPayload;
    task.resolvedAt = new Date().toISOString();
    
    this.tasks.set(taskId, task);
    this.saveState();

    console.log(`[Swarm] Task RESOLVED by ${task.claimedBy} (ID: ${taskId})`);
    
    // Dispatch webhook for resolved task
    GlobalWebhookDispatcher.dispatch({ event: 'SWARM_TASK_RESOLVED', task });

    let tether = null;
    try { tether = getMegaTether(); } catch (e) {}
    if (tether) {
      await tether.broadcast('swarm_consensus', 'SWARM_TASK_RESOLVED', task);
    }
    
    return task;
  }
  /**
   * Called to veto/reject a proposed task, usually from MCP or an overriding director.
   */
  async vetoTask(taskId, reason) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    
    task.status = 'VETOED';
    task.vetoReason = reason;
    task.vetoedAt = new Date().toISOString();
    
    this.tasks.set(taskId, task);
    this.saveState();

    console.log(`[Swarm] Task VETOED (ID: ${taskId}) - ${reason}`);

    let tether = null;
    try { tether = getMegaTether(); } catch (e) {}
    if (tether) {
      await tether.broadcast('swarm_consensus', 'SWARM_TASK_VETOED', task);
    }
    
    return task;
  }

  /**
   * Directly inject a high priority directive.
   */
  async injectDirective(directivePayload) {
    return this.proposeTask('MCP_DIRECTOR', 'HIGH_PRIORITY_DIRECTIVE', directivePayload);
  }

  /**
   * Fetch tasks by status
   */
  getTasksByStatus(status) {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }
}

let globalSwarm = null;

export function getSwarmConsensus() {
  if (!globalSwarm) {
    globalSwarm = new SwarmConsensusEngine();
  }
  return globalSwarm;
}
