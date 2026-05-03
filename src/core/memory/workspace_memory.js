/** Workspace memory - mem03 **/

import fs from 'fs';
import path from 'path';

const MEMORY_FILE = path.join(__dirname, 'workspace_memory.json');
const LOCAL_BRIDGE_URL = 'http://localhost:3001/memory';

class WorkspaceMemory {
    constructor() {
        this.memory = {};
        this.loadMemory();
    }

    async loadMemory() {
        try {
            const data = await fs.promises.readFile(MEMORY_FILE, 'utf-8');
            this.memory = JSON.parse(data);
        } catch (error) {
            console.warn('No existing memory file found, starting fresh.');
            this.memory = {};
        }
    }

    async saveMemory() {
        await fs.promises.writeFile(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
    }

    async fetchMemoryFromServer() {
        const response = await fetch(LOCAL_BRIDGE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch memory from server');
        }
        const serverMemory = await response.json();
        this.memory = { ...this.memory, ...serverMemory };
        await this.saveMemory();
    }

    async setMemory(key, value) {
        this.memory[key] = value;
        await this.saveMemory();
    }

    async getMemory(key) {
        return this.memory[key] || null;
    }

    async deleteMemory(key) {
        delete this.memory[key];
        await this.saveMemory();
    }

    async clearAllMemory() {
        this.memory = {};
        await this.saveMemory();
    }

    async getAllMemory() {
        return { ...this.memory };
    }
}

const workspaceMemory = new WorkspaceMemory();

export const setWorkspaceMemory = async (key, value) => {
    await workspaceMemory.setMemory(key, value);
};

export const getWorkspaceMemory = async (key) => {
    return await workspaceMemory.getMemory(key);
};

export const deleteWorkspaceMemory = async (key) => {
    await workspaceMemory.deleteMemory(key);
};

export const clearAllWorkspaceMemory = async () => {
    await workspaceMemory.clearAllMemory();
};

export const getAllWorkspaceMemory = async () => {
    return await workspaceMemory.getAllMemory();
};

export const syncWorkspaceMemory = async () => {
    await workspaceMemory.fetchMemoryFromServer();
};