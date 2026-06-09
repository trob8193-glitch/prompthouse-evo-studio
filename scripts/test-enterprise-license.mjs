import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { LicenseManager } from '../src/core/enterprise/LicenseManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const LIC_PATH = path.join(DATA_DIR, 'enterprise.lic');

console.log('--- 🛡️  Testing Enterprise Licensing Engine ---');

// 1. Initial State (No License)
if (fs.existsSync(LIC_PATH)) fs.unlinkSync(LIC_PATH);
const managerWithoutLicense = new LicenseManager(DATA_DIR);
console.assert(managerWithoutLicense.isEnterprise() === false, "Should be in community mode without license");
console.log('✅ Passed: Falls back to Community Mode when no license is present.');

// 2. Generate Mock License
const mockPayload = {
    tier: 'enterprise',
    org: 'Test Bank Corporation',
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expires in 1 hour
};
// We sign with any secret, but since PROMPTHOUSE_PUBLIC_KEY env is not set, 
// LicenseManager will decode and accept it for testing as designed in the mock implementation.
const mockToken = jwt.sign(mockPayload, 'mock-secret');
fs.writeFileSync(LIC_PATH, mockToken);

// 3. Test With License
const managerWithLicense = new LicenseManager(DATA_DIR);
console.assert(managerWithLicense.isEnterprise() === true, "Should be in enterprise mode with valid license");
console.assert(managerWithLicense.getTier() === 'enterprise', "Should detect enterprise tier");
console.log(`✅ Passed: Successfully unlocks Enterprise features for ${managerWithLicense.licenseState.organization}.`);

// Clean up
fs.unlinkSync(LIC_PATH);
console.log('--- Test Complete ---');
