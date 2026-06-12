import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const VERSION = '1.0.0';

const MOBILE_CHANNELS = Object.freeze([
  'android-webview',
  'mobile-browser',
  'pwa-shell',
  'offline-cache',
  'push-intent',
  'voice-command',
  'camera-intent',
  'gps-context',
  'nfc-qr-intent',
  'studio-remote-control'
]);

const REQUIRED_MOBILE_PROOF = Object.freeze([
  'mobile-contract-loaded',
  'offline-fallback-present',
  'auth-scope-checked',
  'dangerous-action-gated',
  'receipt-written',
  'operator-visible-status'
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);
}

function mobilePaths({ rootDir = process.cwd() } = {}) {
  const base = path.join(rootDir, '.prompthouse-data', 'omnibot-mobile');
  return {
    base,
    sessions: path.join(base, 'sessions.jsonl'),
    receipts: path.join(base, 'receipts'),
    status: path.join(base, 'status.json')
  };
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function appendJsonl(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, 'utf8');
}

function readJsonl(file, limit = 100) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).slice(-limit).map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
}

export function getOmnibotMobileContract() {
  return {
    name: 'PromptHouse Omnibot Mobile Control Layer',
    version: VERSION,
    purpose: 'Expose a safe mobile-first cockpit for Omnibot actions, studio status, offline fallbacks, mobile intents, and proof-gated remote control.',
    channels: MOBILE_CHANNELS,
    proofRequired: REQUIRED_MOBILE_PROOF,
    policy: {
      mobileFirst: true,
      offlineFallbackRequired: true,
      noDangerousActionWithoutGate: true,
      rawCredentialsNeverStored: true,
      receiptsRequired: true,
      operatorStatusVisible: true
    }
  };
}

export function getOmnibotMobileStatus({ rootDir = process.cwd(), limit = 25 } = {}) {
  const paths = mobilePaths({ rootDir });
  const sessions = readJsonl(paths.sessions, limit);
  const status = {
    success: true,
    version: VERSION,
    truthState: sessions.length ? 'OMNIBOT_MOBILE_READY' : 'OMNIBOT_MOBILE_WAITING_FOR_SESSION',
    channels: MOBILE_CHANNELS,
    proofRequired: REQUIRED_MOBILE_PROOF,
    sessionCount: sessions.length,
    latestSession: sessions.at(-1) || null,
    files: {
      sessions: path.relative(rootDir, paths.sessions),
      receipts: path.relative(rootDir, paths.receipts),
      status: path.relative(rootDir, paths.status)
    }
  };
  writeJson(paths.status, status);
  return status;
}

export function registerOmnibotMobileSession({ rootDir = process.cwd(), session = {} } = {}) {
  const paths = mobilePaths({ rootDir });
  const normalized = {
    id: session.id || `omnibot_mobile_${Date.now()}_${hash(JSON.stringify(session))}`,
    createdAt: new Date().toISOString(),
    device: String(session.device || 'mobile-operator'),
    channel: MOBILE_CHANNELS.includes(session.channel) ? session.channel : 'mobile-browser',
    operator: String(session.operator || 'studio-owner'),
    mode: String(session.mode || 'status-control'),
    allowedIntents: Array.isArray(session.allowedIntents) ? session.allowedIntents.slice(0, 24) : ['status', 'proof', 'safe-plan', 'receipt'],
    dangerousActionsBlocked: true,
    offlineFallback: true,
    proofRequired: REQUIRED_MOBILE_PROOF
  };
  appendJsonl(paths.sessions, normalized);
  const status = getOmnibotMobileStatus({ rootDir });
  const receipt = writeOmnibotMobileReceipt({ rootDir, type: 'omnibot_mobile_session_receipt', payload: normalized });
  return { success: true, session: normalized, status, receipt };
}

export function writeOmnibotMobileReceipt({ rootDir = process.cwd(), type = 'omnibot_mobile_receipt', payload = {} } = {}) {
  const paths = mobilePaths({ rootDir });
  ensureDir(paths.receipts);
  const receipt = {
    id: `omnibot_mobile_receipt_${Date.now()}_${hash(JSON.stringify(payload))}`,
    type,
    createdAt: new Date().toISOString(),
    truthState: 'OMNIBOT_MOBILE_RECEIPT_WRITTEN',
    payload
  };
  const file = path.join(paths.receipts, `${receipt.id}.json`);
  writeJson(file, receipt);
  return { file: path.relative(rootDir, file), receipt };
}
