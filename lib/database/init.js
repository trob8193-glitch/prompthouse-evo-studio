/**
 * PromptHouse Database Initialization
 * Sets up SQLite schema for ledger, artifacts, and state management
 * 
 * Usage:
 *   import { ensureDatabase } from './lib/database/init.js';
 *   const db = ensureDatabase();
 */

import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function ensureDatabase(options = {}) {
  const {
    dbDir = path.join(process.cwd(), '.prompthouse-data'),
    dbName = 'studio.db',
    verbose = false,
  } = options;

  // Ensure directory exists
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, dbName);
  const db = new Database(dbPath);

  if (verbose) {
    global.Log && global.Log.info(`📦 Database: ${dbPath}`);
  }

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Initialize schema
  initializeSchema(db, verbose);

  return db;
}

function initializeSchema(db, verbose = false) {
  const tables = [
    {
      name: 'sovereign_ledger',
      sql: `
        CREATE TABLE IF NOT EXISTS sovereign_ledger (
          id TEXT PRIMARY KEY,
          feature_id TEXT,
          action TEXT NOT NULL,
          proof_hash TEXT,
          truth_state TEXT DEFAULT 'UNVERIFIED',
          iq_gain INTEGER DEFAULT 0,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_ledger_action ON sovereign_ledger(action);
        CREATE INDEX IF NOT EXISTS idx_ledger_truth_state ON sovereign_ledger(truth_state);
        CREATE INDEX IF NOT EXISTS idx_ledger_created ON sovereign_ledger(created_at DESC);
      `,
    },
    {
      name: 'artifacts',
      sql: `
        CREATE TABLE IF NOT EXISTS artifacts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          content TEXT,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
        CREATE INDEX IF NOT EXISTS idx_artifacts_created ON artifacts(created_at DESC);
      `,
    },
    {
      name: 'proof_receipts',
      sql: `
        CREATE TABLE IF NOT EXISTS proof_receipts (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          result TEXT,
          evidence_type TEXT,
          verified BOOLEAN DEFAULT 0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_receipts_action ON proof_receipts(action);
        CREATE INDEX IF NOT EXISTS idx_receipts_verified ON proof_receipts(verified);
      `,
    },
    {
      name: 'manifests',
      sql: `
        CREATE TABLE IF NOT EXISTS manifests (
          id TEXT PRIMARY KEY,
          workspace_id TEXT,
          project_id TEXT,
          seed_intent TEXT NOT NULL,
          manifest_json TEXT,
          readiness_score INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_manifests_project ON manifests(workspace_id, project_id);
        CREATE INDEX IF NOT EXISTS idx_manifests_created ON manifests(created_at DESC);
      `,
    },
    {
      name: 'connectors',
      sql: `
        CREATE TABLE IF NOT EXISTS connectors (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          connector_id TEXT UNIQUE,
          type TEXT,
          risk_level TEXT,
          status TEXT DEFAULT 'disconnected',
          config TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_connectors_status ON connectors(status);
      `,
    },
    {
      name: 'handshakes',
      sql: `
        CREATE TABLE IF NOT EXISTS handshakes (
          id TEXT PRIMARY KEY,
          connector_id TEXT NOT NULL,
          status TEXT NOT NULL,
          result TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(connector_id) REFERENCES connectors(connector_id)
        );
        CREATE INDEX IF NOT EXISTS idx_handshakes_connector ON handshakes(connector_id);
      `,
    },
    {
      name: 'sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          thread_id TEXT,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          ended_at DATETIME,
          metadata TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_thread ON sessions(thread_id);
      `,
    },
    {
      name: 'messages',
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          thread_id TEXT,
          role TEXT,
          content TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(session_id) REFERENCES sessions(id)
        );
        CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
      `,
    },
  ];

  for (const table of tables) {
    try {
      db.exec(table.sql);
      if (verbose) {
        global.Log && global.Log.info(`✅ Table: ${table.name}`);
      }
    } catch (err) {
      if (verbose) {
        console.warn(`⚠️ Table ${table.name}: ${err.message}`);
      }
    }
  }

  // Seed default connectors if table is empty
  try {
    const connectorCount = db.prepare('SELECT COUNT(*) as count FROM connectors').get().count;
    if (connectorCount === 0) {
      const defaultConnectors = [
        ['conn_github', 'GitHub', 'github-1', 'vcs', 'LOW', 'connected'],
        ['conn_stripe', 'Stripe', 'stripe-1', 'payment', 'MEDIUM', 'disconnected'],
        ['conn_openai', 'OpenAI', 'openai-1', 'ai', 'HIGH', 'connected'],
      ];

      const stmt = db.prepare(
        'INSERT INTO connectors (id, name, connector_id, type, risk_level, status) VALUES (?, ?, ?, ?, ?, ?)'
      );

      for (const connector of defaultConnectors) {
        stmt.run(...connector);
      }

      if (verbose) {
        global.Log && global.Log.info(`✅ Seeded: 3 default connectors`);
      }
    }
  } catch (err) {
    if (verbose) {
      console.warn(`⚠️ Seeding connectors: ${err.message}`);
    }
  }

  if (verbose) {
    global.Log && global.Log.info(`✅ Database initialized successfully`);
  }
}

export default ensureDatabase;
