/** Scopes - api03 **/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const SCOPES_FILE = path.resolve('scopes.json');
const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';

class ScopeManager {
    constructor() {
        this.scopes = this.loadScopes();
    }

    loadScopes() {
        if (fs.existsSync(SCOPES_FILE)) {
            const data = fs.readFileSync(SCOPES_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    }

    saveScopes() {
        fs.writeFileSync(SCOPES_FILE, JSON.stringify(this.scopes, null, 2));
    }

    addScope(scopeName, permissions) {
        if (this.scopes[scopeName]) {
            throw new Error(`Scope ${scopeName} already exists.`);
        }
        this.scopes[scopeName] = permissions;
        this.saveScopes();
    }

    removeScope(scopeName) {
        if (!this.scopes[scopeName]) {
            throw new Error(`Scope ${scopeName} does not exist.`);
        }
        delete this.scopes[scopeName];
        this.saveScopes();
    }

    getScope(scopeName) {
        if (!this.scopes[scopeName]) {
            throw new Error(`Scope ${scopeName} does not exist.`);
        }
        return this.scopes[scopeName];
    }

    listScopes() {
        return Object.keys(this.scopes);
    }

    async checkAccess(userScopes, requiredScope) {
        const hasAccess = userScopes.some(scope => scope === requiredScope);
        if (!hasAccess) {
            throw new Error(`Access denied for scope: ${requiredScope}`);
        }
        return true;
    }

    async fetchRemoteScopes() {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/api/scopes`);
        if (!response.ok) {
            throw new Error('Failed to fetch scopes from local bridge');
        }
        const remoteScopes = await response.json();
        return remoteScopes;
    }
}

const scopeManager = new ScopeManager();

export const addScope = (scopeName, permissions) => {
    return scopeManager.addScope(scopeName, permissions);
};

export const removeScope = (scopeName) => {
    return scopeManager.removeScope(scopeName);
};

export const getScope = (scopeName) => {
    return scopeManager.getScope(scopeName);
};

export const listScopes = () => {
    return scopeManager.listScopes();
};

export const checkAccess = async (userScopes, requiredScope) => {
    return scopeManager.checkAccess(userScopes, requiredScope);
};

export const fetchRemoteScopes = async () => {
    return scopeManager.fetchRemoteScopes();
};