import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { LicenseManager } from '../src/core/enterprise/LicenseManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '.prompthouse-data');
const LIC_PATH = path.join(DATA_DIR, 'enterprise.lic');
const previousPublicKey = process.env.PROMPTHOUSE_PUBLIC_KEY;

console.log('--- Testing Enterprise Licensing Engine ---');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (fs.existsSync(LIC_PATH)) fs.unlinkSync(LIC_PATH);

delete process.env.PROMPTHOUSE_PUBLIC_KEY;
const managerWithoutLicense = new LicenseManager(DATA_DIR);
console.assert(managerWithoutLicense.hasPremiumAccess() === false, 'Should be in community mode without license');
console.log('Passed: falls back to Community Mode when no license is present.');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });

const payload = {
  tier: 'enterprise',
  org: 'Test Bank Corporation',
  exp: Math.floor(Date.now() / 1000) + 60 * 60
};
const token = jwt.sign(payload, privatePem, { algorithm: 'RS256' });
fs.writeFileSync(LIC_PATH, token);

const managerWithoutPublicKey = new LicenseManager(DATA_DIR);
console.assert(managerWithoutPublicKey.hasPremiumAccess() === false, 'Should stay community without PROMPTHOUSE_PUBLIC_KEY');
console.assert(
  managerWithoutPublicKey.licenseState.truthState === 'LICENSE_PUBLIC_KEY_REQUIRED',
  'Should report missing public key'
);
console.log('Passed: does not unlock enterprise without a verification public key.');

process.env.PROMPTHOUSE_PUBLIC_KEY = publicPem;
const managerWithLicense = new LicenseManager(DATA_DIR);
console.assert(managerWithLicense.hasPremiumAccess() === true, 'Should be in premium mode with verified license');
console.assert(managerWithLicense.getTier() === 'enterprise', 'Should detect enterprise tier');
console.assert(managerWithLicense.licenseState.truthState === 'LICENSE_VERIFIED', 'Should report verified license');
console.log(`Passed: verified Enterprise license for ${managerWithLicense.licenseState.organization}.`);

fs.unlinkSync(LIC_PATH);
if (previousPublicKey === undefined) {
  delete process.env.PROMPTHOUSE_PUBLIC_KEY;
} else {
  process.env.PROMPTHOUSE_PUBLIC_KEY = previousPublicKey;
}
console.log('--- Test Complete ---');
