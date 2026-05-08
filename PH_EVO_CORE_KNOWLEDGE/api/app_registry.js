/** App registry - api04 **/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';
const DATA_FILE_PATH = path.join(process.cwd(), 'app_registry.json');

const loadRegistry = () => {
    if (fs.existsSync(DATA_FILE_PATH)) {
        const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
        return JSON.parse(data);
    }
    return {};
};

const saveRegistry = (registry) => {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(registry, null, 2));
};

const registry = loadRegistry();

export const registerApp = async (appId, appDetails) => {
    if (registry[appId]) {
        throw new Error(`App with ID ${appId} is already registered.`);
    }
    
    registry[appId] = appDetails;
    saveRegistry(registry);
    
    const response = await fetch(`${LOCAL_BRIDGE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, appDetails }),
    });
    
    return response.json();
};

export const unregisterApp = async (appId) => {
    if (!registry[appId]) {
        throw new Error(`No app found with ID ${appId}.`);
    }

    delete registry[appId];
    saveRegistry(registry);
    
    const response = await fetch(`${LOCAL_BRIDGE_URL}/unregister`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId }),
    });

    return response.json();
};

export const getAppDetails = (appId) => {
    if (!registry[appId]) {
        throw new Error(`No app found with ID ${appId}.`);
    }
    return registry[appId];
};

export const listRegisteredApps = () => {
    return Object.entries(registry).map(([appId, appDetails]) => ({ appId, ...appDetails }));
};

export const updateAppDetails = async (appId, updatedDetails) => {
    if (!registry[appId]) {
        throw new Error(`No app found with ID ${appId}.`);
    }

    registry[appId] = { ...registry[appId], ...updatedDetails };
    saveRegistry(registry);

    const response = await fetch(`${LOCAL_BRIDGE_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, updatedDetails }),
    });

    return response.json();
};

export const clearRegistry = () => {
    for (const appId in registry) {
        delete registry[appId];
    }
    saveRegistry(registry);
};