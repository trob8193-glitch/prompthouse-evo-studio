import Database from "better-sqlite3";

export const db = new Database("ph_evo_local.sqlite");

db.exec(`
CREATE TABLE IF NOT EXISTS promptbridge_events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  workspace_id TEXT,
  project_id TEXT,
  user_id TEXT,
  url TEXT,
  title TEXT,
  payload_json TEXT NOT NULL,
  training_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memory_objects (
  id TEXT PRIMARY KEY,
  privacy_scope TEXT NOT NULL,
  memory_type TEXT NOT NULL,
  content_json TEXT NOT NULL,
  allowed_for_training INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_items (
  id TEXT PRIMARY KEY,
  source_event_id TEXT,
  item_type TEXT NOT NULL,
  content_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'review_required',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS model_versions (
  id TEXT PRIMARY KEY,
  model_family TEXT NOT NULL,
  model_type TEXT NOT NULL,
  base_model TEXT,
  dataset_version TEXT,
  eval_status TEXT NOT NULL DEFAULT 'pending',
  deployment_state TEXT NOT NULL DEFAULT 'not_deployed',
  created_at TEXT NOT NULL
);
`);
