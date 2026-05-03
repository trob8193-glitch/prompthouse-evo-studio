/** Local vector search - mem07 **/

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const DB_FILE = path.resolve(__dirname, 'memory_vectors.json');

class LocalVectorSearch {
    constructor() {
        this.vectors = [];
        this.loadVectors();
    }

    async loadVectors() {
        if (fs.existsSync(DB_FILE)) {
            const data = await fs.promises.readFile(DB_FILE, 'utf-8');
            this.vectors = JSON.parse(data);
        }
    }

    async saveVectors() {
        await fs.promises.writeFile(DB_FILE, JSON.stringify(this.vectors), 'utf-8');
    }

    addVector(vector, metadata) {
        const id = this.generateId(metadata);
        const entry = { id, vector, metadata };
        this.vectors.push(entry);
        this.saveVectors();
        return id;
    }

    generateId(metadata) {
        const hash = createHash('sha256');
        hash.update(JSON.stringify(metadata));
        return hash.digest('hex');
    }

    async search(queryVector, k = 5) {
        const results = this.vectors.map(entry => ({
            id: entry.id,
            distance: this.calculateDistance(entry.vector, queryVector),
            metadata: entry.metadata
        }));

        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, k);
    }

    calculateDistance(vecA, vecB) {
        return Math.sqrt(vecA.reduce((sum, value, index) => sum + Math.pow(value - vecB[index], 2), 0));
    }

    async fetchFromRemote(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Failed to fetch data from remote');
        }
        return response.json();
    }

    async syncWithRemote() {
        const remoteData = await this.fetchFromRemote('http://localhost:3001/sync');
        remoteData.forEach(entry => this.addVector(entry.vector, entry.metadata));
    }
}

const localVectorSearch = new LocalVectorSearch();

export const addVector = (vector, metadata) => localVectorSearch.addVector(vector, metadata);
export const search = (queryVector, k) => localVectorSearch.search(queryVector, k);
export const syncWithRemote = () => localVectorSearch.syncWithRemote();