/** Training Gold Miner - pb18 **/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const LOCAL_BRIDGE_URL = 'http://localhost:3001';
const DATA_DIR = path.resolve('data');
const TRAINING_DATA_FILE = path.join(DATA_DIR, 'training_data.json');

async function fetchTrainingExamples() {
    const response = await fetch(`${LOCAL_BRIDGE_URL}/training/examples`);
    if (!response.ok) {
        throw new Error('Failed to fetch training examples');
    }
    return response.json();
}

function heuristicQualityCheck(example) {
    // Simple heuristic: high-quality if length > 10 and has key phrases
    const keyPhrases = ['important', 'critical', 'high quality'];
    const containsKeyPhrase = keyPhrases.some(phrase => example.text.includes(phrase));
    return example.text.length > 10 && containsKeyPhrase;
}

async function saveHighQualityExamples(examples) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }
    
    const existingData = fs.existsSync(TRAINING_DATA_FILE) 
        ? JSON.parse(fs.readFileSync(TRAINING_DATA_FILE)) 
        : [];

    const newHighQualityExamples = examples.filter(heuristicQualityCheck);
    const updatedData = [...existingData, ...newHighQualityExamples];
    
    fs.writeFileSync(TRAINING_DATA_FILE, JSON.stringify(updatedData, null, 2));
}

export async function trainGoldMiner() {
    try {
        const examples = await fetchTrainingExamples();
        await saveHighQualityExamples(examples);
        console.log('High quality training examples discovered and saved.');
    } catch (error) {
        console.error('Error in Training Gold Miner:', error.message);
    }
}

export async function getSavedTrainingData() {
    if (fs.existsSync(TRAINING_DATA_FILE)) {
        return JSON.parse(fs.readFileSync(TRAINING_DATA_FILE));
    }
    return [];
}

// Export public API
export default {
    trainGoldMiner,
    getSavedTrainingData,
};