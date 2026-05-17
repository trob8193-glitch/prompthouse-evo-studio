<<<<<<< HEAD
=======
/** RAG routes - api08 **/

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const MEMORY_FILE = path.resolve(process.cwd(), 'memory.json');
const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';

class MemoryModule {
    constructor() {
        this.memory = this.loadMemory();
    }

    loadMemory() {
        if (fs.existsSync(MEMORY_FILE)) {
            const data = fs.readFileSync(MEMORY_FILE);
            return JSON.parse(data);
        }
        return {};
    }

    saveMemory() {
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
    }

    async fetchContextualData(query) {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/context?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`Error fetching contextual data: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async injectContextualData(query) {
        const contextualData = await this.fetchContextualData(query);
        if (contextualData && contextualData.data) {
            this.memory[query] = contextualData.data;
            this.saveMemory();
        }
    }

    getMemory(query) {
        return this.memory[query] || null;
    }

    async handleRAGRequest(query) {
        const existingData = this.getMemory(query);
        if (existingData) {
            return existingData;
        } else {
            await this.injectContextualData(query);
            return this.getMemory(query);
        }
    }
}

const memoryModule = new MemoryModule();

export const RAGRoutes = {
    getContextualResponse: async (req, res) => {
        const { query } = req.query;
        if (!query) {
            return res.status(400).send({ error: 'Query parameter is required' });
        }

        try {
            const response = await memoryModule.handleRAGRequest(query);
            return res.status(200).send({ data: response });
        } catch (error) {
            return res.status(500).send({ error: error.message });
        }
    }
};
>>>>>>> main
