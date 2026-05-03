/** Reality Twin - pb09 **/

import fs from 'fs';
import path from 'path';

const LOCAL_BRIDGE_URL = 'http://localhost:3001';
const STATE_FILE = path.join(__dirname, 'realityTwinState.json');

class RealityTwin {
    constructor() {
        this.state = {
            studio: {},
            live: {}
        };
        this.loadState();
    }

    async fetchLiveData() {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/live-data`);
        if (!response.ok) {
            throw new Error('Failed to fetch live data');
        }
        return response.json();
    }

    async fetchStudioData() {
        const response = await fetch(`${LOCAL_BRIDGE_URL}/studio-data`);
        if (!response.ok) {
            throw new Error('Failed to fetch studio data');
        }
        return response.json();
    }

    compareStates(studioData, liveData) {
        const differences = {};
        for (const key in studioData) {
            if (studioData[key] !== liveData[key]) {
                differences[key] = { studio: studioData[key], live: liveData[key] };
            }
        }
        return differences;
    }

    async syncStates() {
        try {
            const [studioData, liveData] = await Promise.all([
                this.fetchStudioData(),
                this.fetchLiveData()
            ]);
            this.state.studio = studioData;
            this.state.live = liveData;
            const differences = this.compareStates(studioData, liveData);
            await this.saveState();
            return differences;
        } catch (error) {
            console.error('Error syncing states:', error);
            throw error;
        }
    }

    loadState() {
        if (fs.existsSync(STATE_FILE)) {
            const rawData = fs.readFileSync(STATE_FILE);
            this.state = JSON.parse(rawData);
        }
    }

    async saveState() {
        fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    }

    getState() {
        return this.state;
    }
}

const realityTwinInstance = new RealityTwin();

export const syncRealityTwin = async () => {
    return await realityTwinInstance.syncStates();
};

export const getRealityTwinState = () => {
    return realityTwinInstance.getState();
};

export const loadRealityTwinState = () => {
    realityTwinInstance.loadState();
};

export const saveRealityTwinState = async () => {
    await realityTwinInstance.saveState();
};