/** Proof Console - pb10 **/

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { Log } from '../autonomy/SovereignLogger.js';

const LOCAL_STORAGE_PATH = path.resolve('proof_console_data.json');
const LOCAL_BRIDGE_URL = ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || ((globalThis.process?.env?.BRIDGE_URL) || (globalThis.process?.env?.VITE_BRIDGE_URL) || (globalThis.process?.env?.BRIDGE_URL || globalThis.process?.env?.VITE_BRIDGE_URL || 'http://127.0.0.1:3001')))) + '';

class ProofConsole {
    constructor() {
        this.proofs = [];
        this.loadProofs();
    }

    loadProofs() {
        if (fs.existsSync(LOCAL_STORAGE_PATH)) {
            const data = fs.readFileSync(LOCAL_STORAGE_PATH, 'utf-8');
            this.proofs = JSON.parse(data);
        }
    }

    saveProofs() {
        fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify(this.proofs, null, 2));
    }

    async fetchProofs() {
        try {
            const response = await fetch(`${LOCAL_BRIDGE_URL}/proofs`);
            if (!response.ok) throw new Error('Failed to fetch proofs');
            const data = await response.json();
            this.proofs = data;
            this.saveProofs();
        } catch (error) {
            Log.error('Error fetching proofs:', error);
        }
    }

    addProof(proof) {
        this.proofs.push(proof);
        this.saveProofs();
    }

    verifyProof(proofId) {
        const proof = this.proofs.find(p => p.id === proofId);
        if (!proof) {
            Log.error('Proof not found');
            return false;
        }

        // Real cryptographic verification logic
        let isVerified = false;
        try {
            if (proof.data && proof.hash) {
                const computedHash = crypto.createHash('sha256').update(typeof proof.data === 'string' ? proof.data : JSON.stringify(proof.data)).digest('hex');
                isVerified = (computedHash === proof.hash);
            }
        } catch (err) {
            Log.error('Cryptographic verification failed:', err.message);
        }

        proof.verified = isVerified;
        this.saveProofs();
        return isVerified;
    }

    streamProofs(callback) {
        const interval = setInterval(async () => {
            await this.fetchProofs();
            callback(this.proofs);
        }, 5000); // Fetch new proofs every 5 seconds

        return () => clearInterval(interval); // Stop streaming
    }

    getProofs() {
        return this.proofs;
    }
}

const proofConsole = new ProofConsole();

export const startProofStreaming = (callback) => {
    return proofConsole.streamProofs(callback);
};

export const addNewProof = (proof) => {
    proofConsole.addProof(proof);
};

export const verifyExistingProof = (proofId) => {
    return proofConsole.verifyProof(proofId);
};

export const getAllProofs = () => {
    return proofConsole.getProofs();
};