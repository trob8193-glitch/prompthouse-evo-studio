/**
 * PromptHouse Evo Studio - PromptShell mobile backend routes.
 *
 * These endpoints back the Flutter PromptShell client with local durable state:
 * health, connector status, manifest generation, proof reads, and artifacts.
 */

import crypto from 'crypto';
import { executeConnectorProbe } from '../lib/connectors/externalConnectorExecutor.js';
import { createProviderReceipt } from '../server/services/provider-receipts.js';

const ok = (res, payload = {}) => res.json({ success: true, ...payload });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error?.message || String(error) });

const EVO_BRAND = {
  name: 'PromptHouse Evo Studio',
  runtime: 'PromptShell Evo Runtime',
  signature: 'Manifest -> Connector -> Proof -> Artifact',
  tagline: 'Proof-native builds across Flutter, Python, PromptBridge, and external connectors.',
  palette: {
    void: '#050712',
    pulse: '#18F27A',
    forge: '#38BDF8',
    proof: '#F8D66D',
  },
  badges: ['Evo Native Runtime', 'PromptBridge Powered', 'Proof-Gated'],
};

const LIVE_CORE_KEYS = [
  { name: 'JWT Secret', envKey: 'JWT_SECRET' },
  { name: 'PromptHouse Master Key', envKey: 'PH_EVO_MASTER_KEY' },
];

const LIVE_REQUIRED_PROVIDERS = [
  { name: 'OpenAI', envKey: 'OPENAI_API_KEY', capability: 'agent execution and model-backed manifest work' },
  { name: 'Stripe', envKey: 'STRIPE_SECRET_KEY', capability: 'checkout and commerce proof' },
  { name: 'Vercel', envKey: 'VERCEL_TOKEN', capability: 'online preview/deployment proof' },
];

const LIVE_OPTIONAL_PROVIDERS = [
  { name: 'GitHub', envKey: 'GITHUB_TOKEN', capability: 'repository connector probes' },
  { name: 'Gemini', envKey: 'GEMINI_API_KEY', capability: 'secondary model provider coverage' },
];

function hasDatabase(db) {
  return Boolean(db?.prepare && db?.exec);
}

function tableColumns(db, tableName) {
  if (!hasDatabase(db)) return new Set();
  try {
    return new Set(db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name));
  } catch {
    return new Set();
  }
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  const columns = tableColumns(db, tableName);
  if (columns.has(columnName)) return;
  try {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  } catch {
    // Existing databases may already have an equivalent column shape.
  }
}

export function ensurePromptShellSchema(db) {
  if (!hasDatabase(db)) return false;

  db.exec(`
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

    CREATE TABLE IF NOT EXISTS handshakes (
      id TEXT PRIMARY KEY,
      connector_id TEXT NOT NULL,
      status TEXT NOT NULL,
      result TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS manifests (
      id TEXT PRIMARY KEY,
      workspace_id TEXT,
      project_id TEXT,
      seed_intent TEXT NOT NULL,
      manifest_json TEXT,
      readiness_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensurePromptShellColumns(db);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_promptshell_ledger_action ON sovereign_ledger(action);
    CREATE INDEX IF NOT EXISTS idx_promptshell_ledger_truth_state ON sovereign_ledger(truth_state);
    CREATE INDEX IF NOT EXISTS idx_promptshell_connectors_status ON connectors(status);
    CREATE INDEX IF NOT EXISTS idx_promptshell_handshakes_connector ON handshakes(connector_id);
    CREATE INDEX IF NOT EXISTS idx_promptshell_manifests_project ON manifests(workspace_id, project_id);
    CREATE INDEX IF NOT EXISTS idx_promptshell_manifests_created ON manifests(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_promptshell_artifacts_type ON artifacts(type);
    CREATE INDEX IF NOT EXISTS idx_promptshell_artifacts_created ON artifacts(created_at DESC);
  `);

  seedConnectors(db);

  return true;
}

function ensurePromptShellColumns(db) {
  addColumnIfMissing(db, 'sovereign_ledger', 'metadata', 'TEXT');
  addColumnIfMissing(db, 'sovereign_ledger', 'created_at', 'DATETIME');

  addColumnIfMissing(db, 'connectors', 'id', 'TEXT');
  addColumnIfMissing(db, 'connectors', 'name', 'TEXT');
  addColumnIfMissing(db, 'connectors', 'connector_id', 'TEXT');
  addColumnIfMissing(db, 'connectors', 'type', 'TEXT');
  addColumnIfMissing(db, 'connectors', 'risk_level', 'TEXT');
  addColumnIfMissing(db, 'connectors', 'status', 'TEXT');
  addColumnIfMissing(db, 'connectors', 'config', 'TEXT');
  addColumnIfMissing(db, 'connectors', 'created_at', 'DATETIME');

  addColumnIfMissing(db, 'handshakes', 'id', 'TEXT');
  addColumnIfMissing(db, 'handshakes', 'connector_id', 'TEXT');
  addColumnIfMissing(db, 'handshakes', 'status', 'TEXT');
  addColumnIfMissing(db, 'handshakes', 'result', 'TEXT');
  addColumnIfMissing(db, 'handshakes', 'timestamp', 'DATETIME');

  addColumnIfMissing(db, 'manifests', 'id', 'TEXT');
  addColumnIfMissing(db, 'manifests', 'workspace_id', 'TEXT');
  addColumnIfMissing(db, 'manifests', 'project_id', 'TEXT');
  addColumnIfMissing(db, 'manifests', 'seed_intent', 'TEXT');
  addColumnIfMissing(db, 'manifests', 'manifest_json', 'TEXT');
  addColumnIfMissing(db, 'manifests', 'readiness_score', 'INTEGER');
  addColumnIfMissing(db, 'manifests', 'created_at', 'DATETIME');

  addColumnIfMissing(db, 'artifacts', 'id', 'TEXT');
  addColumnIfMissing(db, 'artifacts', 'name', 'TEXT');
  addColumnIfMissing(db, 'artifacts', 'type', 'TEXT');
  addColumnIfMissing(db, 'artifacts', 'content', 'TEXT');
  addColumnIfMissing(db, 'artifacts', 'metadata', 'TEXT');
  addColumnIfMissing(db, 'artifacts', 'created_at', 'DATETIME');
  addColumnIfMissing(db, 'artifacts', 'updated_at', 'DATETIME');

  backfillPromptShellColumns(db);
}

function backfillPromptShellColumns(db) {
  const connectorColumns = tableColumns(db, 'connectors');
  if (connectorColumns.has('id') && connectorColumns.has('connector_id')) {
    db.prepare(`
      UPDATE connectors
      SET id = connector_id
      WHERE (id IS NULL OR id = '') AND connector_id IS NOT NULL AND connector_id != ''
    `).run();
  }
  if (connectorColumns.has('name')) {
    db.prepare(`
      UPDATE connectors
      SET name = COALESCE(NULLIF(name, ''), NULLIF(type, ''), NULLIF(connector_id, ''), NULLIF(id, ''), 'Connector')
      WHERE name IS NULL OR name = ''
    `).run();
  }
  if (connectorColumns.has('created_at')) {
    db.prepare(`
      UPDATE connectors
      SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
      WHERE created_at IS NULL OR created_at = ''
    `).run();
  }
  if (connectorColumns.has('config') && connectorColumns.has('manifest_json')) {
    db.prepare(`
      UPDATE connectors
      SET config = manifest_json
      WHERE (config IS NULL OR config = '') AND manifest_json IS NOT NULL AND manifest_json != ''
    `).run();
  }

  const artifactColumns = tableColumns(db, 'artifacts');
  if (artifactColumns.has('name') && artifactColumns.has('title')) {
    db.prepare(`
      UPDATE artifacts
      SET name = title
      WHERE (name IS NULL OR name = '') AND title IS NOT NULL AND title != ''
    `).run();
  }
  if (artifactColumns.has('content') && artifactColumns.has('body')) {
    db.prepare(`
      UPDATE artifacts
      SET content = body
      WHERE (content IS NULL OR content = '') AND body IS NOT NULL AND body != ''
    `).run();
  }
  if (artifactColumns.has('created_at')) {
    db.prepare(`
      UPDATE artifacts
      SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
      WHERE created_at IS NULL OR created_at = ''
    `).run();
  }
  if (artifactColumns.has('updated_at')) {
    db.prepare(`
      UPDATE artifacts
      SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
      WHERE updated_at IS NULL OR updated_at = ''
    `).run();
  }

  const ledgerColumns = tableColumns(db, 'sovereign_ledger');
  if (ledgerColumns.has('created_at') && ledgerColumns.has('timestamp')) {
    db.prepare(`
      UPDATE sovereign_ledger
      SET created_at = timestamp
      WHERE (created_at IS NULL OR created_at = '') AND timestamp IS NOT NULL AND timestamp != ''
    `).run();
  }
}

function seedConnectors(db) {
  const columns = tableColumns(db, 'connectors');
  const find = db.prepare(`
    SELECT rowid
    FROM connectors
    WHERE id = ? OR connector_id = ? OR type = ?
    LIMIT 1
  `);
  const insertColumns = ['id', 'name', 'connector_id', 'type', 'risk_level', 'status', 'config', 'created_at'];
  if (columns.has('manifest_json')) insertColumns.push('manifest_json');
  const bindMarks = insertColumns.map(() => '?').join(', ');
  const insert = db.prepare(`
    INSERT INTO connectors (${insertColumns.join(', ')})
    VALUES (${bindMarks})
  `);
  const updateAssignments = [
    'id = COALESCE(NULLIF(id, \'\'), ?)',
    'name = ?',
    'connector_id = COALESCE(NULLIF(connector_id, \'\'), ?)',
    'type = COALESCE(NULLIF(type, \'\'), ?)',
    'risk_level = ?',
    'status = ?',
    'config = COALESCE(NULLIF(config, \'\'), ?)',
    'created_at = COALESCE(created_at, ?)',
  ];
  if (columns.has('manifest_json')) {
    updateAssignments.push('manifest_json = COALESCE(NULLIF(manifest_json, \'\'), ?)');
  }
  const update = db.prepare(`
    UPDATE connectors
    SET ${updateAssignments.join(', ')}
    WHERE rowid = ?
  `);

  for (const connector of localConnectorSeeds()) {
    const now = new Date().toISOString();
    const config = JSON.stringify(connector.config || {});
    const legacyManifest = JSON.stringify({
      connectorId: connector.connectorId,
      name: connector.name,
      type: connector.type,
      riskLevel: connector.riskLevel,
      config: connector.config || {},
    });
    const existing = find.get(connector.id, connector.connectorId, connector.type);
    if (existing?.rowid) {
      const updateValues = [
        connector.id,
        connector.name,
        connector.connectorId,
        connector.type,
        connector.riskLevel,
        connector.status,
        config,
        now,
      ];
      if (columns.has('manifest_json')) updateValues.push(legacyManifest);
      updateValues.push(existing.rowid);
      update.run(...updateValues);
      continue;
    }

    const insertValues = [
      connector.id,
      connector.name,
      connector.connectorId,
      connector.type,
      connector.riskLevel,
      connector.status,
      config,
      now,
    ];
    if (columns.has('manifest_json')) insertValues.push(legacyManifest);
    insert.run(...insertValues);
  }
}

export function registerPromptShellRoutes(app, { db, evoAgent, connectorExecutor = executeConnectorProbe } = {}) {
  const databaseReady = ensurePromptShellSchema(db);

  app.get('/api/promptshell/health', (req, res) => {
    ok(res, {
      status: 'ready',
      service: 'PromptShell Backend',
      brand: EVO_BRAND,
      timestamp: new Date().toISOString(),
      bridge: 'PromptBridge',
      database: databaseReady ? 'ready' : 'unavailable',
      agent: evoAgent?.chat ? 'available' : 'local_manifest_generator',
      capabilitiesPath: '/api/promptshell/evo-capabilities',
      liveReadinessPath: '/api/promptshell/live-readiness',
      uptime: process.uptime(),
    });
  });

  app.get('/api/promptshell/evo-capabilities', (req, res) => {
    ok(res, { capabilities: buildEvoRuntimeCapabilities({ databaseReady, evoAgent }) });
  });

  app.get('/api/promptshell/live-readiness', (req, res) => {
    const requestBaseUrl = req.get('host') ? `${req.protocol}://${req.get('host')}/api/promptshell` : '';
    ok(res, { readiness: buildPromptShellLiveReadiness({ databaseReady, evoAgent, requestBaseUrl }) });
  });

  app.get('/api/promptshell/connectors', (req, res) => {
    try {
      const connectors = listPromptShellConnectors(db);
      ok(res, { count: connectors.length, connectors });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/promptshell/connectors/:connectorId/handshake', async (req, res) => {
    try {
      const connector = resolvePromptShellConnector(db, req.params.connectorId);
      if (!connector) {
        return fail(res, `Unknown connector: ${req.params.connectorId}`, 404);
      }

      const now = new Date().toISOString();
      const mode = normalizeConnectorMode(req.body?.mode);
      const handshake = await connectorExecutor(connector, {
        id: `hs_${crypto.randomUUID().slice(0, 12)}`,
        mode,
        ownerApproval: req.body?.ownerApproval,
        ownerApprovals: req.body?.ownerApprovals,
        receiptSink: mode === 'live' && req.body?.writeReceipt !== false ? createProviderReceipt : null,
      });

      if (hasDatabase(db)) {
        db.prepare(`
          INSERT INTO handshakes (id, connector_id, status, result, timestamp)
          VALUES (?, ?, ?, ?, ?)
        `).run(handshake.id, connector.connectorId, handshake.status, JSON.stringify(handshake), now);
      }

      ok(res, { handshake });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/promptshell/connectors/:connectorId/probe', async (req, res) => {
    try {
      const connector = resolvePromptShellConnector(db, req.params.connectorId);
      if (!connector) {
        return fail(res, `Unknown connector: ${req.params.connectorId}`, 404);
      }

      const now = new Date().toISOString();
      const probe = await connectorExecutor(connector, {
        id: `probe_${crypto.randomUUID().slice(0, 12)}`,
        mode: 'live',
        ownerApproval: req.body?.ownerApproval,
        ownerApprovals: req.body?.ownerApprovals,
        receiptSink: req.body?.writeReceipt === false ? null : createProviderReceipt,
      });

      if (hasDatabase(db)) {
        db.prepare(`
          INSERT INTO handshakes (id, connector_id, status, result, timestamp)
          VALUES (?, ?, ?, ?, ?)
        `).run(probe.id, connector.connectorId, probe.status, JSON.stringify(probe), now);
      }

      ok(res, { probe });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/promptshell/manifest/run', async (req, res) => {
    const { seedIntent, workspaceId = 'local-workspace', projectId = 'local-project' } = req.body || {};

    if (!seedIntent || typeof seedIntent !== 'string' || seedIntent.trim().length === 0) {
      return fail(res, 'seedIntent is required and must be non-empty', 400);
    }

    try {
      const manifest = await buildManifest(seedIntent.trim(), evoAgent);
      const manifestId = `mf_${crypto.randomUUID().slice(0, 12)}`;
      const now = new Date().toISOString();

      if (hasDatabase(db)) {
        db.prepare(`
          INSERT INTO manifests (id, workspace_id, project_id, seed_intent, manifest_json, readiness_score, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          manifestId,
          workspaceId,
          projectId,
          seedIntent.trim(),
          JSON.stringify(manifest),
          Number(manifest.readiness_score || 0),
          now
        );
      }

      ok(res, { manifestId, manifest, timestamp: now });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/promptshell/manifests', (req, res) => {
    try {
      ok(res, { manifests: listManifests(db) });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/promptshell/proof-cards', (req, res) => {
    try {
      const proofCards = listProofCards(db);
      ok(res, { count: proofCards.length, proofCards });
    } catch (error) {
      fail(res, error);
    }
  });

  app.get('/api/promptshell/artifacts', (req, res) => {
    try {
      const artifacts = listArtifacts(db);
      ok(res, { count: artifacts.length, artifacts });
    } catch (error) {
      fail(res, error);
    }
  });

  app.post('/api/promptshell/artifacts', (req, res) => {
    const { name, type, content, metadata = {} } = req.body || {};
    if (!name || !type || content === undefined) {
      return fail(res, 'name, type, and content are required', 400);
    }

    try {
      const now = new Date().toISOString();
      const artifact = {
        id: `art_${crypto.randomUUID().slice(0, 12)}`,
        name,
        type,
        content,
        metadata,
        created_at: now,
      };

      if (hasDatabase(db)) {
        db.prepare(`
          INSERT INTO artifacts (id, name, type, content, metadata, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          artifact.id,
          artifact.name,
          artifact.type,
          encodeJsonField(artifact.content),
          JSON.stringify(metadata || {}),
          now,
          now
        );
      }

      ok(res, { artifact });
    } catch (error) {
      fail(res, error);
    }
  });

  console.log('PromptShell routes registered: /api/promptshell/*');
}

export function buildEvoRuntimeCapabilities({ databaseReady = false, evoAgent } = {}) {
  const providerKeys = ['OPENAI_API_KEY', 'GITHUB_TOKEN', 'STRIPE_SECRET_KEY', 'VERCEL_TOKEN'];
  const configuredProviders = providerKeys.filter((key) => Boolean(process.env[key]));
  const liveReadiness = buildPromptShellLiveReadiness({ databaseReady, evoAgent });

  return {
    brand: EVO_BRAND,
    truthState: 'LOCAL_EVO_RUNTIME_READY',
    surfaces: [
      'Studio',
      'Flutter PromptShell',
      'Python PromptEnds',
      'PromptBridge API',
      'PromptLink connectors',
      'Proof ledger',
      'Artifact vault',
    ],
    runtime: {
      bridge: 'PromptBridge',
      database: databaseReady ? 'ready' : 'unavailable',
      agent: evoAgent?.chat ? 'available' : 'local_manifest_generator',
      configuredProviders,
      providerMode: configuredProviders.length ? 'partially_configured' : 'local_contracts_only',
      liveReadinessPath: '/api/promptshell/live-readiness',
    },
    flutter: {
      truthState: 'FLUTTER_CLIENT_CONTRACT_READY',
      capabilities: [
        'Evo-branded PromptShell command deck',
        'Manifest-to-proof generation over PromptBridge',
        'PromptLink connector health and handshake actions',
        'Proof ledger viewer',
        'Artifact vault viewer',
        'Runtime base URL override with PROMPTENDS_BASE_URL',
      ],
      proofCommands: ['flutter test', 'npm test -- tests/agent-promptshell-execution.test.js'],
      blocked: ['Device/emulator runtime is not proven until flutter run targets a live bridge.'],
    },
    python: {
      truthState: 'PYTHON_PROMPTLINK_BACKEND_READY',
      capabilities: [
        'FastAPI PromptEnds backend',
        'PromptLink connector registry',
        'Handshake and invoke policy gates',
        'SQLite audit, proof, and artifact persistence',
        'Manifest-to-proof artifact chain',
      ],
      proofCommands: [
        'python -m pytest tests/test_real_logic.py',
        'python -m pytest generated_apps/real_execution_buildkit/promptends_promptlink_backend/tests/test_real_logic.py',
      ],
      blocked: ['Production deployment and live provider secrets remain gated by external credentials and proofs.'],
    },
    proofRail: [
      { step: 'manifest', route: '/api/promptshell/manifest/run', truthState: 'BUILT' },
      { step: 'connector', route: '/api/promptshell/connectors/:connectorId/handshake', truthState: 'LOCAL_READY' },
      { step: 'proof', route: '/api/promptshell/proof-cards', truthState: 'READABLE' },
      { step: 'artifact', route: '/api/promptshell/artifacts', truthState: 'PERSISTED' },
    ],
    liveReadiness,
  };
}

export function buildPromptShellLiveReadiness({ databaseReady = false, evoAgent, requestBaseUrl = '' } = {}) {
  const bridgeBaseUrl = process.env.PROMPTENDS_BASE_URL ||
    process.env.VITE_PROMPTENDS_BASE_URL ||
    requestBaseUrl ||
    'http://localhost:3001/api/promptshell';
  const core = LIVE_CORE_KEYS.map(redactedEnvStatus);
  const providers = LIVE_REQUIRED_PROVIDERS.map(redactedEnvStatus);
  const optionalProviders = LIVE_OPTIONAL_PROVIDERS.map(redactedEnvStatus);
  const coreBlockers = core.filter((item) => !item.configured).map((item) => `Missing core credential: ${item.envKey}`);
  const providerBlockers = providers.filter((item) => !item.configured).map((item) => `Missing live provider credential: ${item.envKey}`);
  const deviceIdConfigured = Boolean(process.env.PROMPTSHELL_DEVICE_ID || process.env.FLUTTER_DEVICE_ID);
  const deviceProofConfigured = Boolean(process.env.PROMPTSHELL_DEVICE_PROOF || process.env.FLUTTER_DEVICE_PROOF);
  const bridgeRouteActive = Boolean(requestBaseUrl);
  const blockers = [
    ...coreBlockers,
    ...providerBlockers,
    ...(databaseReady ? [] : ['PromptShell database is unavailable.']),
    ...(deviceProofConfigured ? [] : ['Device runtime proof missing: run Flutter against a real browser/device and record the receipt.']),
  ];

  const warnings = [
    ...optionalProviders.filter((item) => !item.configured).map((item) => `Optional provider not configured: ${item.envKey}`),
    ...(bridgeRouteActive ? [] : ['Bridge route was not request-proven in this payload; call /api/promptshell/live-readiness from the running bridge.']),
  ];

  return {
    truthState: blockers.length ? 'LIVE_BLOCKED' : 'LIVE_READY',
    brand: EVO_BRAND,
    bridge: {
      truthState: bridgeRouteActive ? 'LIVE_BRIDGE_ROUTE_ACTIVE' : 'BRIDGE_URL_DECLARED',
      baseUrl: bridgeBaseUrl,
      healthUrl: `${bridgeBaseUrl}/health`,
      capabilitiesUrl: `${bridgeBaseUrl}/evo-capabilities`,
      liveReadinessUrl: `${bridgeBaseUrl}/live-readiness`,
      agent: evoAgent?.chat ? 'available' : 'local_manifest_generator',
      database: databaseReady ? 'ready' : 'unavailable',
    },
    core,
    providers,
    optionalProviders,
    device: {
      truthState: deviceProofConfigured ? 'DEVICE_RUNTIME_PROVEN' : 'DEVICE_RUNTIME_PROOF_REQUIRED',
      deviceId: deviceIdConfigured ? 'configured' : '',
      proofConfigured: deviceProofConfigured,
      proofCommands: [
        'flutter devices',
        `flutter run -d chrome --dart-define=PROMPTENDS_BASE_URL=${bridgeBaseUrl}`,
        `curl ${bridgeBaseUrl}/health`,
        `curl ${bridgeBaseUrl}/live-readiness`,
      ],
      proofEnv: ['PROMPTSHELL_DEVICE_ID or FLUTTER_DEVICE_ID', 'PROMPTSHELL_DEVICE_PROOF or FLUTTER_DEVICE_PROOF'],
    },
    blockers,
    warnings,
    nextActions: blockers.length ? blockers : ['Run live provider probes and archive provider/device receipts.'],
  };
}

function redactedEnvStatus(item) {
  return {
    ...item,
    configured: Boolean(process.env[item.envKey]),
    value: process.env[item.envKey] ? 'configured' : '',
  };
}

async function buildManifest(seedIntent, evoAgent) {
  if (evoAgent?.chat) {
    try {
      const response = await evoAgent.chat(
        [
          'Generate a PromptHouse project manifest as JSON only.',
          'Required keys: name, description, features, architecture, required_connectors, readiness_score, estimated_hours.',
          `Intent: ${seedIntent}`,
        ].join('\n')
      );
      const match = String(response).match(/\{[\s\S]*\}/);
      if (match) {
        return normalizeManifest(JSON.parse(match[0]), seedIntent, 'AGENT_GENERATED');
      }
    } catch {
      // The local generator keeps the endpoint useful when the provider is gated.
    }
  }

  return normalizeManifest({
    name: inferManifestName(seedIntent),
    description: seedIntent,
    features: inferFeatures(seedIntent),
    architecture: 'PromptShell mobile client plus PromptBridge API with durable proof and artifact records.',
    required_connectors: ['github', 'openai'],
    readiness_score: 65,
    estimated_hours: 24,
  }, seedIntent, 'LOCAL_DETERMINISTIC');
}

function normalizeManifest(manifest, seedIntent, truthState) {
  return {
    name: String(manifest.name || inferManifestName(seedIntent)).slice(0, 120),
    description: String(manifest.description || seedIntent).slice(0, 2000),
    features: Array.isArray(manifest.features) && manifest.features.length ? manifest.features.map(String).slice(0, 12) : inferFeatures(seedIntent),
    architecture: String(manifest.architecture || 'PromptBridge API with persisted records.').slice(0, 2000),
    required_connectors: Array.isArray(manifest.required_connectors) ? manifest.required_connectors.map(String).slice(0, 8) : ['github', 'openai'],
    readiness_score: Math.max(0, Math.min(100, Number(manifest.readiness_score || 0))),
    estimated_hours: Math.max(1, Number(manifest.estimated_hours || 24)),
    truthState,
  };
}

function inferManifestName(seedIntent) {
  const words = seedIntent.replace(/[^a-zA-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 5);
  return words.length ? words.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ') : 'PromptShell Project';
}

function inferFeatures(seedIntent) {
  const base = ['PromptBridge API contract', 'Flutter screen state', 'Proof ledger record'];
  if (/chat|message|agent/i.test(seedIntent)) base.push('Agent conversation flow');
  if (/payment|checkout|stripe/i.test(seedIntent)) base.push('Provider-gated checkout workflow');
  if (/deploy|vercel|release/i.test(seedIntent)) base.push('Deployment proof gate');
  return base;
}

function normalizeConnectorMode(mode) {
  return mode === 'live' ? 'live' : 'local';
}

export function listPromptShellConnectors(db) {
  if (!hasDatabase(db)) return localConnectorSeeds();
  const rows = db.prepare('SELECT * FROM connectors ORDER BY name ASC').all();
  return rows.map(normalizeConnector);
}

export function resolvePromptShellConnector(db, connectorId) {
  const normalized = String(connectorId || '').trim();
  if (!normalized) return null;

  const connectors = listPromptShellConnectors(db);
  return connectors.find((connector) => {
    return connector.id === normalized ||
      connector.connectorId === normalized ||
      connector.type === normalized ||
      connector.name.toLowerCase() === normalized.toLowerCase();
  }) || null;
}

function listManifests(db) {
  if (!hasDatabase(db)) return [];
  return db.prepare('SELECT * FROM manifests ORDER BY created_at DESC LIMIT 50').all().map((row) => ({
    ...row,
    manifest: parseJsonField(row.manifest_json),
  }));
}

function listProofCards(db) {
  if (!hasDatabase(db)) return [];
  const columns = tableColumns(db, 'sovereign_ledger');
  const timeColumn = columns.has('created_at') ? 'created_at' : columns.has('timestamp') ? 'timestamp' : null;
  const selectedTime = timeColumn ? `${timeColumn} AS created_at` : 'CURRENT_TIMESTAMP AS created_at';
  const order = timeColumn ? `ORDER BY ${timeColumn} DESC` : '';
  return db.prepare(`
    SELECT id, feature_id, action, proof_hash, truth_state, iq_gain, ${selectedTime}
    FROM sovereign_ledger
    ${order}
    LIMIT 100
  `).all();
}

function listArtifacts(db) {
  if (!hasDatabase(db)) return [];
  return db.prepare('SELECT * FROM artifacts ORDER BY created_at DESC LIMIT 50').all().map((row) => ({
    ...row,
    content: parseJsonField(row.content),
    metadata: parseJsonField(row.metadata),
  }));
}

function normalizeConnector(row) {
  const manifest = parseJsonField(row.manifest_json);
  const connectorId = row.connector_id || row.connectorId || manifest?.connectorId || row.id;
  return {
    id: row.id || connectorId,
    name: row.name || manifest?.name || connectorId || 'Connector',
    connectorId,
    type: row.type || manifest?.type || connectorId,
    riskLevel: row.risk_level || row.riskLevel || manifest?.riskLevel,
    status: row.status || 'disconnected',
    config: parseJsonField(row.config) || manifest?.config || null,
    createdAt: row.created_at || row.createdAt,
  };
}

function localConnectorSeeds() {
  return [
    {
      id: 'conn_github',
      name: 'GitHub',
      connectorId: 'github-1',
      type: 'github',
      riskLevel: 'LOW',
      status: process.env.GITHUB_TOKEN ? 'configured' : 'connected',
      config: { localContract: true },
    },
    {
      id: 'conn_openai',
      name: 'OpenAI',
      connectorId: 'openai-1',
      type: 'openai',
      riskLevel: 'HIGH',
      status: process.env.OPENAI_API_KEY ? 'configured' : 'needs_credentials',
      config: { providerKey: 'OPENAI_API_KEY' },
    },
    {
      id: 'conn_stripe',
      name: 'Stripe',
      connectorId: 'stripe-1',
      type: 'stripe',
      riskLevel: 'MEDIUM',
      status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'needs_credentials',
      config: { providerKey: 'STRIPE_SECRET_KEY' },
    },
    {
      id: 'conn_vercel',
      name: 'Vercel',
      connectorId: 'vercel-1',
      type: 'vercel',
      riskLevel: 'MEDIUM',
      status: process.env.VERCEL_TOKEN ? 'configured' : 'needs_credentials',
      config: { providerKey: 'VERCEL_TOKEN' },
    },
  ];
}

function encodeJsonField(value) {
  return typeof value === 'string' ? value : JSON.stringify(value ?? null);
}

function parseJsonField(value) {
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default registerPromptShellRoutes;
