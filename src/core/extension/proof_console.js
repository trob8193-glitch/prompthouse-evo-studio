/** Proof Console - pb10 **/

import fs from 'fs';
import path from 'path';

const LOCAL_STORAGE_PATH = path.resolve('proof_console_data.json');
const LOCAL_BRIDGE_URL = 'http://localhost:3001';

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
            console.error('Error fetching proofs:', error);
        }
    }

    addProof(proof) {
        this.proofs.push(proof);
        this.saveProofs();
    }

    verifyProof(proofId) {
        const proof = this.proofs.find(p => p.id === proofId);
        if (!proof) {
            console.error('Proof not found');
            return false;
        }

        // Simulate verification logic
        const isVerified = proof.receipt.includes('valid');
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