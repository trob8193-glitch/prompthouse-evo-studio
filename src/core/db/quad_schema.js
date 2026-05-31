import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve('./prompthouse.db');
const db = new Database(DB_PATH);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  user_id TEXT,
  role TEXT DEFAULT 'member',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS api_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  default_credit_cost INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_product_versions (
  id TEXT PRIMARY KEY,
  api_product_id TEXT,
  version TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  openapi_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(api_product_id) REFERENCES api_products(id)
);

CREATE TABLE IF NOT EXISTS api_endpoints (
  id TEXT PRIMARY KEY,
  api_product_id TEXT,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  credit_cost INTEGER DEFAULT 1,
  required_plan TEXT DEFAULT 'free',
  provider_allowed TEXT DEFAULT 'local',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(api_product_id) REFERENCES api_products(id)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  environment TEXT DEFAULT 'test',
  status TEXT DEFAULT 'active',
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS api_credits (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  plan TEXT DEFAULT 'free',
  credits_granted INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  credits_remaining INTEGER DEFAULT 0,
  billing_period_start DATETIME,
  billing_period_end DATETIME,
  subscription_status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS api_requests (
  id TEXT PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  organization_id TEXT,
  api_key_id TEXT,
  api_product_id TEXT,
  method TEXT,
  endpoint TEXT,
  status_code INTEGER,
  latency_ms INTEGER,
  credits_reserved INTEGER,
  credits_used INTEGER,
  provider_used TEXT,
  model_used TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(api_key_id) REFERENCES api_keys(id),
  FOREIGN KEY(api_product_id) REFERENCES api_products(id)
);

CREATE TABLE IF NOT EXISTS usage_ledger (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  api_key_id TEXT,
  api_product_id TEXT,
  event_type TEXT,
  credits_reserved INTEGER,
  credits_used INTEGER,
  provider_cost_estimate REAL,
  billing_period TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(api_key_id) REFERENCES api_keys(id),
  FOREIGN KEY(api_product_id) REFERENCES api_products(id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT,
  status TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS billing_customers (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  stripe_customer_id TEXT,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS provider_usage (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  user_id TEXT,
  task_id TEXT,
  provider TEXT,
  model TEXT,
  endpoint TEXT,
  input_units INTEGER,
  output_units INTEGER,
  estimated_cost REAL,
  credits_reserved INTEGER,
  credits_used INTEGER,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  organization_id TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(actor_user_id) REFERENCES users(id),
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT,
  event_id TEXT,
  event_type TEXT,
  processed INTEGER DEFAULT 0,
  payload_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS autonomous_tasks (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  created_by_user_id TEXT,
  task_type TEXT,
  status TEXT,
  mode TEXT,
  provider_requested TEXT,
  provider_used TEXT,
  credits_reserved INTEGER,
  credits_used INTEGER,
  requires_approval INTEGER DEFAULT 1,
  approved_by_user_id TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id),
  FOREIGN KEY(created_by_user_id) REFERENCES users(id),
  FOREIGN KEY(approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS autonomous_budget_rules (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  feature_slug TEXT,
  mode TEXT,
  provider_allowed TEXT,
  max_daily_credits INTEGER,
  max_monthly_credits INTEGER,
  requires_approval_for_paid_ai INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  scope TEXT DEFAULT 'global',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sovereign_ledger (
  id TEXT PRIMARY KEY,
  feature_id TEXT NOT NULL,
  action TEXT NOT NULL,
  proof_hash TEXT UNIQUE,
  truth_state TEXT DEFAULT 'UNVERIFIED',
  iq_gain INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kv_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proof_receipts (
  id TEXT PRIMARY KEY,
  mission TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  files_changed INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sovereign_memory (
  id TEXT PRIMARY KEY,
  agent TEXT NOT NULL,
  key TEXT NOT NULL,
  memory TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent, key)
);

CREATE TABLE IF NOT EXISTS nightforge_state (
  id TEXT PRIMARY KEY DEFAULT 'nightforge_singleton',
  state_data TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export function initDatabase() {
  db.exec(SCHEMA);
}

// ─── KV CONFIG OPERATIONS ─────────────────────────────────────
export function getConfigValue(key) {
  const row = db.prepare('SELECT value FROM kv_config WHERE key = ?').get(key);
  if (!row) return null;
  try { return JSON.parse(row.value); } catch { return row.value; }
}

export function setConfigValue(key, value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  db.prepare('INSERT INTO kv_config (key, value, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').run(key, serialized);
}

export function getAllConfigValues() {
  const rows = db.prepare('SELECT key, value FROM kv_config').all();
  const result = {};
  for (const row of rows) {
    try { result[row.key] = JSON.parse(row.value); } catch { result[row.key] = row.value; }
  }
  return result;
}

// ─── PROOF RECEIPT OPERATIONS ─────────────────────────────────
export function createProofReceipt({ mission, status, details, filesChanged }) {
  const id = `pr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const serialized = typeof details === 'string' ? details : JSON.stringify(details);
  db.prepare('INSERT INTO proof_receipts (id, mission, status, details, files_changed) VALUES (?, ?, ?, ?, ?)').run(id, mission, status, serialized, filesChanged || 0);
  return { id, mission, status };
}

export function getRecentProofReceipts(limit = 20) {
  return db.prepare('SELECT * FROM proof_receipts ORDER BY timestamp DESC LIMIT ?').all(limit);
}

// ─── SOVEREIGN MEMORY OPERATIONS ──────────────────────────────
export function setMemory(agent, key, memory) {
  const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const serialized = typeof memory === 'string' ? memory : JSON.stringify(memory);
  db.prepare('INSERT INTO sovereign_memory (id, agent, key, memory, timestamp) VALUES (?, ?, ?, ?, datetime("now")) ON CONFLICT(agent, key) DO UPDATE SET memory = excluded.memory, timestamp = excluded.timestamp').run(id, agent, key, serialized);
}

export function getMemory(agent, key) {
  const row = db.prepare('SELECT memory FROM sovereign_memory WHERE agent = ? AND key = ?').get(agent, key);
  if (!row) return null;
  try { return JSON.parse(row.memory); } catch { return row.memory; }
}

export function getAgentMemories(agent) {
  return db.prepare('SELECT key, memory, timestamp FROM sovereign_memory WHERE agent = ? ORDER BY timestamp DESC').all(agent).map(r => {
    try { return { key: r.key, memory: JSON.parse(r.memory), timestamp: r.timestamp }; } catch { return r; }
  });
}

// ─── NIGHTFORGE STATE ─────────────────────────────────────────
export function getNightForgeDBState() {
  const row = db.prepare('SELECT state_data FROM nightforge_state WHERE id = ?').get('nightforge_singleton');
  if (!row) return null;
  try { return JSON.parse(row.state_data); } catch { return row.state_data; }
}

export function setNightForgeDBState(state) {
  const serialized = typeof state === 'string' ? state : JSON.stringify(state);
  db.prepare('INSERT INTO nightforge_state (id, state_data, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(id) DO UPDATE SET state_data = excluded.state_data, updated_at = excluded.updated_at').run('nightforge_singleton', serialized);
}

export default db;
