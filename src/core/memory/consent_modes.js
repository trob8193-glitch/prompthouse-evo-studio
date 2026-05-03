/** Consent modes - mem05 **/

import fs from 'fs';
import path from 'path';

const CONSENT_FILE = path.resolve('./consent.json');
const LOCAL_BRIDGE_URL = 'http://localhost:3001';

export class ConsentManager {
    constructor() {
        this.consentData = this.loadConsentData();
    }

    loadConsentData() {
        if (fs.existsSync(CONSENT_FILE)) {
            const rawData = fs.readFileSync(CONSENT_FILE);
            return JSON.parse(rawData);
        }
        return {
            consentGiven: false,
            consentDetails: {},
        };
    }

    saveConsentData() {
        fs.writeFileSync(CONSENT_FILE, JSON.stringify(this.consentData, null, 2));
    }

    async fetchConsentFromServer() {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/consent`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            this.consentData = data;
            this.saveConsentData();
        } catch (error) {
            console.error('Failed to fetch consent from server:', error);
        }
    }

    giveConsent(details) {
        this.consentData.consentGiven = true;
        this.consentData.consentDetails = details;
        this.saveConsentData();
    }

    revokeConsent() {
        this.consentData.consentGiven = false;
        this.consentData.consentDetails = {};
        this.saveConsentData();
    }

    isConsentGiven() {
        return this.consentData.consentGiven;
    }

    getConsentDetails() {
        return this.consentData.consentDetails;
    }

    async updateConsentOnServer() {
        if (!this.isConsentGiven()) return;
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/update-consent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.consentData),
            });
            if (!response.ok) {
                throw new Error('Failed to update consent on server');
            }
        } catch (error) {
            console.error('Error updating consent on server:', error);
        }
    }
}

// Export a singleton instance of ConsentManager
const consentManager = new ConsentManager();
export default consentManager;