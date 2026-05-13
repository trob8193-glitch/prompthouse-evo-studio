import crypto from 'crypto';

export function ensureRiftGridSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rift_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      mode TEXT NOT NULL,
      status TEXT DEFAULT 'created',
      truth_label TEXT DEFAULT 'SIMULATED',
      evo_route TEXT,
      started_at DATETIME,
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
      base_timeline_id TEXT,
      choice_text TEXT NOT NULL,
      outcome_json TEXT NOT NULL,
      truth_label TEXT DEFAULT 'SIMULATED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evopulse_grid_routes (
      id TEXT PRIMARY KEY,
      route_type TEXT NOT NULL,
      name TEXT NOT NULL,
      target TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      truth_label TEXT DEFAULT 'REAL',
      capability_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evopulse_mesh_nodes (
      id TEXT PRIMARY KEY,
      node_name TEXT NOT NULL,
      node_type TEXT NOT NULL,
      status TEXT DEFAULT 'boundary',
      truth_label TEXT DEFAULT 'BLOCKED',
      boundary_code TEXT,
      last_seen_at DATETIME,
      capability_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rift_audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      truth_label TEXT NOT NULL,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function seedRiftGridBoundaries(db) {
  const seedNode = ({ id, nodeName, nodeType, boundaryCode, reason }) => {
    const exists = db.prepare('SELECT id FROM evopulse_mesh_nodes WHERE id = ?').get(id);
    if (exists) return;
    db.prepare(`
      INSERT INTO evopulse_mesh_nodes (
        id, node_name, node_type, status, truth_label, boundary_code, capability_json
      ) VALUES (?, ?, ?, 'boundary', 'BLOCKED', ?, ?)
    `).run(id, nodeName, nodeType, boundaryCode, JSON.stringify({ reason }));
  };

  seedNode({
    id: 'evo_wifi_boundary',
    nodeName: 'Evo local wireless boundary',
    nodeType: 'local_wireless',
    boundaryCode: 'NATIVE_WIFI_UNAVAILABLE',
    reason: 'The studio web console cannot create OS-level local wireless networks. Use a signed native runtime for that layer.',
  });

  seedNode({
    id: 'evo_nearby_boundary',
    nodeName: 'Evo nearby-device boundary',
    nodeType: 'nearby_device',
    boundaryCode: 'NATIVE_BLUETOOTH_UNAVAILABLE',
    reason: 'The studio web console cannot run unrestricted nearby-device mesh sessions. Use a mobile or desktop runtime with explicit permission.',
  });

  seedNode({
    id: 'evo_address_boundary',
    nodeName: 'Evo public address boundary',
    nodeType: 'address_gateway',
    boundaryCode: 'NATIVE_PUBLIC_IP_UNAVAILABLE',
    reason: 'External address allocation requires provider configuration. The studio can safely model routes and gateway contracts.',
  });
}

export function writeRiftAudit(db, { actorUserId = null, action, targetType = null, targetId = null, truthLabel = 'REAL', metadata = {} }) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO rift_audit_logs (id, actor_user_id, action, target_type, target_id, truth_label, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, actorUserId, action, targetType, targetId, truthLabel, JSON.stringify(metadata));
  return id;
}
