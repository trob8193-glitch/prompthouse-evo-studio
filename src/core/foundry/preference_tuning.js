/** Preference tuning - mod02 **/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const BASE_URL = 'http://localhost:3001';
const DATA_FILE = path.join(__dirname, 'preferences.json');

class PreferenceTuning {
    constructor() {
        this.preferences = this.loadPreferences();
    }

    loadPreferences() {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    }

    savePreferences() {
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.preferences, null, 2));
    }

    async fetchModelOutput(input) {
        const response = await fetch(`${BASE_URL}/model/output`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch model output');
        }
        return response.json();
    }

    async tunePreference(input, feedback) {
        const modelOutput = await this.fetchModelOutput(input);
        const alignmentScore = this.calculateAlignmentScore(modelOutput.output, feedback);

        this.preferences[input] = {
            output: modelOutput.output,
            feedback,
            alignmentScore,
        };
        this.savePreferences();
    }

    calculateAlignmentScore(output, feedback) {
        // Simple scoring logic based on string similarity
        let score = 0;
        if (output.includes(feedback)) {
            score += 10;
        }
        score -= Math.abs(output.length - feedback.length);
        return Math.max(0, score);
    }

    getPreferences() {
        return this.preferences;
    }

    async submitFeedback(input, feedback) {
        await this.tunePreference(input, feedback);
    }
}

const preferenceTuning = new PreferenceTuning();

export const submitFeedback = (input, feedback) => preferenceTuning.submitFeedback(input, feedback);
export const getPreferences = () => preferenceTuning.getPreferences();
export const loadPreferences = () => preferenceTuning.loadPreferences();