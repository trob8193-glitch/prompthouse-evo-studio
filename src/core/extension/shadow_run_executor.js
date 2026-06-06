/** Shadow Run Executor - pb19 **/

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

import { Log } from '../autonomy/SovereignLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSISTENCE_FILE = path.resolve(__dirname, 'executor_data.json');

class ShadowRunExecutor {
    constructor() {
        this.workflows = [];
        this.loadWorkflows();
    }

    async loadWorkflows() {
        try {
            const data = await fs.promises.readFile(PERSISTENCE_FILE, 'utf8');
            this.workflows = JSON.parse(data);
        } catch (error) {
            this.workflows = [];
        }
    }

    async saveWorkflows() {
        try {
            await fs.promises.writeFile(PERSISTENCE_FILE, JSON.stringify(this.workflows, null, 2));
        } catch (error) {
            Log.error('Error saving workflows:', error);
        }
    }

    addWorkflow(workflow) {
        this.workflows.push(workflow);
        return this.saveWorkflows();
    }

    async runExecution(workflowId) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) throw new Error('Workflow not found');
        
        // LIVE EXECUTION IN ISOLATED VM (NO SIMULATIONS)
        try {
            const sandbox = { 
                console: { log: (...args) => { sandbox.result = (sandbox.result ? sandbox.result + '\\n' : '') + args.join(' '); } }, 
                setTimeout,
                result: null
            };
            const context = vm.createContext(sandbox);
            const script = new vm.Script(workflow.code || 'result = { success: true, timestamp: Date.now() };');
            
            return script.runInContext(context, { timeout: 5000 });
        } catch (err) {
            return {
                id: workflowId,
                status: 'FAILED_LIVE',
                output: null,
                error: `Live execution failed: ${err.message}`
            };
        }
    }
}

const executor = new ShadowRunExecutor();

export const addWorkflow = (workflow) => executor.addWorkflow(workflow);
export const runExecution = (workflowId) => executor.runExecution(workflowId);
