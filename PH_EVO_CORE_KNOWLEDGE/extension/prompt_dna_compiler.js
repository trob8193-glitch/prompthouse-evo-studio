/** Prompt DNA Compiler - pb15 **/

import fs from 'fs';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';
const STORAGE_FILE = 'promptDNAStacks.json';

class PromptDNACompiler {
    constructor() {
        this.stacks = this.loadStacks();
    }

    async synthesize(rawText) {
        const layers = this.extractLayers(rawText);
        const structuredStack = this.createStructuredStack(layers);
        this.stacks.push(structuredStack);
        await this.saveStacks();
        return structuredStack;
    }

    extractLayers(rawText) {
        const sentences = rawText.split('.').map(sentence => sentence.trim()).filter(Boolean);
        const layers = [];
        
        for (let i = 0; i < 6; i++) {
            layers.push(sentences[i] || '');
        }
        
        return layers;
    }

    createStructuredStack(layers) {
        return {
            layer1: layers[0],
            layer2: layers[1],
            layer3: layers[2],
            layer4: layers[3],
            layer5: layers[4],
            layer6: layers[5],
            createdAt: new Date().toISOString(),
        };
    }

    loadStacks() {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    }

    async saveStacks() {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.stacks, null, 2));
        await this.persistToAPI();
    }

    async persistToAPI() {
        const response = await fetch(`${API_URL}/saveStacks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.stacks),
        });

        if (!response.ok) {
            throw new Error('Failed to persist stacks to API');
        }
    }

    getStacks() {
        return this.stacks;
    }
}

const compiler = new PromptDNACompiler();

export const synthesizePrompt = async (rawText) => {
    return await compiler.synthesize(rawText);
};

export const getAllStacks = () => {
    return compiler.getStacks();
};