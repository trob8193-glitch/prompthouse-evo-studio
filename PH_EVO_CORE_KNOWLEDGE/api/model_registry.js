/** Model registry - api13 **/

import fs from 'fs';
import { fetch } from 'node-fetch';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3001/models';
const DATA_FILE = path.resolve('models.json');

class ModelRegistry {
    constructor() {
        this.models = this.loadModels();
    }

    loadModels() {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    }

    saveModels() {
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.models, null, 2));
    }

    async fetchModelFromAPI(modelId) {
        const response = await fetch(`${BASE_URL}/${modelId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.statusText}`);
        }
        return response.json();
    }

    addModel(model) {
        if (this.models[model.id]) {
            throw new Error(`Model with ID ${model.id} already exists.`);
        }
        this.models[model.id] = model;
        this.saveModels();
    }

    updateModel(model) {
        if (!this.models[model.id]) {
            throw new Error(`Model with ID ${model.id} does not exist.`);
        }
        this.models[model.id] = model;
        this.saveModels();
    }

    deleteModel(modelId) {
        if (!this.models[modelId]) {
            throw new Error(`Model with ID ${modelId} does not exist.`);
        }
        delete this.models[modelId];
        this.saveModels();
    }

    getModel(modelId) {
        return this.models[modelId] || null;
    }

    async deployModel(modelId) {
        const model = await this.fetchModelFromAPI(modelId);
        if (!model) {
            throw new Error(`Model with ID ${modelId} not found in the registry.`);
        }
        // Trigger deployment logic here (not implemented)
        console.log(`Deploying model: ${modelId}`);
        return model;
    }

    listModels() {
        return Object.values(this.models);
    }
}

const modelRegistry = new ModelRegistry();

export const addModel = (model) => modelRegistry.addModel(model);
export const updateModel = (model) => modelRegistry.updateModel(model);
export const deleteModel = (modelId) => modelRegistry.deleteModel(modelId);
export const getModel = (modelId) => modelRegistry.getModel(modelId);
export const deployModel = (modelId) => modelRegistry.deployModel(modelId);
export const listModels = () => modelRegistry.listModels();