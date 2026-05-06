// RealityTwinSync.js
class RealityTwinSync {
    constructor() {
        this.storedState = {};
        this.localJsonStore = {}; // represents the JSON store, ideally this would be persistent
    }

    // Syncs the current DOM state into the local JSON store
    syncDOMState(domState) {
        this.storedState = domState;
        this.localJsonStore = JSON.parse(JSON.stringify(domState)); // Deep copy for persistence
    }

    // Diffs between the stored and live states
    diffStates(liveState) {
        return this.getDelta(this.localJsonStore, liveState);
    }

    // Returns the delta changes
    reconcile(liveState) {
        const delta = this.diffStates(liveState);
        if (Object.keys(delta).length > 0) {
            this.syncDOMState(liveState);
        }
        return delta;
    }

    // Helper method to compute the difference between two states
    getDelta(stored, live) {
        const delta = {};
        const allKeys = new Set([...Object.keys(stored), ...Object.keys(live)]);

        allKeys.forEach(key => {
            if (stored[key] !== live[key]) {
                if (typeof live[key] === 'object' && live[key] !== null) {
                    const objectDelta = this.getDelta(stored[key] || {}, live[key]);
                    if (Object.keys(objectDelta).length > 0) {
                        delta[key] = objectDelta;
                    }
                } else {
                    delta[key] = live[key];
                }
            }
        });

        return delta;
    }
}

// This module would be used as follows:
//
// const realityTwinSync = new RealityTwinSync();
// 
// function exampleUsage() {
//     const liveDomState = { example: 'Live DOM state data' };
//     const delta = realityTwinSync.reconcile(liveDomState);
//     console.log('Delta changes:', delta);
// }
//
// The browser extension would capture the live DOM state, 
// convert it into a suitable JSON format, 
// and pass it to the `reconcile` method for synchronization.