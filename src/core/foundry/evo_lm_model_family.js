/** Evo LM model family - mod01 **/

import fs from 'fs';
import path from 'path';

const MODEL_DEFINITIONS_PATH = path.join(__dirname, 'model_definitions.json');
const LOCAL_BRIDGE_URL = 'http://localhost:3001/models';

class EvoLMModelFamily {
    constructor() {
        this.models = this.loadModels();
    }

    loadModels() {
        if (fs.existsSync(MODEL_DEFINITIONS_PATH)) {
            const data = fs.readFileSync(MODEL_DEFINITIONS_PATH, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    }

    saveModels() {
        fs.writeFileSync(MODEL_DEFINITIONS_PATH, JSON.stringify(this.models, null, 2));
    }

    async fetchModelsFromServer() {
        try {
            const response = await fetch(LOCAL_BRIDGE_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const models = await response.json();
            this.models = models;
            this.saveModels();
        } catch (error) {
            console.error('Failed to fetch models from server:', error);
        }
    }

    addModel(modelDefinition) {
        this.models.push(modelDefinition);
        this.saveModels();
    }

    getModelById(modelId) {
        return this.models.find(model => model.id === modelId);
    }

    updateModel(modelId, updatedDefinition) {
        const index = this.models.findIndex(model => model.id === modelId);
        if (index !== -1) {
            this.models[index] = { ...this.models[index], ...updatedDefinition };
            this.saveModels();
        } else {
            throw new Error(`Model with ID ${modelId} not found`);
        }
    }

    deleteModel(modelId) {
        this.models = this.models.filter(model => model.id !== modelId);
        this.saveModels();
    }

    getAllModels() {
        return this.models;
    }
}

const modelFamily = new EvoLMModelFamily();

export const addModel = (modelDefinition) => {
    modelFamily.addModel(modelDefinition);
};

export const getModelById = (modelId) => {
    return modelFamily.getModelById(modelId);
};

export const updateModel = (modelId, updatedDefinition) => {
    return modelFamily.updateModel(modelId, updatedDefinition);
};

export const deleteModel = (modelId) => {
    modelFamily.deleteModel(modelId);
};

export const getAllModels = () => {
    return modelFamily.getAllModels();
};

export const fetchModelsFromServer = async () => {
    await modelFamily.fetchModelsFromServer();
};