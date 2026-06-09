import express from 'express';
import Database from '@libsql/sqlite3';
import { afterEach, describe, expect, it } from 'vitest';

import { setupAgentRoutes } from '../agent-integration.js';
import {
  buildPromptShellLiveReadiness,
  ensurePromptShellSchema,
  registerPromptShellRoutes,
} from '../generated_apis/promptshell_routes.js';
import { registerExternalConnectorRoutes } from '../generated_apis/external_connector_routes.js';
import { RealExecutionPipeline } from '../lib/execution/pipeline.js';

const openServers = [];
const openDbs = [];

function createFakeAgent() {
  return {
    agentId: 'agent_test',
    threadId: 'thread_test',
    conversationHistory: [],
    async chat(message) {
      this.conversationHistory.push({ user: message, assistant: 'agent response' });
      return JSON.stringify({
        name: 'Agent Built Project',
        description: 'Generated from test intent',
        features: ['Agent route', 'PromptShell route'],
        architecture: 'PromptBridge API and Flutter client',
        required_connectors: ['github'],
        readiness_score: 82,
        estimated_hours: 12,
      });
    },
    getHistory() {
      return this.conversationHistory;
    },
  };
}

function createConnectorExecutor(result = {}) {
  return async (connector, options = {}) => ({
    id: options.id || 'probe_test',
    connectorId: connector.connector_id || connector.connectorId,
    connectorName: connector.name,
    provider: connector.type,
    mode: options.mode || 'local',
    status: 'connected',
    truthState: options.mode === 'live' ? 'PROVEN' : 'LOCAL_ONLY',
    authenticated: options.mode === 'live',
    timestamp: new Date().toISOString(),
    ...result,
  });
}

function createApp() {
  const app = express();
  app.use(express.json());
  return app;
}

async function listen(app) {
  const server = await new Promise((resolve) => {
    const started = app.listen(0, '127.0.0.1', () => resolve(started));
  });
  openServers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

afterEach(() => {
  while (openServers.length) {
    openServers.pop().close();
  }
  while (openDbs.length) {
    openDbs.pop().close();
  }
  vi.unstubAllEnvs();
});

describe('phase 1 agent integration routes', () => {
  it('registers health, chat, thread, history, and reset endpoints', async () => {
    const fakeAgent = createFakeAgent();
    const app = createApp();
    setupAgentRoutes(app, { agentFactory: () => fakeAgent });
    const baseUrl = await listen(app);

    const health = await fetch(`${baseUrl}/api/agent/health`).then((res) => res.json());
    expect(health.status).toBe('ready');
    expect(health.agentId).toBe('agent_test');

    const chat = await fetch(`${baseUrl}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Build the mobile shell' }),
    }).then((res) => res.json());
    expect(chat.success).toBe(true);
    expect(chat.response).toContain('Agent Built Project');

    const history = await fetch(`${baseUrl}/api/agent/history`).then((res) => res.json());
    expect(history.total).toBe(1);

    const reset = await fetch(`${baseUrl}/api/agent/reset`, { method: 'POST' }).then((res) => res.json());
    expect(reset.success).toBe(true);
  });
});

describe('phase 2 PromptShell backend APIs', () => {
  it('serves health, connectors, manifests, proof cards, and artifacts from durable local tables', async () => {
    const db = new Database(':memory:');
    openDbs.push(db);
    const app = createApp();
    registerPromptShellRoutes(app, { db, evoAgent: createFakeAgent(), connectorExecutor: createConnectorExecutor() });
    const baseUrl = await listen(app);

    const health = await fetch(`${baseUrl}/api/promptshell/health`).then((res) => res.json());
    expect(health.status).toBe('ready');
    expect(health.database).toBe('ready');
    expect(health.brand.name).toBe('PromptHouse Evo Studio');

    const capabilities = await fetch(`${baseUrl}/api/promptshell/evo-capabilities`).then((res) => res.json());
    expect(capabilities.success).toBe(true);
    expect(capabilities.capabilities.truthState).toBe('LOCAL_EVO_RUNTIME_READY');
    expect(capabilities.capabilities.flutter.truthState).toBe('FLUTTER_CLIENT_CONTRACT_READY');
    expect(capabilities.capabilities.python.capabilities).toContain('Manifest-to-proof artifact chain');

    const liveReadiness = await fetch(`${baseUrl}/api/promptshell/live-readiness`).then((res) => res.json());
    expect(liveReadiness.success).toBe(true);
    expect(liveReadiness.readiness.truthState).toBe('LIVE_BLOCKED');
    expect(liveReadiness.readiness.bridge.healthUrl).toBe(`${baseUrl}/api/promptshell/health`);
    expect(liveReadiness.readiness.blockers).toContain(
      'Device runtime proof missing: run Flutter against a real browser/device and record the receipt.'
    );

    const connectors = await fetch(`${baseUrl}/api/promptshell/connectors`).then((res) => res.json());
    expect(connectors.count).toBeGreaterThanOrEqual(3);
    expect(connectors.connectors.some((connector) => connector.connectorId === 'github-1')).toBe(true);

    const handshake = await fetch(`${baseUrl}/api/promptshell/connectors/github-1/handshake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }).then((res) => res.json());
    expect(handshake.handshake.status).toBe('connected');

    const manifest = await fetch(`${baseUrl}/api/promptshell/manifest/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seedIntent: 'Build a proof-backed chat shell' }),
    }).then((res) => res.json());
    expect(manifest.success).toBe(true);
    expect(manifest.manifest.name).toBe('Agent Built Project');

    const artifact = await fetch(`${baseUrl}/api/promptshell/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Route Receipt', type: 'json', content: { ok: true } }),
    }).then((res) => res.json());
    expect(artifact.artifact.id).toMatch(/^art_/);

    const artifacts = await fetch(`${baseUrl}/api/promptshell/artifacts`).then((res) => res.json());
    expect(artifacts.artifacts).toHaveLength(1);

    const proofCards = await fetch(`${baseUrl}/api/promptshell/proof-cards`).then((res) => res.json());
    expect(Array.isArray(proofCards.proofCards)).toBe(true);
  });

  it('runs a live connector probe route through the connector executor', async () => {
    const db = new Database(':memory:');
    openDbs.push(db);
    const app = createApp();
    registerPromptShellRoutes(app, {
      db,
      evoAgent: createFakeAgent(),
      connectorExecutor: createConnectorExecutor({ response: { login: 'owner' } }),
    });
    const baseUrl = await listen(app);

    const probe = await fetch(`${baseUrl}/api/promptshell/connectors/github-1/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writeReceipt: false,
        ownerApproval: { granted: true, scope: 'provider_probe' },
      }),
    }).then((res) => res.json());

    expect(probe.success).toBe(true);
    expect(probe.probe.status).toBe('connected');
    expect(probe.probe.truthState).toBe('PROVEN');
  });

  it('classifies configured live bridge, device, and provider readiness without leaking secrets', () => {
    vi.stubEnv('JWT_SECRET', 'jwt-secret-that-must-not-leak');
    vi.stubEnv('PH_EVO_MASTER_KEY', 'master-key-that-must-not-leak');
    vi.stubEnv('OPENAI_API_KEY', 'sk-openai-that-must-not-leak');
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_stripe_that_must_not_leak');
    vi.stubEnv('VERCEL_TOKEN', 'vercel-token-that-must-not-leak');
    vi.stubEnv('PROMPTSHELL_DEVICE_ID', 'chrome');
    vi.stubEnv('PROMPTSHELL_DEVICE_PROOF', 'verified');

    const readiness = buildPromptShellLiveReadiness({
      databaseReady: true,
      requestBaseUrl: 'http://127.0.0.1:3001/api/promptshell',
    });

    expect(readiness.truthState).toBe('LIVE_READY');
    expect(readiness.providers.every((provider) => provider.configured)).toBe(true);
    expect(readiness.device.truthState).toBe('DEVICE_RUNTIME_PROVEN');
    const serialized = JSON.stringify(readiness);
    expect(serialized).not.toContain('jwt-secret-that-must-not-leak');
    expect(serialized).not.toContain('sk-openai-that-must-not-leak');
    expect(serialized).not.toContain('sk_test_stripe_that_must_not_leak');
    expect(serialized).not.toContain('vercel-token-that-must-not-leak');
  });
});

describe('phase 4 execution pipeline implementation file', () => {
  it('runs intent to manifest to connector proof to artifact without provider calls', async () => {
    const db = new Database(':memory:');
    openDbs.push(db);
    ensurePromptShellSchema(db);
    const pipeline = new RealExecutionPipeline({ db, evoAgent: createFakeAgent(), connectorExecutor: createConnectorExecutor() });

    const execution = await pipeline.executeWorkflow('Build a proof-backed chat shell');

    expect(execution.status).toBe('completed');
    expect(execution.steps.map((step) => step.name)).toEqual([
      'manifest_generated',
      'connectors_resolved',
      'handshakes_complete',
      'proof_generated',
      'artifact_created',
    ]);
    expect(db.prepare('SELECT COUNT(*) AS count FROM manifests').get().count).toBe(1);
    expect(db.prepare('SELECT COUNT(*) AS count FROM artifacts').get().count).toBe(1);
    expect(db.prepare('SELECT COUNT(*) AS count FROM sovereign_ledger').get().count).toBe(1);
  });

  it('can mark workflow proof as proven when live connector mode succeeds', async () => {
    const db = new Database(':memory:');
    openDbs.push(db);
    ensurePromptShellSchema(db);
    const pipeline = new RealExecutionPipeline({
      db,
      evoAgent: createFakeAgent(),
      connectorExecutor: createConnectorExecutor(),
    });

    const execution = await pipeline.executeWorkflow('Build a proof-backed chat shell', {
      connectorMode: 'live',
      ownerApproval: { granted: true, scope: 'provider_probe' },
    });
    const proof = execution.steps.find((step) => step.name === 'proof_generated');
    const ledger = db.prepare('SELECT truth_state FROM sovereign_ledger').get();

    expect(proof).toBeTruthy();
    expect(ledger.truth_state).toBe('PROVEN');
  });
});

describe('external connector API routes', () => {
  it('lists connector probe plans and runs top-level live probe route', async () => {
    const db = new Database(':memory:');
    openDbs.push(db);
    const app = createApp();
    registerExternalConnectorRoutes(app, { db, connectorExecutor: createConnectorExecutor() });
    const baseUrl = await listen(app);

    const connectors = await fetch(`${baseUrl}/api/connectors`).then((res) => res.json());
    expect(connectors.success).toBe(true);
    expect(connectors.connectors.some((connector) => connector.probePlan?.provider === 'github')).toBe(true);

    const probe = await fetch(`${baseUrl}/api/connectors/github-1/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writeReceipt: false,
        ownerApproval: { granted: true, scope: 'provider_probe' },
      }),
    }).then((res) => res.json());

    expect(probe.success).toBe(true);
    expect(probe.truthState).toBe('PROVEN');
  });
});
