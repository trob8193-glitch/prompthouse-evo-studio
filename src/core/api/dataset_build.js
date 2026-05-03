/** Dataset build - api11 **/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const LOCAL_BRIDGE_URL = 'http://localhost:3001';
const DATASET_PATH = path.join(__dirname, 'datasets');
const DATASET_FILE = path.join(DATASET_PATH, 'training_dataset.json');

// Ensure the datasets directory exists
if (!fs.existsSync(DATASET_PATH)) {
    fs.mkdirSync(DATASET_PATH);
}

// Fetch captured events from the local bridge
async function fetchCapturedEvents() {
    const response = await fetch(`${LOCAL_BRIDGE_URL}/captured-events`);
    if (!response.ok) {
        throw new Error('Failed to fetch captured events');
    }
    return response.json();
}

// Transform captured events into training format
function transformEventsToTrainingFormat(events) {
    return events.map(event => ({
        id: event.id,
        input: event.inputData,
        output: event.outputData,
        timestamp: event.timestamp,
    }));
}

// Save the training dataset to local file
function saveDatasetToFile(dataset) {
    fs.writeFileSync(DATASET_FILE, JSON.stringify(dataset, null, 2), 'utf-8');
}

// Main function to build the dataset
export async function buildDataset() {
    try {
        const capturedEvents = await fetchCapturedEvents();
        const trainingDataset = transformEventsToTrainingFormat(capturedEvents);
        saveDatasetToFile(trainingDataset);
        console.log('Dataset built successfully:', DATASET_FILE);
    } catch (error) {
        console.error('Error building dataset:', error);
    }
}

// Expose the public API
export default {
    buildDataset,
};