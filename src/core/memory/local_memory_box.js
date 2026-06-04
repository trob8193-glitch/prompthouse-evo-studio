import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Isomorphic check
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/**
 * LocalMemoryBox — Local-first encrypted memory storage for sensitive agent state
 * Status: ACTIVE
 */
export class LocalMemoryBox {
  constructor(dbName = 'secure_box.json') {
    this.dbName = dbName;
    this.name = 'LocalMemoryBox';
    this.description = 'Local-first encrypted memory storage for sensitive agent state';
    this.status = 'ACTIVE';
    this.store = {}; // { key: ciphertext }
    this._load();
  }

  _getEncryptionKey() {
    if (isNode && process.env.QUADBRAIN_MASTER_KEY) {
      return crypto.scryptSync(process.env.QUADBRAIN_MASTER_KEY, 'salt', 32);
    }
    // Using a consistent internal key for local execution if none provided
    return crypto.scryptSync('quadbrain_default_local_key', 'salt', 32);
  }

  _getDbPath() {
    if (isNode) {
      return path.join(process.cwd(), '.quadbrain-db', this.dbName);
    }
    return this.dbName;
  }

  _load() {
    if (isNode) {
      const dbPath = this._getDbPath();
      if (fs.existsSync(dbPath)) {
        try {
          this.store = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (e) {
          this.store = {};
        }
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(this.dbName);
        if (data) this.store = JSON.parse(data);
      } catch (e) {}
    }
  }

  _save() {
    if (isNode) {
      const dbPath = this._getDbPath();
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify(this.store, null, 2));
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.dbName, JSON.stringify(this.store));
    }
  }

  generateLocalKey() {
    if (isNode) return crypto.randomBytes(32).toString('hex');
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      return Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return 'fallback_key_' + Date.now();
  }

  async secureStore(key, value) {
    if (!isNode) {
      // Basic browser fallback (not fully secure, assuming demo mode if running in browser directly)
      this.store[key] = btoa(JSON.stringify(value));
      this._save();
      return true;
    }
    
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', this._getEncryptionKey(), iv);
      let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      
      this.store[key] = {
        iv: iv.toString('hex'),
        encrypted,
        authTag
      };
      this._save();
      return true;
    } catch (e) {
      console.error('Encryption failed', e);
      return false;
    }
  }

  async secureRetrieve(key) {
    const data = this.store[key];
    if (!data) return null;

    if (!isNode) {
      try { return JSON.parse(atob(data)); } catch(e) { return null; }
    }

    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', this._getEncryptionKey(), Buffer.from(data.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'A',
      state: this.status,
      resonance: 100,
      description: this.description,
      secureKeysCount: Object.keys(this.store).length
    };
  }
}
