import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  analyzePatternSignals,
  createRiftSession,
  createTimelineBranch,
  endRiftSession,
  generateLocalEntity,
  getRiftGridStatus,
  getRuntimeBoundaries,
  listEntities,
  listEvoRoutes,
  listGridNodes,
  listPatterns,
  listRiftEvents,
  listRiftSessions,
  logRiftEvent,
  registerEvoRoute,
  registerGridNode,
} from './src/core/rift/riftRepository.js';
import { TRUTH_LABELS, blockedBoundary, RIFT_BOUNDARY_CODES } from './src/core/rift/riftTypes.js';

dotenv.config({ override: true });

const app = express();
const port = Number(process.env.RIFT_GRID_PORT || 3002);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function send(res, payload, status = 200) {
  return res.status(status).json(payload);
}

function requireObjectBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return send(res, blockedBoundary('INVALID_BODY', 'Request body must be a JSON object.'), 400);
  }
  return next();
}

app.get('/status', (_req, res) => send(res, getRiftGridStatus()));
app.get('/api/rift/status', (_req, res) => send(res, getRiftGridStatus()));
app.get('/api/rift/boundaries', (_req, res) => send(res, { truth_label: TRUTH_LABELS.REAL, data: { boundaries: getRuntimeBoundaries() } }));

app.get('/api/rift/sessions', (req, res) => send(res, { truth_label: TRUTH_LABELS.REAL, data: { sessions: listRiftSessions(req.query.limit || 25) } }));
app.post('/api/rift/sessions', requireObjectBody, (req, res) => send(res, { truth_label: TRUTH_LABELS.SIMULATED, data: { session: createRiftSession(req.body) } }, 201));
app.post('/api/rift/sessions/:id/end', (req, res) => send(res, { truth_label: TRUTH_LABELS.REAL, data: { session: endRiftSession(req.params.id) } }));
app.get('/api/rift/sessions/:id/events', (req, res) => send(res, { truth_label: TRUTH_LABELS.REAL, data: { events: listRiftEvents(req.params.id, req.query.limit || 100) } }));
app.post('/api/rift/sessions/:id/events', requireObjectBody, (req, res) => {
  const event = logRiftEvent({
    sessionId: req.params.id,
    eventType: req.body.eventType || 'studio.event',
    truthLabel: req.body.truthLabel || TRUTH_LABELS.REAL,
    payload: req.body.payload || {},
  });
  return send(res, { truth_label: event.truth_label, data: { event } }, 201);
});

app.get('/api/rift/patterns', (req, res) => send(res, { truth_label: TRUTH_LABELS.INFERRED, data: { patterns: listPatterns(req.query.limit || 50) } }));
app.post('/api/rift/patterns/analyze', requireObjectBody, (req, res) => send(res, analyzePatternSignals(req.body)));
app.post('/api/rift/timeline/branch', requireObjectBody, (req, res) => send(res, createTimelineBranch(req.body), 201));
app.get('/api/rift/entities', (req, res) => send(res, { truth_label: TRUTH_LABELS.GENERATED, data: { entities: listEntities(req.query.limit || 50) } }));
app.post('/api/rift/entities/local', requireObjectBody, (req, res) => send(res, generateLocalEntity(req.body), 201));

app.get('/api/evopulse/nodes', (req, res) => send(res, { truth_label: TRUTH_LABELS.REAL, data: { nodes: listGridNodes(req.query.limit || 50) } }));
app.post('/api/evopulse/nodes', requireObjectBody, (req, res) => send(res, registerGridNode(req.body), 201));
app.get('/api/evopulse/routes', (req, res) => send(res, { truth_label: TRUTH_LABELS.REAL, data: { routes: listEvoRoutes(req.query.limit || 50) } }));
app.post('/api/evopulse/routes', requireObjectBody, (req, res) => send(res, { truth_label: req.body.truthLabel || TRUTH_LABELS.SIMULATED, data: { route: registerEvoRoute(req.body) } }, 201));

app.post('/api/rift/ai/generate', requireObjectBody, (_req, res) => {
  return send(res, blockedBoundary(
    RIFT_BOUNDARY_CODES.AI_GATEWAY_BLOCKED,
    'External AI generation must be routed through the existing PH Evo cost firewall with configured provider keys, plan checks, and credit checks. This Rift Grid bridge records the boundary and does not expose frontend API keys.'
  ), 402);
});

app.post('/api/rift/native/wifi/host', (_req, res) => send(res, blockedBoundary(RIFT_BOUNDARY_CODES.NATIVE_WIFI_UNAVAILABLE, 'Native Wi-Fi hosting requires a trusted native device agent or mobile runtime. Browser/React studio code cannot create OS-level Wi-Fi networks.'), 501));
app.post('/api/rift/native/bluetooth/scan', (_req, res) => send(res, blockedBoundary(RIFT_BOUNDARY_CODES.NATIVE_BLUETOOTH_UNAVAILABLE, 'Native Bluetooth/BLE mesh requires a trusted native device agent or mobile runtime with user permission.'), 501));
app.post('/api/rift/native/ip/host', (_req, res) => send(res, blockedBoundary(RIFT_BOUNDARY_CODES.NATIVE_PUBLIC_IP_UNAVAILABLE, 'Public IP hosting requires real provider, gateway, or registry-backed infrastructure. EvoPrivateIP routes can be registered locally.'), 501));

app.use((err, _req, res, _next) => {
  console.error('[RiftGrid] unhandled error:', err);
  return send(res, blockedBoundary('UNHANDLED_RIFT_GRID_ERROR', err?.message || 'Unknown Rift Grid bridge error.'), 500);
});

app.listen(port, () => {
  console.log(`PH Evo Rift/Grid bridge listening on http://127.0.0.1:${port}`);
});
