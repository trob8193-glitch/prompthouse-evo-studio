import fs from 'fs';
import path from 'path';

// Isomorphic environment check
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/**
 * WorkspaceMemory — Persists workspace state (open files, layout, preferences) across sessions
 * Status: ACTIVE
 */
export class WorkspaceMemory {
  constructor(dbName = 'workspace.json') {
    this.dbName = dbName;
    this.name = 'WorkspaceMemory';
    this.description = 'Persists workspace state (open files, layout, preferences) across sessions';
    this.status = 'ACTIVE';
    this.state = {
      layout: {},
      preferences: {},
      openFiles: [],
      sessionMetrics: []
    };
    this._load();
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
          this.state = { ...this.state, ...JSON.parse(fs.readFileSync(dbPath, 'utf8')) };
        } catch (e) {
          // keep defaults
        }
      }
    } else if (typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(this.dbName);
        if (data) this.state = { ...this.state, ...JSON.parse(data) };
      } catch (e) {}
    }
  }

  _save() {
    if (isNode) {
      const dbPath = this._getDbPath();
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(this.state, null, 2));
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.dbName, JSON.stringify(this.state));
    }
  }

  saveLayout(layout) {
    this.state.layout = layout;
    this._save();
  }

  loadLayout() {
    return this.state.layout;
  }

  updatePreferences(prefs) {
    this.state.preferences = { ...this.state.preferences, ...prefs };
    this._save();
  }

  setOpenFiles(files) {
    this.state.openFiles = files;
    this._save();
  }

  recordSessionMetrics(metrics) {
    this.state.sessionMetrics.push({
      timestamp: new Date().toISOString(),
      ...metrics
    });
    // Keep last 100 sessions
    if (this.state.sessionMetrics.length > 100) {
      this.state.sessionMetrics.shift();
    }
    this._save();
  }

  getStatus() {
    return {
      id: this.name,
      grade: 'A',
      state: this.status,
      resonance: 100,
      description: this.description,
      metricsCount: this.state.sessionMetrics.length,
      openFilesCount: this.state.openFiles.length
    };
  }
}
