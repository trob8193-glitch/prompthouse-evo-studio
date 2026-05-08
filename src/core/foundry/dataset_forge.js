/** Dataset Forge - mod03 **/

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3001';
const DATASET_FILE = path.join(__dirname, 'datasets.json');

class DatasetForge {
    constructor() {
        this.datasets = this.loadDatasets();
    }

    async synthesizeExamples(numExamples, params) {
        const examples = [];
        for (let i = 0; i < numExamples; i++) {
            const example = this.generateSyntheticExample(params);
            examples.push(example);
        }
        await this.saveDataset(examples);
        return examples;
    }

    generateSyntheticExample(params) {
        // Logic to generate a synthetic example based on provided parameters
        const example = {
            id: this.generateId(),
            featureA: this.randomValue(params.rangeA),
            featureB: this.randomValue(params.rangeB),
            label: this.randomLabel(params.labels)
        };
        return example;
    }

    randomValue(range) {
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    randomLabel(labels) {
        return labels[Math.floor(Math.random() * labels.length)];
    }

    generateId() {
        return `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    async saveDataset(examples) {
        this.datasets.push(...examples);
        await this.persistDatasets();
    }

    async persistDatasets() {
        const data = JSON.stringify(this.datasets, null, 2);
        await fs.promises.writeFile(DATASET_FILE, data);
        await this.sendToServer(data);
    }

    async sendToServer(data) {
        const response = await fetch(`${BASE_URL}/datasets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        });
        if (!response.ok) {
            throw new Error('Failed to send dataset to server: ' + response.statusText);
        }
    }

    loadDatasets() {
        if (fs.existsSync(DATASET_FILE)) {
            const data = fs.readFileSync(DATASET_FILE);
            return JSON.parse(data);
        }
        return [];
    }
}

const datasetForge = new DatasetForge();

export const synthesize = async (numExamples, params) => {
    return await datasetForge.synthesizeExamples(numExamples, params);
};

export const loadExistingDatasets = () => {
    return datasetForge.datasets;
};