import crypto from 'crypto';
import db from '../db/quad_schema.js';
import { ensureRiftGridSchema } from './riftSchema.js';
import { TRUTH_LABELS, RIFT_SESSION_STATUS, blockedBoundary, truthEnvelope, RIFT_BOUNDARY_CODES } from './riftTypes.js';

ensureRiftGridSchema(db);

const json = (value) => JSON.stringify(value ?? {});
const parseJson = (value, fallback = {}) => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};
const id = () => crypto.randomUUID();

export function getRuntimeBoundaries() {
  return [
    blockedBoundary(RIFT_BOUNDARY_CODES.NO_NATIVE_SENSOR_ACCESS, 'The React/Vite studio console cannot directly access mobile camera, GPS, microphone, motion, ARCore, ARKit, native Wi-Fi, or native Bluetooth hardware. Use the Flutter Rift Runtime or native device agent.'),
    blockedBoundary(RIFT_BOUNDARY_CODES.MOBILE_RUNTIME_NOT_CONNECTED, 'No authenticated Flutter Rift mobile runtime is connected to this local studio bridge yet.'),
    blockedBoundary(RIFT_BOUNDARY_CODES.FIREBASE_NOT_CONFIGURED, 'Firebase project credentials and mobile platform config files must be added by the owner before cloud sync is enabled.'),
  ];
}

export function getRiftGridStatus() {
  const sessions = db.prepare('SELECT COUNT(*) AS count FROM rift_sessions').get().count;
  const activeSessions = db.prepare("SELECT COUNT(*) AS count FROM rift_sessions WHERE status = 'active'").get().count;
  const routes = db.prepare('SELECT COUNT(*) AS count FROM evopulse_routes').get().count;
  const nodes = db.prepare('SELECT COUNT(*) AS count FROM evopulse_grid_nodes').get().count;
  const patterns = db.prepare('SELECT COUNT(*) AS count FROM rift_pattern_signals').get().count;
  return truthEnvelope({ label: TRUTH_LABELS.REAL, data: { runtime: 'PH Evo Studio local Rift/Grid console', sessions, activeSessions, routes, nodes, patterns, boundaries: getRuntimeBoundaries() } });
}

export function createRiftSession({ userId = 'studio-local-user', mode = 'evo-rift', evoName = 'local.rift.evo' } = {}) {
  const sessionId = id();
  const now = new Date().toISOString();
  const evoRoute = `evo://rift/session/${sessionId}`;
  db.prepare(`INSERT INTO rift_sessions (id, user_id, mode, status, truth_label, evo_route, evo_name, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .run(sessionId, userId, mode, RIFT_SESSION_STATUS.ACTIVE, TRUTH_LABELS.SIMULATED, evoRoute, evoName, now);
  logRiftEvent({ sessionId, eventType: 'session.started', truthLabel: TRUTH_LABELS.REAL, payload: { mode, evoRoute, source: 'studio-console' } });
  registerEvoRoute({ routeType: 'evo_url', routeValue: evoRoute, targetKind: 'rift_session', targetId: sessionId, truthLabel: TRUTH_LABELS.SIMULATED });
  return getRiftSession(sessionId);
}

export function endRiftSession(sessionId) {
  const existing = getRiftSession(sessionId);
  if (!existing) return blockedBoundary('SESSION_NOT_FOUND', `Rift session ${sessionId} was not found.`);
  db.prepare('UPDATE rift_sessions SET status = ?, ended_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(RIFT_SESSION_STATUS.ENDED, new Date().toISOString(), sessionId);
  logRiftEvent({ sessionId, eventType: 'session.ended', truthLabel: TRUTH_LABELS.REAL, payload: { source: 'studio-console' } });
  return getRiftSession(sessionId);
}

export function getRiftSession(sessionId) {
  const row = db.prepare('SELECT * FROM rift_sessions WHERE id = ?').get(sessionId);
  return row ? { ...row, truth_label: row.truth_label || TRUTH_LABELS.SIMULATED } : null;
}

export function listRiftSessions(limit = 25) {
  return db.prepare('SELECT * FROM rift_sessions ORDER BY created_at DESC LIMIT ?').all(Number(limit));
}

export function logRiftEvent({ sessionId, eventType, truthLabel = TRUTH_LABELS.REAL, payload = {} }) {
  const eventId = id();
  db.prepare('INSERT INTO rift_events (id, session_id, event_type, truth_label, payload_json) VALUES (?, ?, ?, ?, ?)')
    .run(eventId, sessionId, eventType, truthLabel, json(payload));
  return { id: eventId, session_id: sessionId, event_type: eventType, truth_label: truthLabel, payload };
}

export function listRiftEvents(sessionId, limit = 100) {
  return db.prepare('SELECT * FROM rift_events WHERE session_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(sessionId, Number(limit)).map((row) => ({ ...row, payload: parseJson(row.payload_json) }));
}

export function analyzePatternSignals({ userId = 'studio-local-user', signals = [] } = {}) {
  const normalized = Array.isArray(signals) ? signals.filter(Boolean).map(String) : [];
  const outputs = [];
  const now = new Date().toISOString();
  for (const value of normalized) {
    const source = value.includes(':') ? value.split(':')[0] : 'user_input';
    const cleanValue = value.slice(0, 220);
    const existing = db.prepare('SELECT * FROM rift_pattern_signals WHERE user_id = ? AND value = ?').get(userId, cleanValue);
    if (existing) {
      const frequency = Number(existing.frequency || 0) + 1;
      const confidence = Math.min(0.95, 0.2 + frequency * 0.12);
      db.prepare('UPDATE rift_pattern_signals SET frequency = ?, confidence = ?, last_seen_at = ? WHERE id = ?').run(frequency, confidence, now, existing.id);
      outputs.push({ ...existing, frequency, confidence, last_seen_at: now, truth_label: TRUTH_LABELS.INFERRED });
    } else {
      const patternId = id();
      db.prepare('INSERT INTO rift_pattern_signals (id, user_id, source, value, frequency, confidence, truth_label, first_seen_at, last_seen_at) VALUES (?, ?, ?, ?, 1, 0.2, ?, ?, ?)')
        .run(patternId, userId, source, cleanValue, TRUTH_LABELS.INFERRED, now, now);
      outputs.push({ id: patternId, user_id: userId, source, value: cleanValue, frequency: 1, confidence: 0.2, truth_label: TRUTH_LABELS.INFERRED });
    }
  }
  return truthEnvelope({ label: TRUTH_LABELS.INFERRED, data: { patterns: outputs, statement: 'Patterns are software inferences only.' } });
}

export function listPatterns(limit = 50) {
  return db.prepare('SELECT * FROM rift_pattern_signals ORDER BY last_seen_at DESC LIMIT ?').all(Number(limit));
}

export function createTimelineBranch({ userId = 'studio-local-user', sessionId = null, title, choice = 'alternate path', assumptions = [] }) {
  const branchId = id();
  const graph = { nodes: [{ id: 'origin', label: 'Known current path', truth_label: TRUTH_LABELS.REAL }, { id: 'choice', label: choice, truth_label: TRUTH_LABELS.SIMULATED }, { id: 'result', label: `Simulated result for ${choice}`, truth_label: TRUTH_LABELS.SIMULATED }], edges: [{ from: 'origin', to: 'choice' }, { from: 'choice', to: 'result' }], assumptions };
  db.prepare('INSERT INTO rift_timeline_branches (id, user_id, session_id, title, truth_label, branch_graph_json) VALUES (?, ?, ?, ?, ?, ?)')
    .run(branchId, userId, sessionId, title || 'Untitled Rift Branch', TRUTH_LABELS.SIMULATED, json(graph));
  return truthEnvelope({ label: TRUTH_LABELS.SIMULATED, data: { id: branchId, graph } });
}

export function generateLocalEntity({ userId = 'studio-local-user', sessionId = null, name = 'Evo Rift Guide', role = 'Guide', visualStyle = 'glitch-cybernetic' } = {}) {
  const entityId = id();
  const rules = { claims: ['Simulation-only guide.'], allowedActions: ['explain', 'guide', 'simulate', 'reflect'], blockedActions: ['identity misuse', 'unapproved capture'] };
  db.prepare('INSERT INTO rift_entities (id, user_id, session_id, name, role, visual_style, rules_json, memory_scope, trust_level, truth_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(entityId, userId, sessionId, name, role, visualStyle, json(rules), 'session', 'simulated', TRUTH_LABELS.GENERATED);
  return truthEnvelope({ label: TRUTH_LABELS.GENERATED, data: { id: entityId, name, role, visualStyle, rules } });
}

export function listEntities(limit = 50) {
  return db.prepare('SELECT * FROM rift_entities ORDER BY created_at DESC LIMIT ?').all(Number(limit)).map((row) => ({ ...row, rules: parseJson(row.rules_json, {}) }));
}

export function registerGridNode({ nodeName, nodeType, capabilities = [], status = 'configured', truthLabel = TRUTH_LABELS.SIMULATED, boundaries = [] }) {
  const nodeId = id();
  db.prepare('INSERT INTO evopulse_grid_nodes (id, node_name, node_type, status, truth_label, capabilities_json, boundary_json, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(nodeId, nodeName, nodeType, status, truthLabel, json(capabilities), json(boundaries), new Date().toISOString());
  return truthEnvelope({ label: truthLabel, data: { id: nodeId, nodeName, nodeType, capabilities, boundaries } });
}

export function registerEvoRoute({ routeType, routeValue, targetKind, targetId = null, truthLabel = TRUTH_LABELS.SIMULATED, metadata = {} }) {
  const routeId = id();
  db.prepare('INSERT INTO evopulse_routes (id, route_type, route_value, target_kind, target_id, truth_label, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(routeId, routeType, routeValue, targetKind, targetId, truthLabel, json(metadata));
  return { id: routeId, route_type: routeType, route_value: routeValue, target_kind: targetKind, target_id: targetId, truth_label: truthLabel, metadata };
}

export function listGridNodes(limit = 50) {
  return db.prepare('SELECT * FROM evopulse_grid_nodes ORDER BY created_at DESC LIMIT ?').all(Number(limit)).map((row) => ({ ...row, capabilities: parseJson(row.capabilities_json, []), boundaries: parseJson(row.boundary_json, []) }));
}

export function listEvoRoutes(limit = 50) {
  return db.prepare('SELECT * FROM evopulse_routes ORDER BY created_at DESC LIMIT ?').all(Number(limit)).map((row) => ({ ...row, metadata: parseJson(row.metadata_json, {}) }));
}
