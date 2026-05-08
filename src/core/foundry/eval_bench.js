/** Eval Bench - mod04 **/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3001';
const DATA_FILE = path.resolve('eval_bench_results.json');

class EvalBench {
    constructor() {
        this.results = [];
    }

    async fetchModelData(modelId) {
        const response = await fetch(`${BASE_URL}/models/${modelId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch model data: ${response.statusText}`);
        }
        return await response.json();
    }

    async benchmarkModel(modelId) {
        const modelData = await this.fetchModelData(modelId);
        const startTime = Date.now();

        // Simulate evaluation logic
        const accuracy = this.evaluateModel(modelData);
        const endTime = Date.now();
        const duration = endTime - startTime;

        const result = {
            modelId,
            accuracy,
            duration,
            timestamp: new Date().toISOString(),
        };

        this.results.push(result);
        await this.saveResults();
        return result;
    }

    evaluateModel(modelData) {
        // Simulated evaluation logic
        const randomAccuracy = Math.random(); // Simulating accuracy between 0 and 1
        return parseFloat(randomAccuracy.toFixed(2));
    }

    async saveResults() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.results, null, 2));
        } catch (error) {
            console.error('Error saving results:', error);
        }
    }

    loadResults() {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            this.results = JSON.parse(data);
        }
    }

    getResults() {
        return this.results;
    }
}

const evalBench = new EvalBench();
evalBench.loadResults();

export const benchmarkModel = async (modelId) => {
    return await evalBench.benchmarkModel(modelId);
};

export const getResults = () => {
    return evalBench.getResults();
};