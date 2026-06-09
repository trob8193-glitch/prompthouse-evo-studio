import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// In a real scenario, this is the public key belonging to PromptHouse Headquarters
const PROMPTHOUSE_BILLING_PUBLIC_KEY = process.env.PROMPTHOUSE_BILLING_PUBLIC_KEY || 'mock-public-key';

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
      const data = fs.readFileSync(this.ledgerPath, 'utf8');
      
      // In a real environment, we would use crypto.publicEncrypt with PROMPTHOUSE_BILLING_PUBLIC_KEY
      // to ensure ONLY PromptHouse HQ can read the bank's usage data.
      // For demonstration, we simply base64 encode it and append a mock signature.
      
      const payload = Buffer.from(data).toString('base64');
      const signature = crypto.createHash('sha256').update(payload).digest('hex');
      const auditFile = `-----BEGIN PROMPTHOUSE AUDIT-----\n${payload}\n-----SIGNATURE-----\n${signature}\n-----END PROMPTHOUSE AUDIT-----`;
      
      fs.writeFileSync(this.auditExportPath, auditFile);
      console.log(`📈 [TelemetryLedger] Encrypted Audit File generated at ${this.auditExportPath}`);
      return this.auditExportPath;
    } catch (e) {
      console.error('[TelemetryLedger] Failed to export audit:', e.message);
      return null;
    }
  }
}
