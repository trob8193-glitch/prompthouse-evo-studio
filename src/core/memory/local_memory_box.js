/** Local Memory Box - mem01 **/

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fetch from 'node-fetch';

const DATABASE_FILE = './memory.db';
const LOCAL_BRIDGE_URL = 'http://localhost:3001';

class LocalMemoryBox {
    constructor() {
        this.db = null;
    }

    async initialize() {
        this.db = await open({
            filename: DATABASE_FILE,
            driver: sqlite3.Database
        });
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                value TEXT
            )
        `);
    }

    async setItem(key, value) {
        await this.db.run('INSERT OR REPLACE INTO memory (key, value) VALUES (?, ?)', [key, value]);
        await this.syncWithLocalBridge(key, value);
    }

    async getItem(key) {
        const row = await this.db.get('SELECT value FROM memory WHERE key = ?', [key]);
        return row ? row.value : null;
    }

    async removeItem(key) {
        await this.db.run('DELETE FROM memory WHERE key = ?', [key]);
        await this.syncWithLocalBridge(key, null);
    }

    async clear() {
        await this.db.exec('DELETE FROM memory');
        await this.syncWithLocalBridge(null, null);
    }

    async syncWithLocalBridge(key, value) {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value })
            });
            if (!response.ok) {
                throw new Error(`Failed to sync with local bridge: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error syncing with local bridge:', error);
        }
    }

    async getAllItems() {
        const rows = await this.db.all('SELECT key, value FROM memory');
        return rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
    }
}

const memoryBox = new LocalMemoryBox();

export const initializeMemoryBox = async () => {
    await memoryBox.initialize();
};

export const setItem = async (key, value) => {
    await memoryBox.setItem(key, value);
};

export const getItem = async (key) => {
    return await memoryBox.getItem(key);
};

export const removeItem = async (key) => {
    await memoryBox.removeItem(key);
};

export const clearMemory = async () => {
    await memoryBox.clear();
};

export const getAllItems = async () => {
    return await memoryBox.getAllItems();
};