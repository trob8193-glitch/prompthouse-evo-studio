/** Scope manager - mem06 **/

import { promises as fs } from 'fs';
import fetch from 'node-fetch';

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';
const SCOPE_FILE = './scope_permissions.json';

class ScopeManager {
    constructor() {
        this.scopes = new Map();
        this.loadScopes();
    }

    async loadScopes() {
        try {
            const data = await fs.readFile(SCOPE_FILE, 'utf8');
            const scopes = JSON.parse(data);
            this.scopes = new Map(Object.entries(scopes));
        } catch (error) {
            console.error('Could not load scopes:', error);
            this.scopes = new Map();
        }
    }

    async saveScopes() {
        try {
            const data = JSON.stringify(Object.fromEntries(this.scopes));
            await fs.writeFile(SCOPE_FILE, data, 'utf8');
        } catch (error) {
            console.error('Could not save scopes:', error);
        }
    }

    async fetchScopeFromServer(userId) {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/api/scopes/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const scopeData = await response.json();
            this.scopes.set(userId, scopeData);
            await this.saveScopes();
        } catch (error) {
            console.error('Failed to fetch scope from server:', error);
        }
    }

    grantPermission(userId, permission) {
        if (!this.scopes.has(userId)) {
            this.scopes.set(userId, []);
        }

        const permissions = this.scopes.get(userId);
        if (!permissions.includes(permission)) {
            permissions.push(permission);
            this.saveScopes();
        }
    }

    revokePermission(userId, permission) {
        if (this.scopes.has(userId)) {
            const permissions = this.scopes.get(userId);
            this.scopes.set(userId, permissions.filter(p => p !== permission));
            this.saveScopes();
        }
    }

    checkPermission(userId, permission) {
        return this.scopes.has(userId) && this.scopes.get(userId).includes(permission);
    }

    async getUserPermissions(userId) {
        await this.fetchScopeFromServer(userId);
        return this.scopes.get(userId) || [];
    }
}

const scopeManager = new ScopeManager();

export const grantPermission = (userId, permission) => scopeManager.grantPermission(userId, permission);
export const revokePermission = (userId, permission) => scopeManager.revokePermission(userId, permission);
export const checkPermission = (userId, permission) => scopeManager.checkPermission(userId, permission);
export const getUserPermissions = async (userId) => await scopeManager.getUserPermissions(userId);