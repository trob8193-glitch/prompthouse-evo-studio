/** Prompt Library - pb05 **/

import fs from 'fs';
import path from 'path';

const PROMPT_LIBRARY_FILE = path.resolve('promptLibrary.json');
const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001/prompts';

class PromptLibrary {
    constructor() {
        this.prompts = [];
        this.loadPrompts();
    }

    async loadPrompts() {
        try {
            const response = await fetch(LOCAL_BRIDGE_URL);
            if (!response.ok) throw new Error('Failed to fetch prompts from local bridge.');
            this.prompts = await response.json();
            this.savePrompts(); // Save to local file for persistence
        } catch (error) {
            console.error('Error loading prompts:', error);
            this.loadPromptsFromFile();
        }
    }

    loadPromptsFromFile() {
        if (fs.existsSync(PROMPT_LIBRARY_FILE)) {
            const data = fs.readFileSync(PROMPT_LIBRARY_FILE, 'utf-8');
            this.prompts = JSON.parse(data);
        } else {
            console.warn('No local prompt file found; initializing empty prompt library.');
            this.prompts = [];
        }
    }

    savePrompts() {
        fs.writeFileSync(PROMPT_LIBRARY_FILE, JSON.stringify(this.prompts, null, 2));
    }

    getAllPrompts() {
        return this.prompts;
    }

    getPromptById(id) {
        return this.prompts.find(prompt => prompt.id === id) || null;
    }

    addPrompt(newPrompt) {
        if (this.prompts.find(prompt => prompt.id === newPrompt.id)) {
            throw new Error(`Prompt with ID ${newPrompt.id} already exists.`);
        }
        this.prompts.push(newPrompt);
        this.savePrompts();
    }

    updatePrompt(updatedPrompt) {
        const index = this.prompts.findIndex(prompt => prompt.id === updatedPrompt.id);
        if (index === -1) {
            throw new Error(`Prompt with ID ${updatedPrompt.id} does not exist.`);
        }
        this.prompts[index] = updatedPrompt;
        this.savePrompts();
    }

    deletePrompt(id) {
        const index = this.prompts.findIndex(prompt => prompt.id === id);
        if (index === -1) {
            throw new Error(`Prompt with ID ${id} does not exist.`);
        }
        this.prompts.splice(index, 1);
        this.savePrompts();
    }
}

const promptLibrary = new PromptLibrary();

export const getAllPrompts = () => promptLibrary.getAllPrompts();
export const getPromptById = (id) => promptLibrary.getPromptById(id);
export const addPrompt = (newPrompt) => promptLibrary.addPrompt(newPrompt);
export const updatePrompt = (updatedPrompt) => promptLibrary.updatePrompt(updatedPrompt);
export const deletePrompt = (id) => promptLibrary.deletePrompt(id);