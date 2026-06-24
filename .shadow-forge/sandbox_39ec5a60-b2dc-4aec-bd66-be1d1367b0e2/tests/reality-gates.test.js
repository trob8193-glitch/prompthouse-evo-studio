import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it } from 'vitest';
import { LicenseManager } from '../src/core/enterprise/LicenseManager.js';
import { TelemetryLedger } from '../src/core/enterprise/TelemetryLedger.js';
import { registerCommerceMarketplaceRoutes } from '../src/routes/commerce_marketplace_routes.js';

const originalEnv = { ...process.env };
const servers = [];

afterEach(() => {
  process.env = { ...originalEnv };
  while (servers.length) {
    servers.pop().close();
  }
});

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeEnterpriseLicense(dir) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const token = jwt.sign(
    {
      tier: 'enterprise',
      org: 'Reality Audit Org',
      exp: Math.floor(Date.now() / 1000) + 60 * 60
    },
    privatePem,
    { algorithm: 'RS256' }
  );
  fs.writeFileSync(path.join(dir, 'enterprise.lic'), token);
  return publicPem;
}

async function listen(app) {
  return await new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      servers.push(server);
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

describe('reality gates', () => {
  it('does not unlock enterprise without a verification public key', () => {
    const dir = tempDir('ph-license-');
    delete process.env.PROMPTHOUSE_PUBLIC_KEY;
    writeEnterpriseLicense(dir);

    const manager = new LicenseManager(dir);

    expect(manager.hasPremiumAccess()).toBe(false);
    expect(manager.getTier()).toBe('community');
    expect(manager.licenseState.truthState).toBe('LICENSE_PUBLIC_KEY_REQUIRED');
  });

  it('unlocks enterprise with a real RS256 license and matching public key', () => {
    const dir = tempDir('ph-license-');
    process.env.PROMPTHOUSE_PUBLIC_KEY = writeEnterpriseLicense(dir);

    const manager = new LicenseManager(dir);

    expect(manager.isEnterprise()).toBe(true);
    expect(manager.getTier()).toBe('enterprise');
    expect(manager.licenseState.truthState).toBe('LICENSE_VERIFIED');
  });

  it('blocks marketplace checkout when Stripe credentials are absent', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const app = express();
    app.use(express.json());
    registerCommerceMarketplaceRoutes(app);
    const baseUrl = await listen(app);

    const response = await fetch(`${baseUrl}/api/marketplace/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'app_123', price: 900 })
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.truthState).toBe('STRIPE_SECRET_KEY_REQUIRED');
    expect(body.requiredEnvKey).toBe('STRIPE_SECRET_KEY');
  });

  it('requires a billing public key before exporting encrypted telemetry', () => {
    const dir = tempDir('ph-telemetry-');
    delete process.env.PROMPTHOUSE_BILLING_PUBLIC_KEY;
    const ledger = new TelemetryLedger(dir);
    ledger.logUsage({ tokens: 12, apps: 1, loc: 4 });

    const result = ledger.exportAuditFile();

    expect(result.success).toBe(false);
    expect(result.truthState).toBe('BILLING_PUBLIC_KEY_REQUIRED');
    expect(fs.existsSync(path.join(dir, 'billing_export.audit'))).toBe(false);
  });

  it('exports encrypted telemetry when a billing public key is configured', () => {
    const dir = tempDir('ph-telemetry-');
    const { publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    process.env.PROMPTHOUSE_BILLING_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' });
    const ledger = new TelemetryLedger(dir);
    ledger.logUsage({ tokens: 12, apps: 1, loc: 4 });

    const result = ledger.exportAuditFile();
    const auditText = fs.readFileSync(result.path, 'utf8');
    const payload = JSON.parse(Buffer.from(auditText.split('\n')[1], 'base64').toString('utf8'));

    expect(result.success).toBe(true);
    expect(result.truthState).toBe('BILLING_AUDIT_ENCRYPTED');
    expect(payload.truthState).toBe('BILLING_AUDIT_ENCRYPTED');
    expect(payload.algorithm).toBe('RSA-OAEP-SHA256+A256GCM');
  });
});
