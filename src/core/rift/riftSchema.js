export const RIFT_GRID_SCHEMA = `
CREATE TABLE IF NOT EXISTS rift_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  camera_enabled INTEGER DEFAULT 0,
  microphone_enabled INTEGER DEFAULT 0,
  gps_enabled INTEGER DEFAULT 0,
  face_analysis_enabled INTEGER DEFAULT 0,
  voice_analysis_enabled INTEGER DEFAULT 0,
  ai_generation_enabled INTEGER DEFAULT 0,
  avatar_mirroring_enabled INTEGER DEFAULT 0,
  revoked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rift_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  mode TEXT NOT NULL,
  status TEXT DEFAULT 'created',
  truth_label TEXT DEFAULT 'SIMULATED',
  evo_route TEXT,
  evo_name TEXT,
  mobile_runtime_id TEXT,
  started_at DATETIME,
  paused_at DATETIME,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rift_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  truth_label TEXT NOT NULL,
  payload_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES rift_sessions(id)
);

CREATE TABLE IF NOT EXISTS rift_pattern_signals (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  source TEXT NOT NULL,
  value TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  confidence REAL DEFAULT 0,
  truth_label TEXT DEFAULT 'INFERRED',
  first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rift_timeline_branches (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  title TEXT NOT NULL,
  source_event_id TEXT,
  truth_label TEXT DEFAULT 'SIMULATED',
  branch_graph_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES rift_sessions(id)
);

CREATE TABLE IF NOT EXISTS rift_entities (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  visual_style TEXT,
  rules_json TEXT,
  memory_scope TEXT DEFAULT 'session',
  trust_level TEXT DEFAULT 'simulated',
  truth_label TEXT DEFAULT 'GENERATED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evopulse_grid_nodes (
  id TEXT PRIMARY KEY,
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL,
  status TEXT DEFAULT 'offline',
  truth_label TEXT DEFAULT 'SIMULATED',
  capabilities_json TEXT,
  boundary_json TEXT,
  last_seen_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evopulse_routes (
  id TEXT PRIMARY KEY,
  route_type TEXT NOT NULL,
  route_value TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  target_id TEXT,
  status TEXT DEFAULT 'reserved',
  truth_label TEXT DEFAULT 'SIMULATED',
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rift_ai_usage (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  user_id TEXT,
  request_type TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  credits_used INTEGER DEFAULT 0,
  truth_label TEXT DEFAULT 'GENERATED',
  status TEXT DEFAULT 'recorded',
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rift_abuse_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  truth_label TEXT DEFAULT 'REAL',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export function ensureRiftGridSchema(db) {
  db.exec(RIFT_GRID_SCHEMA);
}
