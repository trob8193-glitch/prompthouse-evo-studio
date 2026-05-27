/** Export Center - pb13 **/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:3001';

class ExportCenter {
    constructor() {
        this.exportPath = path.join(process.cwd(), 'exports');
        this.ensureExportPath();
    }

    ensureExportPath() {
        if (!fs.existsSync(this.exportPath)) {
            fs.mkdirSync(this.exportPath, { recursive: true });
        }
    }

    async fetchPublicAPI(endpoint) {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        return response.json();
    }

    async exportMissions() {
        const missions = await this.fetchPublicAPI('missions');
        const filePath = path.join(this.exportPath, 'missions.json');
        fs.writeFileSync(filePath, JSON.stringify(missions, null, 2));
        return filePath;
    }

    async exportModels() {
        const models = await this.fetchPublicAPI('models');
        const filePath = path.join(this.exportPath, 'models.json');
        fs.writeFileSync(filePath, JSON.stringify(models, null, 2));
        return filePath;
    }

    async exportDatasets() {
        const datasets = await this.fetchPublicAPI('datasets');
        const filePath = path.join(this.exportPath, 'datasets.json');
        fs.writeFileSync(filePath, JSON.stringify(datasets, null, 2));
        return filePath;
    }

    async packageExport() {
        const missionFile = await this.exportMissions();
        const modelFile = await this.exportModels();
        const datasetFile = await this.exportDatasets();

        const zipFilePath = path.join(this.exportPath, 'export.zip');
        const zip = require('zip-a-folder');

        await zip.zip(this.exportPath, zipFilePath);
        return zipFilePath;
    }

    async exportAll() {
        try {
            const zipFilePath = await this.packageExport();
            console.log(`Export successful: ${zipFilePath}`);
            return zipFilePath;
        } catch (error) {
            console.error(`Export failed: ${error.message}`);
            throw error;
        }
    }
}

export default ExportCenter;