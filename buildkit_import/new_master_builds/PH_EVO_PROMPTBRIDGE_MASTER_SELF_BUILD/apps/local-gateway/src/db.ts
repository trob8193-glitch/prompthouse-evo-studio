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
  sanitizer_json TEXT,
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
  prompt TEXT,
  chosen TEXT,
  rejected TEXT,
  metadata_json TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'review_required',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reality_claims (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  claim_text TEXT NOT NULL,
  state TEXT NOT NULL,
  evidence_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proof_evidence (
  id TEXT PRIMARY KEY,
  evidence_type TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  score REAL,
  created_at TEXT NOT NULL
);
`);
