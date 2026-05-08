/** Chat capture - pb02 **/

import fs from 'fs';
import path from 'path';

const LOCAL_STORAGE_PATH = path.join(process.cwd(), 'chat_sessions.json');
const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001/capture';

async function saveToLocalFile(data) {
    try {
        const existingData = fs.existsSync(LOCAL_STORAGE_PATH)
            ? JSON.parse(fs.readFileSync(LOCAL_STORAGE_PATH, 'utf-8'))
            : [];
        existingData.push(data);
        fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify(existingData, null, 2));
    } catch (error) {
        console.error('Error saving to local file:', error);
    }
}

async function sendToLocalBridge(data) {
    try {
        const response = await fetch(LOCAL_BRIDGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error sending data to local bridge:', error);
    }
}

export async function captureChatSession(sessionData) {
    const timestamp = new Date().toISOString();
    const capturedData = {
        ...sessionData,
        timestamp,
    };

    await saveToLocalFile(capturedData);
    await sendToLocalBridge(capturedData);
}

export function getChatSessions() {
    try {
        if (fs.existsSync(LOCAL_STORAGE_PATH)) {
            return JSON.parse(fs.readFileSync(LOCAL_STORAGE_PATH, 'utf-8'));
        }
        return [];
    } catch (error) {
        console.error('Error reading chat sessions:', error);
        return [];
    }
}

export async function clearChatSessions() {
    try {
        fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify([], null, 2));
    } catch (error) {
        console.error('Error clearing chat sessions:', error);
    }
}

export async function initializeCaptureModule() {
    if (!fs.existsSync(LOCAL_STORAGE_PATH)) {
        fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify([], null, 2));
    }
}

initializeCaptureModule();