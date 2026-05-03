/** Global Pattern Library - pb21 **/

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3001';
const DATA_FILE = path.resolve('patterns.json');

class GlobalPatternLibrary {
    constructor() {
        this.patterns = [];
        this.loadPatterns();
    }

    async fetchPatterns() {
        const response = await fetch(`${BASE_URL}/patterns`);
        if (!response.ok) {
            throw new Error(`Error fetching patterns: ${response.statusText}`);
        }
        const data = await response.json();
        this.patterns = data;
    }

    loadPatterns() {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE);
            this.patterns = JSON.parse(rawData);
        } else {
            this.fetchPatterns().catch(err => console.error(err));
        }
    }

    savePatterns() {
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.patterns, null, 2));
    }

    getPatterns() {
        return this.patterns;
    }

    addPattern(pattern) {
        if (!this.validatePattern(pattern)) {
            throw new Error('Invalid pattern structure');
        }
        this.patterns.push(pattern);
        this.savePatterns();
    }

    updatePattern(id, updatedPattern) {
        const index = this.patterns.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Pattern not found');
        }
        if (!this.validatePattern(updatedPattern)) {
            throw new Error('Invalid pattern structure');
        }
        this.patterns[index] = { ...this.patterns[index], ...updatedPattern };
        this.savePatterns();
    }

    deletePattern(id) {
        const index = this.patterns.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Pattern not found');
        }
        this.patterns.splice(index, 1);
        this.savePatterns();
    }

    validatePattern(pattern) {
        return pattern && typeof pattern.id === 'string' && typeof pattern.description === 'string';
    }
}

const globalPatternLibrary = new GlobalPatternLibrary();

export const getPatterns = () => globalPatternLibrary.getPatterns();
export const addPattern = (pattern) => globalPatternLibrary.addPattern(pattern);
export const updatePattern = (id, updatedPattern) => globalPatternLibrary.updatePattern(id, updatedPattern);
export const deletePattern = (id) => globalPatternLibrary.deletePattern(id);