/** Response capture - pb04 **/

import fs from 'fs';
import path from 'path';

const LOCAL_API_URL = 'http://127.0.0.1:3001';
const DATASET_FILE = path.join(__dirname, 'training_dataset.json');

class ResponseCapture {
    constructor() {
        this.dataset = this.loadDataset();
    }

    async captureResponse(modelOutput, metadata) {
        const entry = {
            output: modelOutput,
            metadata: metadata,
            timestamp: new Date().toISOString()
        };

        this.dataset.push(entry);
        await this.saveDataset();
        await this.sendToLocalBridge(entry);
    }

    loadDataset() {
        if (fs.existsSync(DATASET_FILE)) {
            const rawData = fs.readFileSync(DATASET_FILE);
            return JSON.parse(rawData);
        }
        return [];
    }

    saveDataset() {
        return new Promise((resolve, reject) => {
            fs.writeFile(DATASET_FILE, JSON.stringify(this.dataset, null, 2), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async sendToLocalBridge(entry) {
        try {
            const response = await fetch(`${LOCAL_API_URL}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entry)
            });
            if (!response.ok) {
                console.error('Failed to send to local bridge:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending to local bridge:', error);
        }
    }
}

const responseCapture = new ResponseCapture();

export const captureResponse = (modelOutput, metadata) => {
    return responseCapture.captureResponse(modelOutput, metadata);
};

export const getDataset = () => {
    return responseCapture.dataset;
};