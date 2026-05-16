/** Bot Cast panel - pb06 **/

import fs from 'fs';
import path from 'path';

const LOCAL_STORAGE_PATH = path.join(__dirname, 'botRoster.json');
const API_URL = 'http://127.0.0.1:3001/bots';

class BotCastPanel {
    constructor() {
        this.bots = [];
        this.loadBots();
    }

    async loadBots() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch bots from API');
            this.bots = await response.json();
            this.saveBotsToFile();
        } catch (error) {
            console.error('Error loading bots:', error);
            this.loadBotsFromFile();
        }
    }

    loadBotsFromFile() {
        try {
            const data = fs.readFileSync(LOCAL_STORAGE_PATH, 'utf-8');
            this.bots = JSON.parse(data);
        } catch (error) {
            console.error('Error loading bots from file:', error);
            this.bots = [];
        }
    }

    saveBotsToFile() {
        fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify(this.bots, null, 2));
    }

    async addBot(bot) {
        this.bots.push(bot);
        await this.syncWithAPI(bot);
        this.saveBotsToFile();
    }

    async updateBot(updatedBot) {
        const index = this.bots.findIndex(bot => bot.id === updatedBot.id);
        if (index !== -1) {
            this.bots[index] = updatedBot;
            await this.syncWithAPI(updatedBot);
            this.saveBotsToFile();
        }
    }

    async deleteBot(botId) {
        this.bots = this.bots.filter(bot => bot.id !== botId);
        await this.syncWithAPI({ id: botId, action: 'delete' });
        this.saveBotsToFile();
    }

    async syncWithAPI(bot) {
        const method = bot.action === 'delete' ? 'DELETE' : 'POST';
        const response = await fetch(API_URL, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bot),
        });
        if (!response.ok) throw new Error('Failed to sync with API');
    }

    getBots() {
        return this.bots;
    }
}

export const botCastPanel = new BotCastPanel();