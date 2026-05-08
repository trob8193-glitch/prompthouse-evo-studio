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
`;

export function initDatabase() {
  db.exec(SCHEMA);
  console.log('Database schema initialized successfully.');
}

export default db;
