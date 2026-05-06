/** Shadow Run Simulator - pb19 **/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const LOCAL_BRIDGE_URL = 'http://localhost:3001';
const PERSISTENCE_FILE = path.resolve(__dirname, 'simulator_data.json');

class ShadowRunSimulator {
    constructor() {
        this.workflows = [];
        this.loadWorkflows();
    }

    async loadWorkflows() {
        try {
            const data = await fs.promises.readFile(PERSISTENCE_FILE, 'utf8');
            this.workflows = JSON.parse(data);
        } catch (error) {
            console.error('Error loading workflows:', error);
            this.workflows = [];
        }
    }

    async saveWorkflows() {
        try {
            await fs.promises.writeFile(PERSISTENCE_FILE, JSON.stringify(this.workflows, null, 2));
        } catch (error) {
            console.error('Error saving workflows:', error);
        }
    }

    addWorkflow(workflow) {
        this.workflows.push(workflow);
        return this.saveWorkflows();
    }

    async runSimulation(workflowId) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) {
            throw new Error('Workflow not found');
        }
        
        const response = await fetch(`${LOCAL_BRIDGE_URL}/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(workflow),
        });

        if (!response.ok) {
            throw new Error('Simulation failed: ' + response.statusText);
        }

        const result = await response.json();
        return result;
    }

    async getSimulationResults(workflowId) {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) {
            throw new Error('Workflow not found');
        }

        const response = await fetch(`${LOCAL_BRIDGE_URL}/results/${workflowId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch simulation results: ' + response.statusText);
        }

        const results = await response.json();
        return results;
    }
}

const simulator = new ShadowRunSimulator();

export const addWorkflow = (workflow) => simulator.addWorkflow(workflow);
export const runSimulation = (workflowId) => simulator.runSimulation(workflowId);
export const getSimulationResults = (workflowId) => simulator.getSimulationResults(workflowId);