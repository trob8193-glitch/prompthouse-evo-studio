/** Free Foundry Mode - mod06 **/

import fs from 'fs';
import path from 'path';

const LOCAL_BRIDGE_URL = 'http://localhost:3001';
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'foundry_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)){
    fs.mkdirSync(DATA_DIR);
}

/**
 * Fetches data from the local bridge.
 * @returns {Promise<Object>} The response data.
 */
async function fetchFromLocalBridge(endpoint) {
    const response = await fetch(`${LOCAL_BRIDGE_URL}/${endpoint}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch from local bridge: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Saves training data to the local file system.
 * @param {Object} data - The data to save.
 */
function saveDataToLocal(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * Loads training data from the local file system.
 * @returns {Object} The loaded data.
 */
function loadDataFromLocal() {
    if (fs.existsSync(DATA_FILE)) {
        const rawData = fs.readFileSync(DATA_FILE);
        return JSON.parse(rawData);
    }
    return {};
}

/**
 * Trains the model with the provided data.
 * @param {Object} trainingData - The data used for training.
 * @returns {Promise<void>}
 */
async function trainModel(trainingData) {
    const response = await fetch(`${LOCAL_BRIDGE_URL}/train`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
    });

    if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
    }
}

/**
 * Inference function to process input data.
 * @param {Object} inputData - The data to infer.
 * @returns {Promise<Object>} The inference result.
 */
async function inferModel(inputData) {
    const response = await fetch(`${LOCAL_BRIDGE_URL}/infer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
    });

    if (!response.ok) {
        throw new Error(`Inference failed: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Free Foundry Mode API.
 */
const FreeFoundryMode = {
    train: async (data) => {
        saveDataToLocal(data);
        await trainModel(data);
    },
    infer: async (input) => {
        return await inferModel(input);
    },
    loadData: () => {
        return loadDataFromLocal();
    },
    saveData: (data) => {
        saveDataToLocal(data);
    }
};

// Exporting the Free Foundry Mode API
export default FreeFoundryMode;