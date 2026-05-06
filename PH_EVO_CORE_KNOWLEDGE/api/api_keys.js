/** API keys - api02 **/

import fs from 'fs';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const API_KEYS_FILE = path.join(__dirname, 'api_keys.json');

class ApiKeyManager {
    constructor() {
        this.keys = this.loadKeys();
    }

    loadKeys() {
        if (fs.existsSync(API_KEYS_FILE)) {
            const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return {};
    }

    saveKeys() {
        fs.writeFileSync(API_KEYS_FILE, JSON.stringify(this.keys, null, 2));
    }

    generateApiKey() {
        const apiKey = uuidv4();
        this.keys[apiKey] = { createdAt: new Date().toISOString(), active: true };
        this.saveKeys();
        return apiKey;
    }

    revokeApiKey(apiKey) {
        if (this.keys[apiKey]) {
            this.keys[apiKey].active = false;
            this.saveKeys();
            return true;
        }
        throw new Error('API key not found');
    }

    validateApiKey(apiKey) {
        const keyInfo = this.keys[apiKey];
        if (keyInfo && keyInfo.active) {
            return true;
        }
        return false;
    }

    getApiKeys() {
        return Object.keys(this.keys).map(key => ({
            key,
            ...this.keys[key]
        }));
    }

    async fetchFromLocalBridge(endpoint, options = {}) {
        const response = await fetch(`http://localhost:3001/${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`Fetch error: ${response.statusText}`);
        }
        return response.json();
    }

    async syncKeysWithRemote() {
        const apiKeys = this.getApiKeys();
        const response = await this.fetchFromLocalBridge('sync-keys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiKeys)
        });
        return response;
    }
}

const apiKeyManager = new ApiKeyManager();

export const generateApiKey = () => apiKeyManager.generateApiKey();
export const revokeApiKey = (apiKey) => apiKeyManager.revokeApiKey(apiKey);
export const validateApiKey = (apiKey) => apiKeyManager.validateApiKey(apiKey);
export const getApiKeys = () => apiKeyManager.getApiKeys();
export const syncKeysWithRemote = () => apiKeyManager.syncKeysWithRemote();