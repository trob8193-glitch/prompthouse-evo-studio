import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stamp() {
  return new Date().toISOString();
}

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function encryptPayload(payload, publicKey) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(body), cipher.final()]);
  const tag = cipher.getAuthTag();
  const encryptedKey = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    key
  );

  return {
    algorithm: 'RSA-OAEP-SHA256+A256GCM',
    encryptedKey: encryptedKey.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

export class TelemetryLedger {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.ledgerPath = path.join(dataDir, 'telemetry_usage.jsonl');
    this.auditPath = path.join(dataDir, 'billing_export.audit');
  }

  logUsage(event = {}) {
    ensureDir(this.dataDir);
    const record = {
      recordedAt: stamp(),
      tokens: Number.isFinite(Number(event.tokens)) ? Number(event.tokens) : 0,
      apps: Number.isFinite(Number(event.apps)) ? Number(event.apps) : 0,
      loc: Number.isFinite(Number(event.loc)) ? Number(event.loc) : 0,
      source: String(event.source || 'studio-runtime'),
    };
    fs.appendFileSync(this.ledgerPath, `${JSON.stringify(record)}\n`, 'utf8');
    return record;
  }

  exportAuditFile() {
    const publicKey = process.env.PROMPTHOUSE_BILLING_PUBLIC_KEY;
    if (!publicKey) {
      return {
        success: false,
        truthState: 'BILLING_PUBLIC_KEY_REQUIRED',
        requiredEnvKey: 'PROMPTHOUSE_BILLING_PUBLIC_KEY',
        path: this.auditPath,
      };
    }

    const usage = readJsonl(this.ledgerPath);
    const totals = usage.reduce((acc, item) => ({
      tokens: acc.tokens + Number(item.tokens || 0),
      apps: acc.apps + Number(item.apps || 0),
      loc: acc.loc + Number(item.loc || 0),
    }), { tokens: 0, apps: 0, loc: 0 });

    try {
      const encrypted = encryptPayload({ usage, totals }, publicKey);
      const payload = {
        schema: 'prompthouse.billing.telemetry.audit.v1',
        truthState: 'BILLING_AUDIT_ENCRYPTED',
        exportedAt: stamp(),
        usageCount: usage.length,
        totals,
        ...encrypted,
      };
      ensureDir(this.dataDir);
      fs.writeFileSync(
        this.auditPath,
        `PROMPTHOUSE_BILLING_AUDIT_V1\n${Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')}\n`,
        'utf8'
      );
      return {
        success: true,
        truthState: 'BILLING_AUDIT_ENCRYPTED',
        path: this.auditPath,
        usageCount: usage.length,
      };
    } catch (error) {
      return {
        success: false,
        truthState: 'BILLING_PUBLIC_KEY_INVALID',
        error: error.message,
        path: this.auditPath,
      };
    }
  }
}
