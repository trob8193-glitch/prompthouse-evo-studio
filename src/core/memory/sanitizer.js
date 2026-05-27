/** Sanitizer - mem08 **/

import fs from 'fs';
import fetch from 'node-fetch';

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';
const SANITIZATION_PATTERN = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /\+?[1-9]\d{1,14}/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    secret: /(?<=\bsecret:\s*)[^\s]+/g
};

export class Sanitizer {
    constructor() {
        this.memoryData = [];
    }

    async fetchMemoryData() {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/memory`);
        if (!response.ok) {
            throw new Error('Failed to fetch memory data');
        }
        this.memoryData = await response.json();
    }

    sanitizeData(data) {
        let sanitizedData = data;

        for (const [key, pattern] of Object.entries(SANITIZATION_PATTERN)) {
            sanitizedData = sanitizedData.replace(pattern, '[REDACTED]');
        }

        return sanitizedData;
    }

    async sanitizeAndPersist() {
        await this.fetchMemoryData();
        const sanitizedMemory = this.memoryData.map(entry => {
            return {
                ...entry,
                content: this.sanitizeData(entry.content)
            };
        });

        await this.persistSanitizedMemory(sanitizedMemory);
    }

    async persistSanitizedMemory(data) {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/memory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to persist sanitized memory data');
        }
    }

    async saveToFile(filePath) {
        const sanitizedData = this.memoryData.map(entry => ({
            ...entry,
            content: this.sanitizeData(entry.content)
        }));

        fs.writeFileSync(filePath, JSON.stringify(sanitizedData, null, 2), 'utf-8');
    }

    async loadFromFile(filePath) {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        this.memoryData = JSON.parse(fileData);
    }
}

export const sanitizer = new Sanitizer();