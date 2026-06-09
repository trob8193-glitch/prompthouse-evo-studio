import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class TelemetryLedger {
  constructor(dataDir) {
    this.ledgerPath = path.join(dataDir, 'usage_telemetry.json');
    this.auditExportPath = path.join(dataDir, 'billing_export.audit');
    this.initLedger();
  }

  initLedger() {
    if (!fs.existsSync(this.ledgerPath)) {
      const initial = {
        tokensConsumed: 0,
        appsGenerated: 0,
        linesOfCode: 0,
        lastExportAt: null
      };
      fs.writeFileSync(this.ledgerPath, JSON.stringify(initial, null, 2));
    }
  }

  logUsage({ tokens = 0, apps = 0, loc = 0 }) {
    try {
      const data = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
      data.tokensConsumed += tokens;
      data.appsGenerated += apps;
      data.linesOfCode += loc;
      fs.writeFileSync(this.ledgerPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[TelemetryLedger] Failed to log usage:', e.message);
    }
  }

  exportAuditFile() {
    try {
      const publicKey = process.env.PROMPTHOUSE_BILLING_PUBLIC_KEY;
      if (!publicKey) {
        return {
          success: false,
          truthState: 'BILLING_PUBLIC_KEY_REQUIRED',
          blocked: true,
          requiredEnvKey: 'PROMPTHOUSE_BILLING_PUBLIC_KEY',
          reason: 'Billing audit export requires a configured RSA public key.'
        };
      }

      const data = fs.readFileSync(this.ledgerPath, 'utf8');
      const aesKey = crypto.randomBytes(32);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
      const ciphertext = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();
      const encryptedKey = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        aesKey
      );

      const auditPayload = {
        schema: 'prompthouse.billing.audit.v1',
        truthState: 'BILLING_AUDIT_ENCRYPTED',
        algorithm: 'RSA-OAEP-SHA256+A256GCM',
        exportedAt: new Date().toISOString(),
        encryptedKey: encryptedKey.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        ciphertext: ciphertext.toString('base64')
      };

      const auditFile = [
        '-----BEGIN PROMPTHOUSE AUDIT-----',
        Buffer.from(JSON.stringify(auditPayload), 'utf8').toString('base64'),
        '-----END PROMPTHOUSE AUDIT-----'
      ].join('\n');

      fs.writeFileSync(this.auditExportPath, auditFile);
      console.log(`📈 [TelemetryLedger] Encrypted Audit File generated at ${this.auditExportPath}`);
      return {
        success: true,
        truthState: 'BILLING_AUDIT_ENCRYPTED',
        path: this.auditExportPath,
        algorithm: auditPayload.algorithm
      };
    } catch (e) {
      console.error('[TelemetryLedger] Failed to export audit:', e.message);
      return {
        success: false,
        truthState: 'BILLING_AUDIT_EXPORT_FAILED',
        error: e.message
      };
    }
  }
}
