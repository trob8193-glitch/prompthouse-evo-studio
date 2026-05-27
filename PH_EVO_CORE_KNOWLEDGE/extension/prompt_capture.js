/** Prompt capture - pb03 **/

import fs from 'fs';
import fetch from 'node-fetch';
import { EventEmitter } from 'events';

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:3001';
const PROMPT_LOG_FILE = './prompt_log.json';

class PromptCapture extends EventEmitter {
    constructor() {
        super();
        this.prompts = [];
        this.loadPrompts();
    }

    async loadPrompts() {
        try {
            const data = await fs.promises.readFile(PROMPT_LOG_FILE, 'utf-8');
            this.prompts = JSON.parse(data);
        } catch (error) {
            console.error('Error loading prompts:', error);
            this.prompts = [];
        }
    }

    async savePrompts() {
        try {
            await fs.promises.writeFile(PROMPT_LOG_FILE, JSON.stringify(this.prompts, null, 2));
        } catch (error) {
            console.error('Error saving prompts:', error);
        }
    }

    async capturePrompt(prompt) {
        this.prompts.push({ prompt, timestamp: new Date().toISOString() });
        await this.savePrompts();
        this.emit('promptCaptured', prompt);
        await this.sendToLocalBridge(prompt);
    }

    async sendToLocalBridge(prompt) {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to send prompt to local bridge');
            }
        } catch (error) {
            console.error('Error sending prompt to local bridge:', error);
        }
    }

    getCapturedPrompts() {
        return this.prompts;
    }
}

const promptCapture = new PromptCapture();

export const capturePrompt = (prompt) => {
    promptCapture.capturePrompt(prompt);
};

export const getCapturedPrompts = () => {
    return promptCapture.getCapturedPrompts();
};

export const onPromptCaptured = (callback) => {
    promptCapture.on('promptCaptured', callback);
};