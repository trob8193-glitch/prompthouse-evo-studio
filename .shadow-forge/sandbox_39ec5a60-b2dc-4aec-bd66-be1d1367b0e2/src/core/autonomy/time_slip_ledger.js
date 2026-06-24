import { execSync } from 'child_process';
import { Log } from './SovereignLogger.js';
import fs from 'fs';
import path from 'path';

/**
 * Time-Slip Ledger
 * Forces the AI into a step-by-step hierarchical loop, backing up state 
 * with Git commits before each step to prevent runaway failures.
 */
export class TimeSlipLedger {
    constructor(workspaceDir) {
        this.workspaceDir = workspaceDir;
        this.maxRetries = 3;
    }

    /**
     * Executes a shell command synchronously and returns output.
     */
    runCommand(cmd) {
        try {
            return execSync(cmd, { cwd: this.workspaceDir, encoding: 'utf8', stdio: 'pipe' });
        } catch (error) {
            Log.error(`Command failed: ${cmd}`, error.message);
            throw error;
        }
    }

    /**
     * Creates a time-slip checkpoint (hidden Git commit)
     */
    checkpoint(slipId) {
        try {
            Log.info(`[Time-Slip] Creating checkpoint: ${slipId}`);
            this.runCommand('git add .');
            this.runCommand(`git commit -m "evo-auto-slip-${slipId}" --allow-empty`);
            // Retrieve the hash of the commit
            const hash = this.runCommand('git rev-parse HEAD').trim();
            return hash;
        } catch (err) {
            Log.error(`[Time-Slip] Checkpoint failed for ${slipId}`);
            return null;
        }
    }

    /**
     * Rolls back to a previous checkpoint.
     */
    rollback(hash) {
        try {
            Log.warn(`[Time-Slip] Rolling back to checkpoint: ${hash}`);
            this.runCommand(`git reset --hard ${hash}`);
            return true;
        } catch (err) {
            Log.error(`[Time-Slip] Rollback failed to ${hash}`);
            return false;
        }
    }

    /**
     * Enforces the hierarchical plan. Executes a step, checkpoints, 
     * and rolls back if execution fails repeatedly.
     */
    async enforcePlan(planSteps, executeStepCallback) {
        Log.info(`[Time-Slip] Enforcing plan with ${planSteps.length} steps.`);
        
        for (let i = 0; i < planSteps.length; i++) {
            const step = planSteps[i];
            const slipId = `step-${i + 1}-${Date.now()}`;
            
            // Create checkpoint BEFORE executing the step
            const checkpointHash = this.checkpoint(slipId);
            if (!checkpointHash) {
                throw new Error("Failed to secure time-slip checkpoint. Halting execution.");
            }

            let attempts = 0;
            let success = false;

            while (attempts < this.maxRetries && !success) {
                attempts++;
                try {
                    Log.info(`[Time-Slip] Executing Step ${i + 1}: ${step.title} (Attempt ${attempts})`);
                    // The callback should return a boolean or throw
                    success = await executeStepCallback(step, attempts);
                } catch (err) {
                    success = false;
                    Log.error(`[Time-Slip] Step ${i + 1} execution threw an error: ${err.message}`);
                }

                if (!success) {
                    Log.warn(`[Time-Slip] Step ${i + 1} failed. Rolling back to ${checkpointHash}`);
                    this.rollback(checkpointHash);
                }
            }

            if (!success) {
                const msg = `[Time-Slip] Step ${i + 1} permanently failed after ${this.maxRetries} attempts. Execution halted. Paging human pilot.`;
                Log.error(msg);
                throw new Error(msg);
            }
        }

        Log.info(`[Time-Slip] Plan executed successfully.`);
        return true;
    }
}
