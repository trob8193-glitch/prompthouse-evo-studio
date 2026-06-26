import fs from 'fs';
import path from 'path';
import { Log } from '../autonomy/SovereignLogger.js';

/**
 * DatabaseConnection abstracts the underlying storage mechanism.
 * Currently uses a robust local JSON store, allowing seamless future migration
 * to SQLite, PostgreSQL, or MongoDB without changing daemon code.
 */
export class DatabaseConnection {
  constructor(dbName = 'core_database') {
    this.dbFile = path.join(process.cwd(), '.prompthouse-data', `${dbName}.json`);
    this.connected = false;
    this.cache = {};
  }

  async connect() {
    try {
      const dir = path.dirname(this.dbFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      if (fs.existsSync(this.dbFile)) {
        this.cache = JSON.parse(fs.readFileSync(this.dbFile, 'utf8'));
      } else {
        this.cache = {};
        this._save();
      }
      
      this.connected = true;
      Log.info(`[Database] Connected to ${this.dbFile}`);
      return true;
    } catch (e) {
      Log.error(`[Database] Connection failed: ${e.message}`);
      throw e;
    }
  }

  _save() {
    fs.writeFileSync(this.dbFile, JSON.stringify(this.cache, null, 2));
  }

  async insert(collection, document) {
    if (!this.connected) await this.connect();
    
    if (!this.cache[collection]) {
      this.cache[collection] = [];
    }
    
    const docWithId = { _id: Date.now().toString(), ...document };
    this.cache[collection].push(docWithId);
    this._save();
    return docWithId;
  }

  async find(collection, query = {}) {
    if (!this.connected) await this.connect();
    
    const data = this.cache[collection] || [];
    // Basic query matching
    const keys = Object.keys(query);
    if (keys.length === 0) return data;
    
    return data.filter(doc => {
      return keys.every(k => doc[k] === query[k]);
    });
  }

  async update(collection, query, updates) {
    if (!this.connected) await this.connect();
    
    const data = this.cache[collection] || [];
    let updatedCount = 0;
    
    const keys = Object.keys(query);
    for (let doc of data) {
      if (keys.length === 0 || keys.every(k => doc[k] === query[k])) {
        Object.assign(doc, updates);
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) this._save();
    return updatedCount;
  }

  async replaceWholeCollection(collection, dataArray) {
    if (!this.connected) await this.connect();
    this.cache[collection] = dataArray;
    this._save();
  }
}

export const GlobalDatabase = new DatabaseConnection();
