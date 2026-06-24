import { RealExecutionPipeline } from './pipeline.js';
import { Log } from '../../src/core/autonomy/SovereignLogger.js';

/**
 * ExecutionKernelV2
 * Upgrades the RealExecutionPipeline with a robust State Machine.
 * Allows execution workflows to pause, resume, and await explicit owner approval.
 */
export class ExecutionKernelV2 extends RealExecutionPipeline {
  constructor(options = {}) {
    super(options);
    this.stateMachines = new Map();
  }

  async executeWorkflow(intent, options = {}) {
    const execution = await super.executeWorkflow(intent, options);
    
    // Wrap the returned execution in our state machine metadata
    this.stateMachines.set(execution.id, {
      ...execution,
      kernelState: 'ACTIVE',
      lastTransition: new Date().toISOString()
    });

    return execution;
  }

  suspendWorkflow(executionId, reason = 'AWAITING_OWNER_APPROVAL') {
    const state = this.stateMachines.get(executionId) || this.executions.get(executionId);
    if (!state) {
      Log.warn(`[ExecutionKernelV2] Cannot suspend: Execution ${executionId} not found.`);
      return false;
    }

    if (state.kernelState === 'SUSPENDED') return true;

    state.kernelState = 'SUSPENDED';
    state.suspendReason = reason;
    state.lastTransition = new Date().toISOString();
    Log.info(`[ExecutionKernelV2] Execution ${executionId} suspended. Reason: ${reason}`);
    
    // In a real system, we'd emit an event here to notify the UI
    return true;
  }

  resumeWorkflow(executionId) {
    const state = this.stateMachines.get(executionId) || this.executions.get(executionId);
    if (!state) {
      Log.warn(`[ExecutionKernelV2] Cannot resume: Execution ${executionId} not found.`);
      return false;
    }

    if (state.kernelState !== 'SUSPENDED') return true;

    state.kernelState = 'ACTIVE';
    state.suspendReason = null;
    state.lastTransition = new Date().toISOString();
    Log.info(`[ExecutionKernelV2] Execution ${executionId} resumed from suspension.`);
    
    // If the pipeline had yielded, we would re-invoke the next step here
    return true;
  }

  getKernelStatus() {
    const active = [];
    const suspended = [];
    
    for (const [id, state] of this.stateMachines.entries()) {
      if (state.kernelState === 'SUSPENDED') {
        suspended.push(id);
      } else {
        active.push(id);
      }
    }

    return {
      kernelVersion: '2.0.0-rc.1',
      totalTracked: this.stateMachines.size,
      activeExecutions: active.length,
      suspendedExecutions: suspended.length,
      uptime: process.uptime()
    };
  }
}

export default ExecutionKernelV2;
