/** Canon Vault - pb08 **/

import fs from 'fs';
import path from 'path';

const VAULT_FILE = path.join(__dirname, 'canon_vault.json');
const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';

class CanonVault {
    constructor() {
        this.verifiedKnowledge = [];
        this.loadVault();
    }

    async loadVault() {
        try {
            const data = await fs.promises.readFile(VAULT_FILE, 'utf-8');
            this.verifiedKnowledge = JSON.parse(data);
        } catch (error) {
            console.error('Failed to load vault:', error);
            this.verifiedKnowledge = [];
        }
    }

    async saveVault() {
        try {
            await fs.promises.writeFile(VAULT_FILE, JSON.stringify(this.verifiedKnowledge, null, 2));
        } catch (error) {
            console.error('Failed to save vault:', error);
        }
    }

    async addKnowledge(entry) {
        if (!this.isValidEntry(entry)) {
            throw new Error('Invalid entry');
        }
        this.verifiedKnowledge.push(entry);
        await this.saveVault();
        return entry;
    }

    async fetchKnowledge() {
        return this.verifiedKnowledge;
    }

    async deleteKnowledge(entryId) {
        const initialLength = this.verifiedKnowledge.length;
        this.verifiedKnowledge = this.verifiedKnowledge.filter(entry => entry.id !== entryId);
        if (this.verifiedKnowledge.length < initialLength) {
            await this.saveVault();
            return true;
        }
        return false;
    }

    isValidEntry(entry) {
        return entry && typeof entry.id === 'string' && typeof entry.content === 'string';
    }

    async fetchFromLocalBridge(endpoint) {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error('Failed to fetch from local bridge');
        }
        return await response.json();
    }

    async syncWithLocalBridge() {
        const remoteKnowledge = await this.fetchFromLocalBridge('knowledge');
        this.verifiedKnowledge = [...new Set([...this.verifiedKnowledge, ...remoteKnowledge])];
        await this.saveVault();
    }
}

const canonVault = new CanonVault();

export const addKnowledge = async (entry) => {
    return await canonVault.addKnowledge(entry);
};

export const fetchKnowledge = async () => {
    return await canonVault.fetchKnowledge();
};

export const deleteKnowledge = async (entryId) => {
    return await canonVault.deleteKnowledge(entryId);
};

export const syncKnowledge = async () => {
    return await canonVault.syncWithLocalBridge();
};