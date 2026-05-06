/** Image Canon board - pb12 **/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const BASE_URL = 'http://localhost:3001';
const ASSET_DIR = path.resolve('assets');
const PROMPTS_FILE = path.join(ASSET_DIR, 'prompts.json');

// Ensure the assets directory exists
if (!fs.existsSync(ASSET_DIR)) {
    fs.mkdirSync(ASSET_DIR);
}

// Load prompts from the local file system
async function loadPrompts() {
    if (fs.existsSync(PROMPTS_FILE)) {
        const data = fs.readFileSync(PROMPTS_FILE);
        return JSON.parse(data);
    }
    return [];
}

// Save prompts to the local file system
async function savePrompts(prompts) {
    fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2));
}

// Fetch visual assets from the local bridge
async function fetchAssets() {
    const response = await fetch(`${BASE_URL}/assets`);
    if (!response.ok) {
        throw new Error('Failed to fetch assets');
    }
    return await response.json();
}

// Upload a new visual asset
async function uploadAsset(filePath) {
    const file = fs.readFileSync(filePath);
    const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: file,
        headers: {
            'Content-Type': 'application/octet-stream',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to upload asset');
    }
    return await response.json();
}

// Track prompt-to-image mapping
async function trackPrompt(prompt, assetId) {
    const prompts = await loadPrompts();
    prompts.push({ prompt, assetId });
    await savePrompts(prompts);
}

// Get all tracked prompts
async function getTrackedPrompts() {
    return await loadPrompts();
}

// Delete a tracked prompt
async function deleteTrackedPrompt(prompt) {
    const prompts = await loadPrompts();
    const updatedPrompts = prompts.filter(p => p.prompt !== prompt);
    await savePrompts(updatedPrompts);
}

// Public API
export const ImageCanonBoard = {
    fetchAssets,
    uploadAsset,
    trackPrompt,
    getTrackedPrompts,
    deleteTrackedPrompt,
};