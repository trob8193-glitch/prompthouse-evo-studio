/** Global pattern memory - mem04 **/

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3001';
const MEMORY_FILE = path.resolve('global_pattern_memory.json');

class GlobalPatternMemory {
    constructor() {
        this.initializeMemory();
    }

    async initializeMemory() {
        if (fs.existsSync(MEMORY_FILE)) {
            const data = await fs.promises.readFile(MEMORY_FILE, 'utf-8');
            this.memory = JSON.parse(data);
        } else {
            this.memory = { patterns: [] };
            await this.saveMemory();
        }
    }

    async saveMemory() {
        await fs.promises.writeFile(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
    }

    async fetchPatterns() {
        const response = await fetch(`${BASE_URL}/patterns`);
        if (!response.ok) {
            throw new Error('Failed to fetch patterns from server');
        }
        const patterns = await response.json();
        this.memory.patterns = [...new Set([...this.memory.patterns, ...patterns])];
        await this.saveMemory();
        return this.memory.patterns;
    }

    async addPattern(pattern) {
        if (this.memory.patterns.includes(pattern)) {
            throw new Error('Pattern already exists');
        }
        this.memory.patterns.push(pattern);
        await this.saveMemory();
    }

    async removePattern(pattern) {
        const index = this.memory.patterns.indexOf(pattern);
        if (index === -1) {
            throw new Error('Pattern not found');
        }
        this.memory.patterns.splice(index, 1);
        await this.saveMemory();
    }

    async clearMemory() {
        this.memory.patterns = [];
        await this.saveMemory();
    }

    get patterns() {
        return this.memory.patterns;
    }
}

const globalPatternMemory = new GlobalPatternMemory();

export const fetchPatterns = () => globalPatternMemory.fetchPatterns();
export const addPattern = (pattern) => globalPatternMemory.addPattern(pattern);
export const removePattern = (pattern) => globalPatternMemory.removePattern(pattern);
export const clearMemory = () => globalPatternMemory.clearMemory();
export const getPatterns = () => globalPatternMemory.patterns;