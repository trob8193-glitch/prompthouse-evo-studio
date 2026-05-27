/** Reality Twin routes - api15 **/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';
const DATA_FILE = path.resolve('stateSimulation.json');

class RealityTwin {
    constructor() {
        this.state = {};
        this.loadState();
    }

    async syncStateWithBridge() {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state),
            });

            if (!response.ok) {
                throw new Error('Failed to sync state with local bridge');
            }

            const data = await response.json();
            this.state = { ...this.state, ...data };
            this.saveState();
        } catch (error) {
            console.error('Error syncing state:', error);
        }
    }

    loadState() {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE);
            this.state = JSON.parse(rawData);
        } else {
            this.state = {};
        }
    }

    saveState() {
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2));
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveState();
    }

    async fetchCurrentState() {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/current-state`);
            if (!response.ok) {
                throw new Error('Failed to fetch current state from local bridge');
            }

            const data = await response.json();
            this.setState(data);
        } catch (error) {
            console.error('Error fetching current state:', error);
        }
    }
}

const realityTwin = new RealityTwin();

export const syncState = () => realityTwin.syncStateWithBridge();
export const getState = () => realityTwin.getState();
export const setState = (newState) => realityTwin.setState(newState);
export const fetchCurrentState = () => realityTwin.fetchCurrentState();