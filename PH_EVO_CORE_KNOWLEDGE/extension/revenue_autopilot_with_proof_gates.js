/** Revenue Autopilot with Proof Gates - pb23 **/

import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3001';
const DATA_FILE = path.join(process.cwd(), 'subscriptions.json');

class RevenueAutopilot {
    constructor() {
        this.subscriptions = this.loadSubscriptions();
    }

    async fetchFromLocalBridge(endpoint) {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    loadSubscriptions() {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
        return {};
    }

    saveSubscriptions() {
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.subscriptions, null, 2), 'utf8');
    }

    async createSubscription(userId, planId) {
        const subscription = {
            userId,
            planId,
            active: true,
            createdAt: new Date().toISOString(),
        };
        this.subscriptions[userId] = subscription;
        this.saveSubscriptions();
        return subscription;
    }

    async cancelSubscription(userId) {
        if (this.subscriptions[userId]) {
            delete this.subscriptions[userId];
            this.saveSubscriptions();
            return { success: true, message: 'Subscription canceled' };
        }
        throw new Error('Subscription not found');
    }

    async getUserSubscription(userId) {
        if (this.subscriptions[userId]) {
            return this.subscriptions[userId];
        }
        throw new Error('Subscription not found');
    }

    async billUser(userId) {
        const subscription = await this.getUserSubscription(userId);
        const response = await this.fetchFromLocalBridge(`bill/${subscription.planId}`);
        return response;
    }

    async processBilling() {
        for (const userId in this.subscriptions) {
            const subscription = this.subscriptions[userId];
            if (subscription.active) {
                try {
                    await this.billUser(userId);
                } catch (error) {
                    console.error(`Failed to bill user ${userId}: ${error.message}`);
                }
            }
        }
    }

    async activateSubscription(userId) {
        if (this.subscriptions[userId]) {
            this.subscriptions[userId].active = true;
            this.saveSubscriptions();
            return { success: true, message: 'Subscription activated' };
        }
        throw new Error('Subscription not found');
    }

    async deactivateSubscription(userId) {
        if (this.subscriptions[userId]) {
            this.subscriptions[userId].active = false;
            this.saveSubscriptions();
            return { success: true, message: 'Subscription deactivated' };
        }
        throw new Error('Subscription not found');
    }
}

export const revenueAutopilot = new RevenueAutopilot();
export const { createSubscription, cancelSubscription, getUserSubscription, processBilling, activateSubscription, deactivateSubscription } = revenueAutopilot;